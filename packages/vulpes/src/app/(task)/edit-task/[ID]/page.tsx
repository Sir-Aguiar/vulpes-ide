"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";

import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import {
  extractFunctionCodeFromProgram,
  extractFunctionFromProgram,
  IFunctionData,
  appendFunctionToCode,
} from "@/utils/code-extractor";
import { baseCode } from "@/utils/mocks";
import { CreateTaskSchema } from "../../../../@schemas/Task.schema";

import { CreateTaskDTO } from "@/@dtos/Task";
import ContentWrapper from "@/components/ContentWrapper/ContentWrapper";
import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";
import API from "@/services/API";
import { StepReview } from "../../new-task/components/StepReview";
import { StepTaskDescription } from "../../new-task/components/StepTaskDescription";
import { StepTestCases } from "../../new-task/components/StepTestCases";
import { StepClassSelection } from "../../new-task/components/StepClassSelection";
import useTestCases from "../../new-task/hooks/useTestCases";
import { toast } from "react-toastify";
import { IMyClassesResponse, IClassListItem } from "@/@types/Class";
import { ITask } from "@/@types/Task";

interface IClassTask {
  classId: string;
  taskId: string;
  class: {
    classId: string;
    name: string;
    code: number;
  };
}

interface ITaskWithClassTasks extends ITask {
  classTasks?: IClassTask[];
}

enum FormStep {
  TASK_DETAILS,
  TEST_CASES,
  CLASS_SELECTION,
  REVIEW,
}

const STEPS_LABELS = [
  "Detalhes da Tarefa & Código",
  "Casos de Teste",
  "Turmas",
  "Revisão",
];

export default function Page() {
  return (
    <AuthGuard requiredRoles={["PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <EditTaskContent />
    </AuthGuard>
  );
}

function EditTaskContent() {
  const { ID } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [code, setCode] = useState(baseCode);
  const [userFunctionData, setUserFunctionData] =
    useState<IFunctionData | null>(null);
  const [classes, setClasses] = useState<IClassListItem[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<IClassListItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingTask, setLoadingTask] = useState(true);
  const [originalTask, setOriginalTask] = useState<ITaskWithClassTasks | null>(null);

  const router = useRouter();
  const { testCases, addTestCase, removeTestCase, updateInput, updateOutput, setTestCases } =
    useTestCases(userFunctionData?.returnType);

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<CreateTaskDTO>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      inputMode: "PARAM",
      isVisible: true,
      isPublic: false,
      functionDef: "",
      classIds: [],
    },
  });

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      if (!ID) return;
      
      setLoadingTask(true);
      try {
        const response = await API.get<ITaskWithClassTasks>(`/task/${ID}`);
        const task = response.data;
        setOriginalTask(task);

        // Set form values
        reset({
          title: task.title,
          description: task.description,
          inputMode: task.inputMode as "PARAM" | "LEIA",
          isVisible: task.isVisible,
          isPublic: task.isPublic,
          functionDef: task.functionDef,
          taskParams: task.taskParams,
          classIds: task.classTasks?.map((ct) => ct.classId) || [],
        });

        // Set code
        const taskCode = appendFunctionToCode(baseCode, task.functionDef);
        setCode(taskCode);
        
        // Extract function data
        const functionData = extractFunctionFromProgram(taskCode);
        if (functionData) setUserFunctionData(functionData);

        // Set test cases
        if (task.taskTests && task.taskTests.length > 0) {
          setTestCases(
            task.taskTests.map((test: any) => ({
              testId: crypto.randomUUID(),
              input: Array.isArray(test.input) ? test.input : [test.input],
              expectedOutput: test.expectedOutput,
              expectedOutputType: test.expectedOutputType,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        toast.error("Erro ao carregar a tarefa.");
        router.push("/tasks");
      } finally {
        setLoadingTask(false);
      }
    };

    fetchTask();
  }, [ID, reset, router, setTestCases]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const response = await API.get<IMyClassesResponse>("/class/my-classes");
        setClasses(response.data.classes);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        toast.error("Erro ao carregar turmas.");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Set selected classes when both task and classes are loaded
  useEffect(() => {
    if (originalTask?.classTasks && classes.length > 0) {
      const taskClassIds = originalTask.classTasks.map((ct) => ct.classId);
      const selected = classes.filter((c) => taskClassIds.includes(c.classId));
      setSelectedClasses(selected);
    }
  }, [originalTask, classes]);

  useEffect(() => {
    setValue("classIds", selectedClasses.map((c) => c.classId));
  }, [selectedClasses, setValue]);

  const onEditorChange = useCallback((value: string | undefined) => {
    const val = value || "";
    const functionData = extractFunctionFromProgram(val);
    if (functionData) setUserFunctionData(functionData);
    setCode(val);
  }, []);

  useEffect(() => {
    if (userFunctionData) {
      setValue("functionDef", extractFunctionCodeFromProgram(code) ?? "");
      setValue("taskParams", userFunctionData.params);
    }
  }, [userFunctionData, code, setValue]);

  const onSubmit = async (data: CreateTaskDTO) => {
    try {
      console.log({ ...data, testCases });
      await API.put(`/task/${ID}`, { ...data, taskTests: testCases });
      toast.success("Tarefa atualizada com sucesso!");
      router.push("/tasks");
    } catch (error) {
      console.error("Erro ao atualizar tarefa", error);
      toast.error("Erro ao atualizar tarefa.");
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = () => {
    switch (activeStep) {
      case FormStep.TASK_DETAILS:
        return (
          <StepTaskDescription
            control={control}
            errors={errors}
            code={code}
            onCodeChange={onEditorChange}
          />
        );
      case FormStep.TEST_CASES:
        return (
          <StepTestCases
            testCases={testCases}
            userFunctionData={userFunctionData}
            onAdd={addTestCase}
            onRemove={removeTestCase}
            onInputChange={updateInput}
            onOutputChange={updateOutput}
          />
        );
      case FormStep.CLASS_SELECTION:
        return (
          <StepClassSelection
            classes={classes}
            selectedClasses={selectedClasses}
            onSelectionChange={setSelectedClasses}
            loading={loadingClasses}
          />
        );
      case FormStep.REVIEW:
        return (
          <StepReview control={control} code={code} testCases={testCases} selectedClasses={selectedClasses} />
        );
      default:
        return null;
    }
  };

  if (loadingTask) {
    return (
      <ContentWrapper>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <form
        className="w-full h-screen flex flex-col gap-2 py-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="px-4">
          <h1 className="text-2xl font-bold mb-2">Editar Tarefa</h1>
          <p className="text-sm opacity-70 mb-4">
            Editando: {originalTask?.title}
          </p>
        </div>

        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS_LABELS.map((step) => (
            <Step key={step}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="flex-1 w-full relative p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${activeStep}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full flex items-center pb-2 gap-2 px-2">
          <Button disabled={activeStep === 0} onClick={handleBack} fullWidth>
            Voltar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (activeStep === STEPS_LABELS.length - 1) {
                handleSubmit(onSubmit)();
              } else {
                handleNext();
              }
            }}
            fullWidth
            disabled={
              activeStep === FormStep.TASK_DETAILS &&
              (!userFunctionData || !watch("title") || !watch("description"))
            }
            type="button"
          >
            {activeStep === STEPS_LABELS.length - 1
              ? "Salvar Alterações"
              : "Próximo"}
          </Button>
        </div>
      </form>
    </ContentWrapper>
  );
}

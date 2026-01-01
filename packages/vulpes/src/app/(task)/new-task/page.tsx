"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";

import {
  extractFunctionCodeFromProgram,
  extractFunctionFromProgram,
  IFunctionData,
} from "@/utils/code-extractor";
import { baseCode } from "@/utils/mocks";
import { CreateTaskSchema } from "../../../@schemas/CreateTask.schema";

import { StepReview } from "./components/StepReview";
import { StepTaskDescription } from "./components/StepTaskDescription";
import { StepTestCases } from "./components/StepTestCases";
import useTestCases from "./hooks/useTestCases";
import { CreateTaskDTO } from "@/@dtos/Task";
import ContentWrapper from "@/components/ContentWrapper/ContentWrapper";

enum FormStep {
  TASK_DETAILS,
  TEST_CASES,
  REVIEW,
}

const STEPS_LABELS = [
  "Detalhes da Tarefa & Código",
  "Casos de Teste",
  "Revisão",
];

export default function Page() {
  const [activeStep, setActiveStep] = useState(0);
  const [code, setCode] = useState(baseCode);
  const [userFunctionData, setUserFunctionData] =
    useState<IFunctionData | null>(null);

  const { testCases, addTestCase, removeTestCase, updateInput, updateOutput } =
    useTestCases();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<CreateTaskDTO>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      inputMode: "params",
      isVisible: false,
      functionDef: "",
    },
  });

  const onEditorChange = useCallback((value: string | undefined) => {
    const val = value || "";
    const functionData = extractFunctionFromProgram(val);
    if (functionData) setUserFunctionData(functionData);
    setCode(val);
  }, []);

  useEffect(() => {
    if (userFunctionData) {
      setValue("functionDef", extractFunctionCodeFromProgram(code) ?? "");
      setValue("params", userFunctionData.params);
    }
  }, [userFunctionData, code, setValue]);

  const onSubmit = async (data: CreateTaskDTO) => {
    try {
      console.log({ ...data, testCases });
      await axios.post("/api/task", { ...data, testCases });
    } catch (error) {
      console.error("Erro ao salvar tarefa", error);
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
      case FormStep.REVIEW:
        return (
          <StepReview control={control} code={code} testCases={testCases} />
        );
      default:
        return null;
    }
  };

  return (
    <ContentWrapper>
      <form
        className="w-full h-screen flex flex-col gap-2 py-4"
        onSubmit={handleSubmit(onSubmit)}
      >
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
            onClick={
              activeStep === STEPS_LABELS.length - 1 ? undefined : handleNext
            }
            fullWidth
            disabled={
              activeStep === FormStep.TASK_DETAILS &&
              (!userFunctionData || !watch("title") || !watch("description"))
            }
            type={activeStep === STEPS_LABELS.length - 1 ? "submit" : "button"}
          >
            {activeStep === STEPS_LABELS.length - 1
              ? "Publicar Tarefa"
              : "Próximo"}
          </Button>
        </div>
      </form>
    </ContentWrapper>
  );
}

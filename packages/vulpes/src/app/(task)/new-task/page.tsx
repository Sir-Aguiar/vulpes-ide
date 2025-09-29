"use client";

import RHFTextField from "@/components/RHF/TextField";
import { extractFunctionTypeAndParams, IFunctionData } from "@/utils/code-extractor";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  IconButton,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { CodeDetailsSchema, CreateTaskDTO, CreateTaskSchema, TaskDetailsSchema } from "./schemas/CreateTask.schema";

enum FormStep {
  TASK_AND_CODE = 0,
  TEST_CASES = 1,
}

const steps = [
  { label: "Detalhes da Tarefa", icon: <CodeIcon /> },
  { label: "Casos de Teste", icon: <PlaylistAddCheckIcon /> },
];

export default function Page() {
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
    handleSubmit,
    watch,
  } = useForm<CreateTaskDTO>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      functionDef: "",
      testCases: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "testCases",
  });

  const [activeStep, setActiveStep] = useState<FormStep>(FormStep.TASK_AND_CODE);
  const [direction, setDirection] = useState(1);
  const [functionData, setFunctionData] = useState<IFunctionData | null>(null);

  const watchedFunctionDef = watch("functionDef");

  const nextStep = () => {
    clearErrors();

    if (activeStep === FormStep.TASK_AND_CODE) {
      const { title, description, functionDef } = getValues();

      // Validar detalhes da tarefa
      const taskParsed = TaskDetailsSchema.safeParse({ title, description });
      if (!taskParsed.success) {
        return taskParsed.error.issues.forEach(issue => {
          setError(issue.path[0] as keyof CreateTaskDTO, { message: issue.message });
        });
      }

      // Validar código
      const codeParsed = CodeDetailsSchema.safeParse({ functionDef });
      if (!codeParsed.success) {
        return codeParsed.error.issues.forEach(issue => {
          setError(issue.path[0] as keyof CreateTaskDTO, { message: issue.message });
        });
      }

      const extractedData = extractFunctionTypeAndParams(functionDef);
      if (!extractedData) {
        setError("functionDef", { message: "Não foi possível extrair os dados da função. Verifique a sintaxe." });
        return;
      }

      setFunctionData(extractedData);
      setDirection(1);
      setActiveStep(FormStep.TEST_CASES);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (activeStep === FormStep.TEST_CASES) {
      setActiveStep(FormStep.TASK_AND_CODE);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const onSubmit = async (data: CreateTaskDTO) => {
    const cleanData = JSON.parse(JSON.stringify(data));

    try {
      const response = await axios.post("/api/task", cleanData);
      console.log("Task created successfully:", response.data);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Paper
        component={motion.form}
        onSubmit={handleSubmit(onSubmit)}
        layout
        transition={{ duration: 0.4, ease: "easeInOut" }}
        elevation={3}
        className="w-full max-w-4xl min-h-[855px] rounded-2xl overflow-hidden"
        sx={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      >
        {/* Header com Stepper */}
        <Box sx={{ bgcolor: "primary.main", color: "white", p: 3 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              "& .MuiStepLabel-label": { color: "white" },
              "& .MuiStepIcon-root": { color: "rgba(255,255,255,0.5)" },
              "& .MuiStepIcon-root.Mui-active": { color: "white" },
              "& .MuiStepIcon-root.Mui-completed": { color: "white" },
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel icon={step.icon}>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          {activeStep === FormStep.TASK_AND_CODE && (
            <motion.div
              key={FormStep.TASK_AND_CODE}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            >
              <Box p={4}>
                <Stack spacing={4}>
                  {/* Seção de Detalhes da Tarefa */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CodeIcon color="primary" />
                        Informações da Atividade
                      </Typography>
                      <Stack spacing={3}>
                        <RHFTextField
                          control={control}
                          errors={errors}
                          name="title"
                          label="Título da Atividade"
                          placeholder="Ex: Calcular soma de dois números"
                        />
                        <RHFTextField
                          control={control}
                          errors={errors}
                          name="description"
                          label="Descrição"
                          placeholder="Descreva o objetivo da atividade..."
                          multiline
                          rows={3}
                        />
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Seção de Código */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PlaylistAddCheckIcon color="primary" />
                        Definição da Função
                      </Typography>
                      <Stack spacing={2}>
                        <RHFTextField
                          control={control}
                          errors={errors}
                          name="functionDef"
                          label="Assinatura da função"
                          placeholder="funcao real soma(real a, real b)"
                        />
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          <Typography variant="body2">
                            <strong>Formato esperado:</strong>{" "}
                            <code>funcao [tipo_retorno] [nome]([tipo] [param1], [tipo] [param2], ...)</code>
                          </Typography>
                        </Alert>

                        {/* Preview da função extraída */}
                        {watchedFunctionDef && (
                          <Fade in={true}>
                            <Paper sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Preview da Função:
                              </Typography>
                              <Box sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                                <code>{watchedFunctionDef}</code>
                              </Box>
                            </Paper>
                          </Fade>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Botão de Ação */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={nextStep}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ minWidth: 160, borderRadius: 3 }}
                    >
                      Próximo
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          )}

          {activeStep === FormStep.TEST_CASES && functionData && (
            <motion.div
              key={FormStep.TEST_CASES}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            >
              <Box p={4} sx={{ overflow: "hidden" }}>
                <Stack spacing={4} justifyContent="space-between">
                  {/* Resumo da Função */}
                  <Card variant="outlined" sx={{ bgcolor: "primary.50" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon color="primary" />
                        Resumo da Função
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                        <Chip label={`Nome: ${functionData.functionName}`} variant="outlined" />
                        <Chip label={`Retorno: ${functionData.returnType}`} variant="outlined" />
                        <Chip label={`Parâmetros: ${functionData.params.length}`} variant="outlined" />
                      </Box>
                      {functionData.params.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Parâmetros:</strong>{" "}
                            {functionData.params.map((p: any) => `${p.type} ${p.name}`).join(", ")}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* Casos de Teste */}
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Typography variant="h6">Casos de Teste</Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => append({ input: functionData.params.map(() => ""), expectedOutput: "" })}
                          sx={{ borderRadius: 2 }}
                        >
                          Adicionar Teste
                        </Button>
                      </Box>

                      {fields.length === 0 ? (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                          Adicione pelo menos um caso de teste para validar sua função.
                        </Alert>
                      ) : (
                        <Stack spacing={3} sx={{ maxHeight: 300, overflowY: "auto", pr: 1 }}>
                          {fields.map((field, index) => (
                            <Paper
                              key={field.id}
                              variant="outlined"
                              sx={{ p: 3, position: "relative", borderRadius: 2 }}
                            >
                              <Box
                                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
                              >
                                <Typography variant="subtitle1" fontWeight="medium">
                                  Teste {index + 1}
                                </Typography>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => remove(index)}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>

                              <Stack spacing={2}>
                                {functionData.params.map((param: any, paramIndex: any) => (
                                  <RHFTextField
                                    key={param.name}
                                    control={control}
                                    errors={errors}
                                    name={`testCases.${index}.input.${paramIndex}`}
                                    label={`${param.name}`}
                                    placeholder={`Valor para ${param.name} (${param.type})`}
                                    size="small"
                                  />
                                ))}
                                <Divider sx={{ my: 1 }} />
                                <RHFTextField
                                  control={control}
                                  errors={errors}
                                  name={`testCases.${index}.expectedOutput`}
                                  label="Resultado Esperado"
                                  placeholder={`Valor esperado (${functionData.returnType})`}
                                  size="small"
                                />
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>

                  {/* Botões de Navegação */}
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={prevStep}
                      startIcon={<ArrowBackIcon />}
                      sx={{ minWidth: 160, borderRadius: 3 }}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      type="submit"
                      startIcon={<CheckCircleIcon />}
                      sx={{ minWidth: 160, borderRadius: 3 }}
                      disabled={fields.length === 0}
                    >
                      Criar Atividade
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </main>
  );
}

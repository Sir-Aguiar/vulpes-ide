"use client";

import RHFTextField from "@/components/RHF/TextField";
import { extractFunctionTypeAndParams, IFunctionData } from "@/utils/code-extractor";
import { zodResolver } from "@hookform/resolvers/zod";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { CodeDetailsSchema, CreateTaskDTO, CreateTaskSchema, TaskDetailsSchema } from "./schemas/CreateTask.schema";

enum Step {
  TASK_DETAILS = "task-details",
  CODE_DETAILS = "code-details",
  CODE_TEST = "code-test",
}

/*
  - Titulo
  - Descricao

  - Quantas funções serão usadas
  - Qual o nome de cada função

  - Test cases
*/

export default function Page() {
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
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

  const [formStep, setFormStep] = useState<Step>(Step.TASK_DETAILS);
  const [direction, setDirection] = useState(1);
  const [functionData, setFunctionData] = useState<IFunctionData | null>(null);

  const nextStep = () => {
    clearErrors();

    let parsed;

    if (formStep === Step.TASK_DETAILS) {
      const { title, description } = getValues();
      parsed = TaskDetailsSchema.safeParse({ title, description });

      if (!parsed.success) {
        return parsed.error.issues.forEach(issue => {
          setError(issue.path[0] as keyof CreateTaskDTO, { message: issue.message });
        });
      }

      setDirection(1);
      setFormStep(Step.CODE_DETAILS);
    }

    if (formStep === Step.CODE_DETAILS) {
      const { functionDef } = getValues();
      parsed = CodeDetailsSchema.safeParse({ functionDef });

      if (!parsed.success) {
        return parsed.error.issues.forEach(issue => {
          setError(issue.path[0] as keyof CreateTaskDTO, { message: issue.message });
        });
      }

      const functionData = extractFunctionTypeAndParams(functionDef);

      if (!functionData) {
        setError("functionDef", { message: "Não foi possível extrair os dados da função. Verifique a sintaxe." });
        return;
      }

      setFunctionData(functionData);
      setDirection(1);
      setFormStep(Step.CODE_TEST);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (formStep === Step.CODE_DETAILS) {
      setFormStep(Step.TASK_DETAILS);
    }
    if (formStep === Step.CODE_TEST) {
      setFormStep(Step.CODE_DETAILS);
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

  return (
    <main className="h-screen w-full flex items-center justify-center bg-gray-50 p-4 overflow-hidden">
      <Paper
        component={motion.div}
        layout
        transition={{ duration: 0.4, ease: "easeInOut" }}
        elevation={1}
        className="w-full max-w-md rounded-xl overflow-hidden"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {formStep === Step.TASK_DETAILS && (
            <motion.div
              key={Step.TASK_DETAILS}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            >
              <Stack spacing={3} p={4}>
                <Typography variant="h5" component="h1" className="font-bold text-center">
                  Cadastrar Nova Atividade
                </Typography>
                <RHFTextField control={control} errors={errors} name="title" label="Título" />
                <RHFTextField
                  control={control}
                  errors={errors}
                  name="description"
                  label="Descrição"
                  multiline
                  rows={3}
                />
                <Button variant="contained" size="large" onClick={nextStep} className="!mt-4">
                  Próximo
                </Button>
              </Stack>
            </motion.div>
          )}

          {formStep === Step.CODE_DETAILS && (
            <motion.div
              key={Step.CODE_DETAILS}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            >
              <Stack spacing={3} p={4}>
                <Typography variant="h5" component="h1" className="font-bold text-center">
                  Detalhes do Código
                </Typography>
                <RHFTextField
                  control={control}
                  errors={errors}
                  name="functionDef"
                  label="Definição da função principal"
                />
                <Box className="text-sm text-center text-gray-600 bg-gray-100 p-2 rounded-md">
                  Exemplo: <code>funcao real soma(real a, real b)</code>
                </Box>
                <Stack direction="row" spacing={2} className="!mt-4">
                  <Button variant="outlined" size="large" onClick={prevStep} fullWidth>
                    Voltar
                  </Button>
                  <Button variant="contained" size="large" onClick={nextStep} fullWidth>
                    Próximo
                  </Button>
                </Stack>
              </Stack>
            </motion.div>
          )}

          {formStep === Step.CODE_TEST && functionData && (
            <motion.div
              key={Step.CODE_TEST}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            >
              <Stack spacing={3} p={4}>
                <Typography variant="h5" component="h1" className="font-bold text-center">
                  Casos de Teste
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="h6" gutterBottom>
                    Resumo da Função
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nome:</strong> {functionData.functionName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Retorno:</strong> {functionData.returnType}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Parâmetros:</strong>{" "}
                    {functionData.params.map((p: any) => `${p.type} ${p.name}`).join(", ") || "Nenhum"}
                  </Typography>
                </Paper>

                <Divider>Testes</Divider>

                <Stack spacing={3}>
                  {fields.map((field, index) => (
                    <Paper key={field.id} variant="outlined" sx={{ p: 2, position: "relative" }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Teste {index + 1}
                      </Typography>
                      <Stack spacing={2}>
                        {functionData.params.map((param: any, paramIndex: any) => (
                          <RHFTextField
                            key={param.name}
                            control={control}
                            errors={errors}
                            name={`testCases.${index}.input.${paramIndex}`}
                            label={`Parâmetro: ${param.name} (${param.type})`}
                          />
                        ))}
                        <RHFTextField
                          control={control}
                          errors={errors}
                          name={`testCases.${index}.expectedOutput`}
                          label={`Retorno Esperado (${functionData.returnType})`}
                        />
                      </Stack>
                      <IconButton
                        aria-label="delete"
                        onClick={() => remove(index)}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>

                <Button
                  variant="outlined"
                  onClick={() => append({ input: functionData.params.map(() => ""), expectedOutput: "" })}
                >
                  Adicionar Caso de Teste
                </Button>

                <Stack direction="row" spacing={2} className="!mt-4">
                  <Button variant="outlined" size="large" onClick={prevStep} fullWidth>
                    Voltar
                  </Button>
                  <Button variant="contained" size="large" onClick={() => {}} fullWidth>
                    Finalizar
                  </Button>
                </Stack>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </main>
  );
}

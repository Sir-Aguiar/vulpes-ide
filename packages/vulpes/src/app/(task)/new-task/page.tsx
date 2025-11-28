"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateTaskDTO, CreateTaskSchema, ICodeTest, IParam } from "./schemas/CreateTask.schema";
import RHFTextField from "@/components/RHF/TextField";
import { Editor } from "@monaco-editor/react";
import { registerPortugolLanguage } from "../../../../libs/monaco-config";
import { baseCode } from "@/utils/mocks";
import { ChangeEventHandler, useEffect, useMemo, useState } from "react";
import RHFCheckBox from "@/components/RHF/CheckBox";
import RHFSelect from "@/components/RHF/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import {
  extractFunctionCodeFromProgram,
  extractFunctionFromProgram,
  extractUserFunction,
  IFunctionData,
} from "@/utils/code-extractor";
import TextField from "@mui/material/TextField";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import RHFMDEditor from "@/components/RHF/MarkdownEditor";

export default function Page() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
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

  function handleEditorDidMount(editorInstance: any, monacoInstance: any) {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  }

  const [code, setCode] = useState(baseCode);
  const [userFunctionData, setUserFunctionData] = useState<IFunctionData | null>(null);

  const onEditorChange = (value: string | undefined) => {
    const functionData = extractFunctionFromProgram(value || "");

    if (functionData) {
      setUserFunctionData(functionData);
    }

    setCode(value || "");
  };

  useEffect(() => {
    if (userFunctionData) {
      setValue("functionDef", extractFunctionCodeFromProgram(code) ?? "");
    }
  }, [userFunctionData]);

  const [testCases, setTestCases] = useState<(ICodeTest & { id: number })[]>([]);

  const addTestCase = () => {
    /*
      {
        inputs: ["", ""]
        output: ""
      }

      Se os parâmetros forem do tipo array, o input deve ser um array também

      Exemplo:

      {
        inputs: ["1 2 3 4 5", "6 7 8 9 10"]
        output: "1"
      }
    */

    const newTest: ICodeTest & { id: number } = { id: Date.now(), input: [""], expectedOutput: "" };
    setTestCases(prev => [...prev, newTest]);
  };

  const onTestParamChange: ChangeEventHandler<HTMLInputElement> = e => {
    const [testId, , paramIndex] = e.target.name.split("-");

    setTestCases(prev => {
      return prev.map(test => {
        if (test.id === Number(testId)) {
          const newInputs = [...test.input];
          newInputs[Number(paramIndex)] = e.target.value;
          return { ...test, input: newInputs };
        }
        return test;
      });
    });
  };

  const onTestOutputChange: ChangeEventHandler<HTMLInputElement> = e => {
    const [testId] = e.target.name.split("-");

    setTestCases(prev => {
      return prev.map(test => {
        if (test.id === Number(testId)) {
          return { ...test, expectedOutput: e.target.value };
        }
        return test;
      });
    });
  };

  const params: IParam[] = useMemo(() => {
    if (userFunctionData) {
      return userFunctionData.params;
    }

    return [];
  }, [userFunctionData]);

  useEffect(() => {
    setValue("params", params);
  }, [params]);

  const onSubmit = async (data: CreateTaskDTO) => {
    console.log({ ...data, testCases });
    await axios.post("/api/task", { ...data, testCases });
  };

  return (
    <form className="w-full min-h-screen h-screen flex p-4 gap-2" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full h-full flex flex-col gap-4 p-2">
        <RHFTextField control={control} label="Título" name="title" errors={errors} sx={{ minWidth: "328px" }} />
        <RHFMDEditor control={control} name="description" errors={errors} height="100%" value="# Hello World" />
        <Divider />
        <div className="w-full h-full flex-1 flex flex-col ">
          <RHFSelect control={control} name="inputMode" label="A entra dos dados será por" errors={errors}>
            <MenuItem value="params">Parâmetros</MenuItem>
          </RHFSelect>
          <RHFCheckBox control={control} name="isVisible" label="Privado" errors={errors} />
        </div>
        <div className="w-full py-2 mt-auto flex items-center gap-2">
          <Button fullWidth>Voltar</Button>
          <Button fullWidth variant="contained" type="submit">
            Salvar
          </Button>
        </div>
      </div>
      <div className="w-full h-full flex flex-col gap-2 p-2 rounded-sm">
        <div className="w-full">
          <Editor
            height="312px"
            theme="vs-dark"
            language="portugol"
            onMount={handleEditorDidMount}
            value={code}
            onChange={onEditorChange}
          />
        </div>
        <div className="w-full h-full flex flex-col gap-4 overflow-auto">
          <span className="w-full text-center text-sm opacity-60 my-1">
            Insira no editor a definição da função em que o aluno deverá desenvolver seu algoritmo
          </span>
          <span className="w-full text-center text-sm opacity-60">
            Ex: <code>funcao inteiro somar() &#123; &#125;</code>
          </span>
          {userFunctionData && (
            <Button startIcon={<AddIcon />} sx={{ marginY: 2 }} onClick={addTestCase}>
              Adicionar Teste
            </Button>
          )}

          <AnimatePresence>
            {testCases.map(({ id }, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full p-2 rounded-sm flex flex-col gap-2">
                  <span className="w-full text-sm opacity-60">Caso de Teste {index + 1}</span>
                  {userFunctionData &&
                    userFunctionData.params.map((param, paramIndex) => (
                      <TextField
                        key={paramIndex}
                        name={`${id}-param-${paramIndex}`}
                        label={`Parâmetro ${param.name} (${param.type})`}
                        helperText={
                          param.type.toLowerCase().includes("vetor")
                            ? "Insira os valores separados por espaço. Ex: 1 2 3 4 5"
                            : ""
                        }
                        onChange={onTestParamChange}
                      />
                    ))}
                  <TextField
                    label="Saída Esperada"
                    helperText="Insira o valor que deve retornar para este teste"
                    name={`${id}-${index}-output`}
                    onChange={onTestOutputChange}
                  />

                  {/* Remove button */}
                  <div className="w-full flex justify-end">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setTestCases(prev => prev.filter(testCase => testCase.id !== id))}
                    >
                      Remover Teste
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}

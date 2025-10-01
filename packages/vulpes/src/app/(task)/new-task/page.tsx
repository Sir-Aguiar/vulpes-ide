"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateTaskDTO, CreateTaskSchema } from "./schemas/CreateTask.schema";
import RHFTextField from "@/components/RHF/TextField";
import { Editor } from "@monaco-editor/react";
import { registerPortugolLanguage } from "../../../../libs/monaco-config";
import { baseCode } from "@/utils/mocks";
import { useState } from "react";
import RHFCheckBox from "@/components/RHF/CheckBox";
import RHFSelect from "@/components/RHF/Select";
import MenuItem from "@mui/material/MenuItem";

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
  });

  const onSubmit = async (data: CreateTaskDTO) => {
    console.log(data);
  };

  function handleEditorDidMount(editorInstance: any, monacoInstance: any) {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  }

  const [code, setCode] = useState(baseCode);

  return (
    <main className="w-full min-h-screen h-screen flex p-4 gap-2">
      <div className="p-2 h-full flex flex-col gap-4 ">
        <RHFTextField control={control} label="Título" name="title" errors={errors} sx={{ minWidth: "328px" }} />
        <RHFTextField control={control} label="Descrição" name="description" errors={errors} rows={8} multiline />
      </div>
      <div className="w-full h-full flex flex-col gap-2  p-2 rounded-sm">
        <div className="w-full">
          <Editor
            height="312px"
            theme="vs-dark"
            language="portugol"
            onMount={handleEditorDidMount}
            value={code}
            onChange={value => setCode(value!)}
          />
        </div>
        <div className="w-full h-full flex gap-2">
          <div className="w-full h-full flex-1 flex flex-col ">
            <RHFCheckBox control={control} name="isVisible" label="Visível" errors={errors} />
            <RHFSelect control={control} name="inputPattern" label="Modelo" errors={errors}>
              <MenuItem value="default">Padrão</MenuItem>
              <MenuItem value="custom">Customizado</MenuItem>
            </RHFSelect>
          </div>
          <div className="w-full h-full flex-1 flex flex-col "></div>
        </div>
      </div>
    </main>
  );
}

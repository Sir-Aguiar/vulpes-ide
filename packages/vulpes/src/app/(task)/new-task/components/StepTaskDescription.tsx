import RHFMDEditor from "@/components/RHF/MarkdownEditor";
import RHFSelect from "@/components/RHF/Select";
import RHFTextField from "@/components/RHF/TextField";
import { Editor } from "@monaco-editor/react";
import MenuItem from "@mui/material/MenuItem";
import { Control, FieldErrors } from "react-hook-form";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";
import { CreateTaskDTO } from "@/@dtos/Task";

export const StepTaskDescription = ({
  control,
  errors,
  code,
  onCodeChange,
}: {
  control: Control<CreateTaskDTO>;
  errors: FieldErrors<CreateTaskDTO>;
  code: string;
  onCodeChange: (value: string | undefined) => void;
}) => {
  const handleEditorDidMount = (editorInstance: any, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto pr-2">
      <RHFTextField
        control={control}
        label="Título"
        name="title"
        errors={errors}
        sx={{ minWidth: "328px" }}
      />

      <div className="flex flex-col gap-1 min-h-[500px]">
        <span className="text-sm opacity-70">Descrição da Tarefa</span>
        <RHFMDEditor
          control={control}
          name="description"
          errors={errors}
          height="100%"
        />
      </div>

      <div className="w-full flex flex-col gap-2 p-2 rounded-sm border border-gray-100/10 mt-2">
        <h3 className="text-lg font-medium mb-2">Definição do Código</h3>
        <RHFSelect
          control={control}
          name="inputMode"
          label="A entrada dos dados será por"
          errors={errors}
        >
          <MenuItem value="PARAM">Parâmetros</MenuItem>
          <MenuItem value="LEIA">Leia()</MenuItem>
        </RHFSelect>

        <div className="h-[400px] border border-gray-700 rounded overflow-hidden">
          <Editor
            height="100%"
            theme="vs-dark"
            language="portugol"
            onMount={handleEditorDidMount}
            value={code}
            onChange={onCodeChange}
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <span className="w-full text-center text-sm opacity-60">
            Insira no editor a definição da função em que o aluno deverá
            desenvolver seu algoritmo
          </span>
          <span className="w-full text-center text-sm opacity-60">
            Ex: <code>funcao inteiro somar() &#123; &#125;</code>
          </span>
        </div>
      </div>
    </div>
  );
};

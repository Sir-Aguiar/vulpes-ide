"use client";

import { CreateTaskDTO } from "@/@dtos/Task";
import RHFCheckBox from "@/components/RHF/CheckBox";
import RHFMDEditor from "@/components/RHF/MarkdownEditor";
import RHFSelect from "@/components/RHF/Select";
import RHFTextField from "@/components/RHF/TextField";
import { useAppTheme } from "@/providers/ColorModeProvider";
import MenuItem from "@mui/material/MenuItem";
import { Box, Typography } from "@mui/material";
import { Editor } from "@monaco-editor/react";
import { Control, FieldErrors } from "react-hook-form";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";

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
  const theme = useAppTheme();

  const handleEditorDidMount = (editorInstance: unknown, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
        pr: 1,
        color: theme.text,
      }}
    >
      <RHFTextField
        control={control}
        label="Título"
        name="title"
        errors={errors}
        sx={{ minWidth: "328px" }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minHeight: 500 }}>
        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
          Descrição da Tarefa
        </Typography>
        <RHFMDEditor
          control={control}
          name="description"
          errors={errors}
          height="100%"
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: theme.border,
          mt: 1,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Definição do Código
        </Typography>
        <RHFSelect
          control={control}
          name="inputMode"
          label="A entrada dos dados será por"
          errors={errors}
        >
          <MenuItem value="PARAM">Parâmetros</MenuItem>
          <MenuItem value="LEIA">Leia()</MenuItem>
        </RHFSelect>

        <Box
          sx={{
            height: 400,
            border: "1px solid",
            borderColor: theme.border,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: theme.codeBg,
          }}
        >
          <Editor
            height="100%"
            theme="vs-dark"
            language="portugol"
            onMount={handleEditorDidMount}
            value={code}
            onChange={onCodeChange}
          />
        </Box>

        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="body2" sx={{ textAlign: "center", color: theme.textMuted }}>
            Insira no editor a definição da função em que o aluno deverá
            desenvolver seu algoritmo
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center", color: theme.textMuted }}>
            Ex: <code>funcao inteiro somar() &#123; &#125;</code>
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: theme.border,
          mt: 1,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Visibilidade da Tarefa
        </Typography>
        <RHFCheckBox
          control={control}
          name="isVisible"
          label="Tarefa visível (aparece nas listagens)"
          errors={errors}
        />
        <RHFCheckBox
          control={control}
          name="isPublic"
          label="Tarefa pública (outros professores podem usar)"
          errors={errors}
        />
      </Box>
    </Box>
  );
};

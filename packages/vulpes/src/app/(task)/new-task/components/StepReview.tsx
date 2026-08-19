"use client";

import { IClassListItem } from "@/@types/Class";
import { CreateTaskDTO } from "@/@dtos/Task";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { Box, Typography } from "@mui/material";
import { Editor } from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";
import { Control, useWatch } from "react-hook-form";
import { TestWithId } from "../hooks/useTestCases";

interface StepReviewProps {
  control: Control<CreateTaskDTO>;
  code: string;
  testCases: TestWithId[];
  selectedClasses?: IClassListItem[];
}

export const StepReview = ({
  control,
  code,
  testCases,
  selectedClasses = [],
}: StepReviewProps) => {
  const theme = useAppTheme();
  const values = useWatch({ control });

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        overflowY: "auto",
        color: theme.text,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {values.title || "Sem título"}
        </Typography>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase", mb: 1, display: "block" }}>
            Descrição
          </Typography>
          <Box data-color-mode={theme.mode}>
            <MDEditor
              value={values.description}
              preview="preview"
              height="500px"
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Código Base
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Modo de Entrada:</strong>{" "}
          {values.inputMode === "params"
            ? "Parâmetros da Função"
            : "Comando Leia()"}
        </Typography>
        <Box
          sx={{
            height: 256,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: theme.codeBg,
            border: "1px solid",
            borderColor: theme.border,
          }}
        >
          <Editor
            theme="vs-dark"
            language="portugol"
            value={code}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Casos de Teste ({testCases.length})
        </Typography>
        {testCases.length === 0 && (
          <Typography variant="body2" fontStyle="italic" sx={{ color: theme.textMuted }}>
            Nenhum caso de teste adicionado.
          </Typography>
        )}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1 }}>
          {testCases.map((test, index) => (
            <Box
              key={test.testId}
              sx={{
                p: 1.5,
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                bgcolor: theme.bgCard,
                border: "1px solid",
                borderColor: theme.border,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ textTransform: "uppercase", color: theme.textMuted, mb: 0.5 }}
              >
                Teste {index + 1}
              </Typography>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 600, color: theme.brand }}>
                  Entrada:
                </Box>{" "}
                <Box
                  component="span"
                  sx={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    bgcolor: theme.hover,
                    px: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {test.input.join(", ")}
                </Box>
              </Typography>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 600, color: "success.main" }}>
                  Saída Esperada:
                </Box>{" "}
                <Box
                  component="span"
                  sx={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    bgcolor: theme.hover,
                    px: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {test.expectedOutput}
                </Box>
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Configurações
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: theme.border }}>
            <Typography component="span" variant="body2" fontWeight={600}>
              Visibilidade:
            </Typography>{" "}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: values.isVisible ? "success.main" : "warning.main" }}
            >
              {values.isVisible ? "Visível" : "Oculta"}
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: theme.border }}>
            <Typography component="span" variant="body2" fontWeight={600}>
              Acesso:
            </Typography>{" "}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: values.isPublic ? "info.main" : theme.brand }}
            >
              {values.isPublic ? "Pública" : "Privada"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {selectedClasses.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Turmas Vinculadas ({selectedClasses.length})
          </Typography>
          <Box sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: theme.border }}>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {selectedClasses.map((classItem) => (
                <Typography key={classItem.classId} component="li" variant="body2">
                  {classItem.name}{" "}
                  <Box component="span" sx={{ color: theme.textMuted }}>
                    (Código: {classItem.code})
                  </Box>
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

"use client";

import { useAppTheme } from "@/providers/ColorModeProvider";
import { ICompileError, ITestCaseResult } from "@/utils/code-tester";
import { Box, Typography } from "@mui/material";
import CheckIcon from "../../../public/icons/CheckIcon";
import XIcon from "../../../public/icons/XIcon";

interface IExecutionOutputProps {
  compileErrors: ICompileError[];
  lastResults: ITestCaseResult[];
  isRunning: boolean;
}

function formatValue(value: unknown): string {
  if (value == null) return "(sem saída)";
  const text = String(value);
  return text.length === 0 ? "(vazio)" : text;
}

function formatInput(input: unknown): string {
  if (Array.isArray(input)) {
    return input.map((item) => String(item)).join(", ");
  }
  if (input == null) return "—";
  return String(input);
}

export function ExecutionOutput({
  compileErrors,
  lastResults,
  isRunning,
}: IExecutionOutputProps) {
  const theme = useAppTheme();
  const passedCount = lastResults.filter((result) => result.passed).length;
  const failedCount = lastResults.length - passedCount;

  if (isRunning) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          color: theme.textSecondary,
          fontSize: 14,
        }}
      >
        Executando testes...
      </Box>
    );
  }

  if (compileErrors.length > 0) {
    return (
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: theme.bgElevated,
          border: "1px solid #ef44444d",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            bgcolor: "rgba(239, 68, 68, 0.1)",
            borderBottom: "1px solid #ef444433",
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              color: "#ef4444",
              "& svg": { width: "100%", height: "100%" },
            }}
          >
            <XIcon />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#f87171" }}>
            {compileErrors.length === 1
              ? "1 erro de compilação"
              : `${compileErrors.length} erros de compilação`}
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, px: 2, py: 1, listStyle: "none" }}>
          {compileErrors.map((err, idx) => (
            <Box
              component="li"
              key={`${err.line}-${err.column}-${idx}`}
              sx={{
                fontSize: 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                py: 0.25,
                color: "#fca5a5",
              }}
            >
              <Box component="span" sx={{ color: theme.textMuted, mr: 1 }}>
                [{err.kind === "parse" ? "sintaxe" : "semântico"}]
              </Box>
              <Box component="span" sx={{ color: theme.textSecondary, mr: 1 }}>
                linha {err.line}, coluna {err.column}:
              </Box>
              <Box component="span">
                {err.message || "Erro sem mensagem do compilador."}
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            px: 2,
            py: 1,
            fontSize: 11,
            color: theme.textMuted,
            borderTop: "1px solid",
            borderColor: theme.border,
          }}
        >
          Corrija os erros acima para que os testes sejam executados.
        </Box>
      </Box>
    );
  }

  if (lastResults.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          color: theme.textMuted,
          fontSize: 14,
        }}
      >
        Execute o código para ver os resultados.
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: theme.bgElevated,
          border: "1px solid",
          borderColor: failedCount > 0 ? "#ef44444d" : "#22c55e4d",
          color: theme.contentPanelText,
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
          {failedCount === 0
            ? `Todos os ${lastResults.length} testes passaram.`
            : `${failedCount} de ${lastResults.length} teste${lastResults.length === 1 ? "" : "s"} falharam.`}
        </Typography>
        {failedCount > 0 && (
          <Typography
            sx={{ mt: 0.5, fontSize: 12, color: theme.textSecondary }}
          >
            A função compilou, mas a saída não bateu com o esperado.
          </Typography>
        )}
        <Typography sx={{ mt: 0.25, fontSize: 11, color: theme.textMuted }}>
          {passedCount} passou{passedCount === 1 ? "" : "ram"} · {failedCount}{" "}
          falhou{failedCount === 1 ? "" : "ram"}
        </Typography>
      </Box>

      {lastResults.map((result, index) => {
        const passed = result.passed;
        const accent = passed ? "#22c55e" : "#ef4444";

        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              bgcolor: theme.bgElevated,
              borderRadius: 1,
              border: "1px solid",
              borderColor: theme.border,
              borderLeft: "4px solid",
              borderLeftColor: accent,
              overflow: "visible",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                bgcolor: passed
                  ? "rgba(34, 197, 94, 0.08)"
                  : "rgba(239, 68, 68, 0.08)",
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  color: accent,
                  flexShrink: 0,
                  "& svg": { width: "100%", height: "100%" },
                }}
              >
                {passed ? <CheckIcon /> : <XIcon />}
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: accent }}>
                Teste {index + 1}
              </Typography>
              <Typography
                sx={{ ml: "auto", fontSize: 12, color: theme.textMuted }}
              >
                {passed ? "Passou" : "Falhou"}
              </Typography>
            </Box>

            <Box
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: theme.bg,
                fontSize: 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                borderTop: "1px solid",
                borderColor: theme.border,
                color: theme.contentPanelText,
              }}
            >
              <Box sx={{ mb: 1, color: theme.textSecondary }}>
                Entrada: {formatInput(result.input)}
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Box sx={{ mb: 0.5, color: theme.textMuted }}>Esperado:</Box>
                  <Box
                    sx={{
                      bgcolor: theme.bgElevated,
                      p: 0.75,
                      borderRadius: 1,
                      color: "#4ade80",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {formatValue(result.expectedOutput)}
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ mb: 0.5, color: theme.textMuted }}>Obtido:</Box>
                  <Box
                    sx={{
                      bgcolor: theme.bgElevated,
                      p: 0.75,
                      borderRadius: 1,
                      color: passed ? "#4ade80" : "#f87171",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {formatValue(result.actualOutput)}
                  </Box>
                </Box>
              </Box>
              {!passed && (
                <Box
                  sx={{
                    mt: 1,
                    color: theme.textSecondary,
                    fontFamily: "inherit",
                  }}
                >
                  A função retornou {formatValue(result.actualOutput)}, mas o
                  teste esperava {formatValue(result.expectedOutput)}.
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

"use client";

import { IFunctionData } from "@/utils/code-extractor";
import { useAppTheme } from "@/providers/ColorModeProvider";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Box, Typography } from "@mui/material";
import { TestWithId } from "../hooks/useTestCases";

interface ITestCaseProps {
  testCases: TestWithId[];
  userFunctionData: IFunctionData | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onInputChange: (id: string, index: number, val: string) => void;
  onOutputChange: (id: string, val: string) => void;
}

const ArrayMaskedInput = ({
  value,
  onChange,
  label,
  helperText,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  helperText: string;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Remove chaves para processamento
    val = val.replace(/[{}]/g, "");

    // Substitui vírgulas por espaços
    val = val.replace(/,/g, " ");

    // Substitui múltiplos espaços por um único espaço
    val = val.replace(/\s+/g, " ");

    // Remove espaços no início
    val = val.trimStart();

    onChange(val);
  };

  // Formata o valor para exibição
  let displayValue = value;
  if (displayValue) {
    const parts = displayValue.split(" ");
    displayValue = `{${parts.join(", ")}}`;
  }

  return (
    <TextField
      label={label}
      helperText={helperText}
      value={displayValue}
      onChange={handleChange}
    />
  );
};

export const StepTestCases = ({
  testCases,
  userFunctionData,
  onAdd,
  onRemove,
  onInputChange,
  onOutputChange,
}: ITestCaseProps) => {
  const theme = useAppTheme();

  return (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 1,
      overflowY: "auto",
      color: theme.text,
    }}
  >
    {userFunctionData && (
      <Button startIcon={<AddIcon />} sx={{ marginY: 2 }} onClick={onAdd}>
        Adicionar Teste
      </Button>
    )}

    {testCases.map(({ testId, input, expectedOutput }, index) => (
      <Box
        key={testId}
        sx={{
          width: "100%",
          p: 1,
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          border: "1px solid",
          borderColor: theme.border,
        }}
      >
        <Typography variant="body2" sx={{ color: theme.textMuted }}>
          Caso de Teste {index + 1}
        </Typography>
        {userFunctionData?.params.map((param, paramIndex) =>
          param.isArray ? (
            <ArrayMaskedInput
              key={`${testId}-param-${paramIndex}`}
              label={`Parâmetro ${param.name} (${param.type})`}
              value={input[paramIndex] || ""}
              helperText="Insira os valores separados por espaço. Ex: 1 2 3 4 5"
              onChange={(val) => onInputChange(testId, paramIndex, val)}
            />
          ) : (
            <TextField
              key={`${testId}-param-${paramIndex}`}
              label={`Parâmetro ${param.name} (${param.type})`}
              defaultValue={input[paramIndex] || ""}
              type={
                param.type === "inteiro" || param.type === "real"
                  ? "number"
                  : "text"
              }
              onChange={(e) =>
                onInputChange(testId, paramIndex, e.target.value)
              }
            />
          ),
        )}
        <TextField
          label="Saída Esperada"
          helperText="Insira o valor que deve retornar para este teste"
          type={
            userFunctionData?.returnType === "inteiro" ||
            userFunctionData?.returnType === "real"
              ? "number"
              : "text"
          }
          onChange={(e) => onOutputChange(testId, e.target.value)}
          defaultValue={expectedOutput}
        />
        <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onRemove(testId)}
          >
            Remover Teste
          </Button>
        </Box>
      </Box>
    ))}
  </Box>
  );
};

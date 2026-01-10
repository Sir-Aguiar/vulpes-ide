import { IFunctionData } from "@/utils/code-extractor";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { TestWithId } from "../hooks/useTestCases";

interface ITestCaseProps {
  testCases: TestWithId[];
  userFunctionData: IFunctionData | null;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onInputChange: (id: number, index: number, val: string) => void;
  onOutputChange: (id: number, val: string) => void;
}

export const StepTestCases = ({
  testCases,
  userFunctionData,
  onAdd,
  onRemove,
  onInputChange,
  onOutputChange,
}: ITestCaseProps) => (
  <div className="w-full h-full flex flex-col gap-2 overflow-y-auto">
    {userFunctionData && (
      <Button startIcon={<AddIcon />} sx={{ marginY: 2 }} onClick={onAdd}>
        Adicionar Teste
      </Button>
    )}

    {testCases.map(({ testId, input, expectedOutput }, index) => (
      <div
        key={testId}
        className="w-full p-2 rounded-sm flex flex-col gap-2 border border-gray-100/10"
      >
        <span className="w-full text-sm opacity-60">
          Caso de Teste {index + 1}
        </span>
        {userFunctionData?.params.map((param, paramIndex) => (
          <TextField
            key={`${testId}-param-${paramIndex}`}
            label={`Parâmetro ${param.name} (${param.type})`}
            defaultValue={input[paramIndex] || ""}
            helperText={
              param.type.toLowerCase().includes("vetor")
                ? "Insira os valores separados por espaço. Ex: 1 2 3 4 5"
                : ""
            }
            onChange={(e) => onInputChange(testId, paramIndex, e.target.value)}
          />
        ))}
        <TextField
          label="Saída Esperada"
          helperText="Insira o valor que deve retornar para este teste"
          onChange={(e) => onOutputChange(testId, e.target.value)}
          defaultValue={expectedOutput}
        />
        <div className="w-full flex justify-end">
          <Button
            variant="outlined"
            color="error"
            onClick={() => onRemove(testId)}
          >
            Remover Teste
          </Button>
        </div>
      </div>
    ))}
  </div>
);

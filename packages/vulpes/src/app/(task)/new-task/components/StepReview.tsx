import { Editor } from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";
import { TestWithId } from "../hooks/useTestCases";
import { Control, useWatch } from "react-hook-form";
import { CreateTaskDTO } from "@/@dtos/Task";
import { IClassListItem } from "@/@types/Class";

interface StepReviewProps {
  control: Control<CreateTaskDTO>;
  code: string;
  testCases: TestWithId[];
  selectedClasses?: IClassListItem[];
}

export const StepReview = ({ control, code, testCases, selectedClasses = [] }: StepReviewProps) => {
  const values = useWatch({ control });

  return (
    <div className="w-full h-full flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">{values.title || "Sem título"}</h2>
        <div className="rounded">
          <h3 className="text-sm font-bold uppercase mb-2">Descrição</h3>
          <MDEditor
            value={values.description}
            preview="preview"
            height="500px"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">Código Base</h3>
        <div className="text-sm mb-2">
          <strong>Modo de Entrada:</strong>{" "}
          {values.inputMode === "params"
            ? "Parâmetros da Função"
            : "Comando Leia()"}
        </div>
        <div className="h-64 rounded overflow-hidden">
          <Editor
            theme="vs-dark"
            language="portugol"
            value={code}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">
          Casos de Teste ({testCases.length})
        </h3>
        {testCases.length === 0 && (
          <span className="text-sm opacity-60 italic">
            Nenhum caso de teste adicionado.
          </span>
        )}
        <div className="grid grid-cols-1 gap-2">
          {testCases.map((test, index) => (
            <div key={test.testId} className="p-3 rounded flex flex-col gap-1">
              <span className="text-xs font-bold opacity-50 uppercase mb-1">
                Teste {index + 1}
              </span>
              <div className="text-sm">
                <span className="font-semibold text-blue-400">Entrada:</span>{" "}
                <span className="font-mono bg-black/20 px-1 rounded">
                  {test.input.join(", ")}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-green-400">
                  Saída Esperada:
                </span>{" "}
                <span className="font-mono bg-black/20 px-1 rounded">
                  {test.expectedOutput}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">Configurações</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded border border-gray-100/10">
            <span className="text-sm font-semibold">Visibilidade:</span>{" "}
            <span className={values.isVisible ? "text-green-400" : "text-yellow-400"}>
              {values.isVisible ? "Visível" : "Oculta"}
            </span>
          </div>
          <div className="p-3 rounded border border-gray-100/10">
            <span className="text-sm font-semibold">Acesso:</span>{" "}
            <span className={values.isPublic ? "text-blue-400" : "text-orange-400"}>
              {values.isPublic ? "Pública" : "Privada"}
            </span>
          </div>
        </div>
      </div>

      {selectedClasses.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Turmas Vinculadas ({selectedClasses.length})</h3>
          <div className="p-3 rounded border border-gray-100/10">
            <ul className="list-disc list-inside space-y-1">
              {selectedClasses.map((classItem) => (
                <li key={classItem.classId} className="text-sm">
                  {classItem.name} <span className="opacity-60">(Código: {classItem.code})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

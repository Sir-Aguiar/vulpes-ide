import { useCallback, useState } from "react";
import { ICodeTest } from "../../../../@schemas/Task.schema";

export type TestWithId = ICodeTest & { testId: string };

export default function useTestCases(expectedOutputType?: string) {
  const [testCases, setTestCasesState] = useState<TestWithId[]>([]);

  const setTestCases = useCallback((tests: TestWithId[]) => {
    setTestCasesState(tests);
  }, []);

  const addTestCase = useCallback(() => {
    const testId = crypto.randomUUID();
    setTestCasesState((prev) => [
      ...prev,
      {
        testId,
        input: [""],
        expectedOutput: "",
        expectedOutputType: expectedOutputType || "",
      },
    ]);
  }, [expectedOutputType]);

  const removeTestCase = useCallback((testId: string) => {
    setTestCasesState((prev) => prev.filter((t) => t.testId !== testId));
  }, []);

  const updateInput = useCallback(
    (id: string, paramIndex: number, value: string) => {
      setTestCasesState((prev) =>
        prev.map((test) => {
          if (test.testId !== id) return test;
          const newInputs = [...test.input];
          newInputs[paramIndex] = value;
          return { ...test, input: newInputs };
        }),
      );
    },
    [],
  );

  const updateOutput = useCallback(
    (id: string, value: string) => {
      setTestCasesState((prev) =>
        prev.map((test) =>
          test.testId === id
            ? {
                ...test,
                expectedOutput: value,
                expectedOutputType: expectedOutputType || "",
              }
            : test,
        ),
      );
    },
    [expectedOutputType],
  );

  return {
    testCases,
    addTestCase,
    removeTestCase,
    updateInput,
    updateOutput,
    setTestCases,
  };
}

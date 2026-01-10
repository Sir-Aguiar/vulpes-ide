import { useCallback, useRef, useState } from "react";
import { ICodeTest } from "../../../../@schemas/Task.schema";

export type TestWithId = ICodeTest & { testId: number };

export default function useTestCases() {
  const [testCases, setTestCases] = useState<TestWithId[]>([]);
  const nextIdRef = useRef(0);

  const addTestCase = useCallback(() => {
    const testId = nextIdRef.current++;
    setTestCases((prev) => [
      ...prev,
      { testId, input: [""], expectedOutput: "" },
    ]);
  }, []);

  const removeTestCase = useCallback((testId: number) => {
    setTestCases((prev) => prev.filter((t) => t.testId !== testId));
  }, []);

  const updateInput = useCallback(
    (id: number, paramIndex: number, value: string) => {
      setTestCases((prev) =>
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

  const updateOutput = useCallback((id: number, value: string) => {
    setTestCases((prev) =>
      prev.map((test) =>
        test.testId === id ? { ...test, expectedOutput: value } : test,
      ),
    );
  }, []);

  return { testCases, addTestCase, removeTestCase, updateInput, updateOutput };
}

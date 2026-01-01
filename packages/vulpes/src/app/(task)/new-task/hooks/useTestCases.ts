import { useCallback, useRef, useState } from "react";
import { ICodeTest } from "../../../../@schemas/CreateTask.schema";

export type TestWithId = ICodeTest & { id: number };

export default function useTestCases() {
  const [testCases, setTestCases] = useState<TestWithId[]>([]);
  const nextIdRef = useRef(0);

  const addTestCase = useCallback(() => {
    const id = nextIdRef.current++;
    setTestCases((prev) => [...prev, { id, input: [""], expectedOutput: "" }]);
  }, []);

  const removeTestCase = useCallback((id: number) => {
    setTestCases((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateInput = useCallback(
    (id: number, paramIndex: number, value: string) => {
      setTestCases((prev) =>
        prev.map((test) => {
          if (test.id !== id) return test;
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
        test.id === id ? { ...test, expectedOutput: value } : test,
      ),
    );
  }, []);

  return { testCases, addTestCase, removeTestCase, updateInput, updateOutput };
}

"use client";

import BugReportModal from "@/components/BugReport/BugReportModal";
import { useAuth } from "@/providers/AuthProvider";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface IBugReportContext {
  openBugReport: () => void;
  closeBugReport: () => void;
  isOpen: boolean;
}

const BugReportContext = createContext<IBugReportContext | undefined>(undefined);

export function BugReportProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const openBugReport = useCallback(() => {
    if (!isAuthenticated) {
      toast.info("Faça login para reportar um bug.");
      router.push("/login");
      return;
    }
    setIsOpen(true);
  }, [isAuthenticated, router]);

  const closeBugReport = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ openBugReport, closeBugReport, isOpen }),
    [openBugReport, closeBugReport, isOpen],
  );

  return (
    <BugReportContext.Provider value={value}>
      {children}
      <BugReportModal open={isOpen} onClose={closeBugReport} />
    </BugReportContext.Provider>
  );
}

export function useBugReport() {
  const context = useContext(BugReportContext);
  if (!context) {
    throw new Error("useBugReport must be used within BugReportProvider");
  }
  return context;
}

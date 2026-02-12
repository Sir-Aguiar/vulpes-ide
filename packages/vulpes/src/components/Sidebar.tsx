"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { PlayIcon } from "./Icons";

import ShareIcon from "@mui/icons-material/Share";
import SaveIcon from "@mui/icons-material/Save";

import { useAuth } from "@/providers/AuthProvider";
import { Switch } from "@mui/material";

interface SidebarProps {
  isRunning: boolean;
  onRunCode: () => void;
  registerSubmission?: boolean;
  handleRegisterSubmissionChange?: () => void;
  isForbiddenToSubmit?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isRunning,
  onRunCode,
  registerSubmission,
  isForbiddenToSubmit,
  handleRegisterSubmissionChange,
}) => {
  const [isSharing, setIsSharing] = React.useState<boolean>(false);
  const router = useRouter();

  const handleShareFile = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
    }, 1000);
  };

  return (
    <div
      className="flex flex-col h-full rounded-md overflow-hidden"
      style={{ backgroundColor: "#121e24" }}
    >
      <button
        className={`flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer ${
          isRunning ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"
        }`}
        style={{
          backgroundColor: "#121e24",
          color: "#00f0c0",
        }}
        title="Iniciar execução"
        disabled={isRunning}
        onClick={onRunCode}
      >
        <PlayIcon />
      </button>
      <div
        className="my-2 mx-4 h-px"
        style={{ backgroundColor: "#445056" }}
      ></div>

      <button
        className="flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer hover:bg-gray-600"
        style={{
          backgroundColor: "#121e24",
          color: "#45beff",
        }}
        title="Salvar como…"
      >
        <SaveIcon />
      </button>

      <button
        className={`flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer ${
          isSharing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"
        }`}
        style={{
          backgroundColor: "#121e24",
          color: "#00f0c0",
        }}
        title="Compartilhar código"
        disabled={isSharing}
        onClick={handleShareFile}
      >
        <ShareIcon />
      </button>

      <div
        className="my-2 mx-4 h-px"
        style={{ backgroundColor: "#445056" }}
      ></div>

      <button
        className={`flex items-center justify-center my-2 cursor-pointer`}
        title="Enviar tarefa ao executar código?"
      >
        {!isForbiddenToSubmit && (
          <Switch
            onChange={handleRegisterSubmissionChange}
            value={registerSubmission}
            size="small"
          />
        )}
      </button>
      <div className="flex-1"></div>
    </div>
  );
};

export default Sidebar;

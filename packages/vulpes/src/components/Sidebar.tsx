"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  HelpIcon,
  LogoutIcon,
  OpenIcon,
  PlayIcon,
  SaveAsIcon,
  SaveIcon,
  SettingsIcon,
  ShareIcon,
  StopIcon,
} from "./Icons";
import { useAuth } from "@/providers/AuthProvider";

interface SidebarProps {
  isRunning: boolean;
  onRunCode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isRunning, onRunCode }) => {
  const [isSharing, setIsSharing] = React.useState<boolean>(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleShareFile = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    toast.info("Logout realizado com sucesso");
    router.push("/login");
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
        <SaveAsIcon />
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

      <div className="flex-1"></div>

      <button
        className="flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer hover:bg-gray-600"
        style={{
          backgroundColor: "#121e24",
          color: "#ff5555",
        }}
        title="Sair"
        onClick={handleLogout}
      >
        <LogoutIcon />
      </button>
    </div>
  );
};

export default Sidebar;

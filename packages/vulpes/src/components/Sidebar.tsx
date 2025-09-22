"use client";

import React from "react";
import {
  HelpIcon,
  OpenIcon,
  PlayIcon,
  SaveAsIcon,
  SaveIcon,
  SettingsIcon,
  ShareIcon,
  StopIcon
} from "./Icons";

interface SidebarProps {
  isRunning: boolean;
  isTranspiling: boolean;
  onRunCode: () => void;
  onStopCode: () => void;
  onSaveFile: () => void;
  onOpenFile: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isRunning,
  isTranspiling,
  onRunCode,
  onStopCode,
  onSaveFile,
  onOpenFile,
  onOpenHelp,
  onOpenSettings,
}) => {
  const [isSharing, setIsSharing] = React.useState<boolean>(false);

  const handleShareFile = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#121e24" }}>
      <button
        className={`flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer ${
          isRunning || isTranspiling ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"
        }`}
        style={{
          backgroundColor: "#121e24",
          color: "#00f0c0",
        }}
        title="Iniciar execução"
        disabled={isRunning || isTranspiling}
        onClick={onRunCode}
      >
        <PlayIcon />
      </button>

      <button
        className={`flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer ${
          !isRunning && !isTranspiling ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"
        }`}
        style={{
          backgroundColor: "#121e24",
          color: "#f1433c",
        }}
        title="Parar execução"
        disabled={!isRunning && !isTranspiling}
        onClick={onStopCode}
      >
        <StopIcon />
      </button>

      <div className="my-2 mx-4 h-px" style={{ backgroundColor: "#445056" }}></div>

      <button
        className="flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer hover:bg-gray-600"
        style={{
          backgroundColor: "#121e24",
          color: "#45beff",
        }}
        title="Salvar arquivo"
        onClick={onSaveFile}
      >
        <SaveIcon />
      </button>

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
        className="flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer hover:bg-gray-600"
        style={{
          backgroundColor: "#121e24",
          color: "#ffc200",
        }}
        title="Abrir arquivo"
        onClick={onOpenFile}
      >
        <OpenIcon />
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

      <div className="my-2 mx-4 h-px" style={{ backgroundColor: "#445056" }}></div>

      <button
        className="flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer hover:bg-gray-600"
        style={{
          backgroundColor: "#121e24",
          color: "#45beff",
        }}
        title="Abrir seção de Ajuda"
        onClick={onOpenHelp}
      >
        <HelpIcon />
      </button>

      <div className="flex-grow"></div>

      <button
        className="flex items-center justify-center w-16 h-16 border-none transition-all duration-200 cursor-pointer hover:bg-gray-600"
        style={{
          backgroundColor: "#121e24",
          color: "#ffc200",
        }}
        title="Configurações"
        onClick={onOpenSettings}
      >
        <SettingsIcon />
      </button>
    </div>
  );
};

export default Sidebar;

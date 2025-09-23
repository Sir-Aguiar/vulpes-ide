"use client";

import React from "react";
import { HelpIcon, OpenIcon, PlayIcon, SaveAsIcon, SaveIcon, SettingsIcon, ShareIcon, StopIcon } from "./Icons";

interface SidebarProps {
  isRunning: boolean;
  isTranspiling: boolean;
  onRunCode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isRunning, isTranspiling, onRunCode }) => {
  const [isSharing, setIsSharing] = React.useState<boolean>(false);

  const handleShareFile = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full rounded-md overflow-hidden" style={{ backgroundColor: "#121e24" }}>
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

      <div className="my-2 mx-4 h-px" style={{ backgroundColor: "#445056" }}></div>

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

      <div className="my-2 mx-4 h-px" style={{ backgroundColor: "#445056" }}></div>
    </div>
  );
};

export default Sidebar;

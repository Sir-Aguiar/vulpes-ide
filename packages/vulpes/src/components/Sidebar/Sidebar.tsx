"use client";

import styles from "./Sidebar.module.css";

import { useRouter } from "next/navigation";
import React from "react";

import { Box, Button, Divider, SxProps } from "@mui/material";

import StopIcon from "@mui/icons-material/Stop";
import { PlayIcon, SaveAsIcon } from "../Icons";

import { COLORS } from "@/utils/colors";
import { ITask } from "@/@types/Task";

interface SidebarProps {
  isRunning: boolean;
  onRunCode: () => void;
  registerSubmission?: boolean;
  handleRegisterSubmissionChange?: () => void;
  isInList?: boolean;
  tasksInList?: ITask[];
}

const BoxStyle: SxProps = {
  width: "64px",
  height: "100%",
  backgroundColor: COLORS.dark.background[900],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  padding: "8px",
  borderRadius: "8px",
};

const SiderBarButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) => {
  return (
    <button
      className="cursor-pointer p-2 rounded-xl flex items-center justify-center"
      {...props}
    >
      {children}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  isRunning,
  onRunCode,
  registerSubmission,
  handleRegisterSubmissionChange,
  isInList,
  tasksInList,
}) => {
  const [isSharing, setIsSharing] = React.useState<boolean>(false);
  const router = useRouter();

  return (
    <Box sx={BoxStyle}>
      <SiderBarButton onClick={onRunCode}>
        {isRunning ? <StopIcon /> : <PlayIcon />}
      </SiderBarButton>

      <Divider sx={{ background: "#fff" }} flexItem />

      <SiderBarButton>
        <SaveAsIcon style={{ color: "Highlight" }} />
      </SiderBarButton>
      {isInList && (
        <>
          <Divider sx={{ background: "#fff" }} flexItem />
          <span className="text-white text-[10px]">Tarefas</span>
          {tasksInList?.map((task, index) => (
            <SiderBarButton
              key={task.taskId}
              onClick={() => router.push(`/tasks/${task.taskId}`)}
            >
              <span className="text-white">{index + 1}</span>
            </SiderBarButton>
          ))}
        </>
      )}
    </Box>
  );
};

export default Sidebar;

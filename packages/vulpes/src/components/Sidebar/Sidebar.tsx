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
  gridColumn: "1 / 1",
  gridRow: "1 / 13",
  maxWidth: "84px",
  bgcolor: "#222",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  padding: "8px",
  borderRadius: "8px",
  "@media (max-width: 1280px)": {
    gridColumn: "1 / 11",
    gridRow: "7/ 8",
    flexDirection: "row",
  },
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
    </Box>
  );
};

export default Sidebar;

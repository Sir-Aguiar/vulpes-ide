"use client";

import { useRouter } from "next/navigation";
import React from "react";

import {
  Box,
  Button,
  Divider,
  Step,
  StepLabel,
  Stepper,
  SxProps,
} from "@mui/material";

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
  activeTaskIndex?: number;
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
    maxWidth: "100%",
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
  activeTaskIndex,
}) => {
  const router = useRouter();
  const isSmallScreen = window.innerWidth < 1280;

  const handleAdvance = () => {
    if (isInList && tasksInList && tasksInList.length > 0) {
      const nextIndex =
        (activeTaskIndex !== undefined ? activeTaskIndex + 1 : 0) %
        tasksInList.length;
      const nextTask = tasksInList[nextIndex];
      router.push(`/task/${nextTask.taskId}?list=${nextTask.listId}`); // Navega para a próxima tarefa
    }
  };

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
          <Stepper
            activeStep={activeTaskIndex || 0}
            orientation={isSmallScreen ? "horizontal" : "vertical"}
            sx={{
              background: "transparent",
              "& .MuiStepLabel-root .Mui-active": {
                color: COLORS.dark.primary[500], // Cor do ícone ativo
              },
              "& .MuiStepLabel-label.Mui-active": {
                color: "white", // Cor do texto ativo
              },
              ...(isSmallScreen ? { mx: "auto" } : { my: "auto" }),
            }}
          >
            {tasksInList?.map((task, index) => (
              <Step key={task.taskId}>
                <StepLabel></StepLabel>
              </Step>
            ))}
          </Stepper>

          <Button size="small" onClick={handleAdvance}>
            Avançar
          </Button>
        </>
      )}
    </Box>
  );
};

export default Sidebar;

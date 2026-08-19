"use client";

import { useRouter } from "next/navigation";
import React from "react";

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  SxProps,
  Tooltip,
} from "@mui/material";

import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import { PlayIcon, SaveAsIcon } from "../Icons";

import { ITask } from "@/@types/Task";
import { useAppTheme } from "@/providers/ColorModeProvider";

interface SidebarProps {
  isRunning: boolean;
  onRunCode: () => void;
  registerSubmission?: boolean;
  handleRegisterSubmissionChange?: () => void;
  isInList?: boolean;
  listId?: string;
  tasksInList?: ITask[];
  activeTaskIndex?: number;
  onAdvance?: () => void;
  /** Chamado ao navegar para outra tarefa da lista. Quando fornecido, substitui
   *  a navegação padrão via `router.push`. Recebe o índice da tarefa destino. */
  onNavigateToTask?: (index: number) => void;
  advanceLabel?: string;
  disableAdvance?: boolean;
  onStepClick?: (index: number) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  submitDisabledReason?: string;
}


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
  listId,
  onAdvance,
  onNavigateToTask,
  advanceLabel = "Avançar",
  disableAdvance = false,
  onStepClick,
  onSubmit,
  isSubmitting = false,
  canSubmit = false,
  submitDisabledReason,
}) => {
  const router = useRouter();
  const theme = useAppTheme();
  const isSmallScreen = window.innerWidth < 1280;

  const boxStyle: SxProps = {
    gridColumn: "1 / 1",
    gridRow: "1 / 13",
    maxWidth: "84px",
    bgcolor: theme.menuBg,
    border: "1px solid",
    borderColor: theme.menuBorder,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    borderRadius: "8px",
    color: theme.text,
    "@media (max-width: 1280px)": {
      gridColumn: "1 / 11",
      gridRow: "7/ 8",
      flexDirection: "row",
      maxWidth: "100%",
    },
  };

  const handleAdvance = () => {
    if (onAdvance) {
      onAdvance();
      return;
    }

    if (isInList && tasksInList && tasksInList.length > 0) {
      const nextIndex =
        (activeTaskIndex !== undefined ? activeTaskIndex + 1 : 0) %
        tasksInList.length;

      if (onNavigateToTask) {
        onNavigateToTask(nextIndex);
        return;
      }

      const nextTask = tasksInList[nextIndex];
      router.push(`/task/${nextTask.taskId}?listId=${listId}`);
    }
  };

  return (
    <Box sx={boxStyle}>
      <SiderBarButton onClick={onRunCode}>
        {isRunning ? <StopIcon /> : <PlayIcon />}
      </SiderBarButton>

      <Divider sx={{ background: theme.borderStrong }} flexItem />

      <SiderBarButton>
        <SaveAsIcon style={{ color: theme.brand }} />
      </SiderBarButton>

      {isInList && (
        <>
          <Stepper
            nonLinear
            activeStep={activeTaskIndex || 0}
            orientation={isSmallScreen ? "horizontal" : "vertical"}
            sx={{
              background: "transparent",

              "& .MuiStepButton-root": {
                padding: "8px",
                margin: 0,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: theme.hover,
                },
              },
              ...(isSmallScreen ? { mx: "auto" } : { my: "auto" }),
            }}
          >
            {tasksInList?.map((task, index) => (
              <Step key={task.taskId}>
                {onStepClick ? (
                  <StepButton
                    onClick={() => onStepClick(index)}
                    disableRipple={false}
                    sx={{ cursor: "pointer" }}
                  >
                    <StepLabel />
                  </StepButton>
                ) : (
                  <StepLabel />
                )}
              </Step>
            ))}
          </Stepper>

          <Button
            size="small"
            onClick={handleAdvance}
            disabled={disableAdvance}
          >
            {advanceLabel}
          </Button>
        </>
      )}

      {!isInList && onSubmit && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "@media (min-width: 1281px)": {
              mt: "auto",
              width: "100%",
            },
            "@media (max-width: 1280px)": {
              ml: "auto",
            },
          }}
        >
          <Tooltip
            title={
              !canSubmit && !isSubmitting
                ? submitDisabledReason ||
                  "Execute o código ao menos uma vez para poder enviar."
                : ""
            }
            placement={isSmallScreen ? "top" : "right"}
            arrow
          >
            <span>
              <Button
                size="small"
                onClick={onSubmit}
                disabled={!canSubmit || isSubmitting}
                endIcon={
                  isSubmitting ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <SendIcon fontSize="small" />
                  )
                }
                sx={{
                  minWidth: 0,
                  px: 1,
                  fontSize: "0.7rem",
                  lineHeight: 1.1,
                  textAlign: "center",
                  "& .MuiButton-startIcon": {
                    mr: 0.5,
                  },
                  color: "primary",
                  ":disabled": {
                    color: "primary.500",
                  },
                }}
              >
                {isSubmitting ? "Enviando" : "Enviar"}
              </Button>
            </span>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;

"use client";

import { ITaskListItem } from "@/@types/Task";
import { useAppTheme } from "@/providers/ColorModeProvider";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import Link from "next/link";

const montserrat = Montserrat({ subsets: ["latin"] });

export interface ITaskCardProps {
  task: ITaskListItem;
  index?: number;
  animate?: boolean;
  href?: string;
  onResolve?: (taskId: string) => void;
  showEdit?: boolean;
  onEdit?: (event: React.MouseEvent, taskId: string) => void;
}

function formatTaskDate(dateValue: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default function TaskCard({
  task,
  index = 0,
  animate = true,
  href,
  onResolve,
  showEdit = false,
  onEdit,
}: ITaskCardProps) {
  const theme = useAppTheme();
  const resolveHref = href ?? `/task?taskId=${task.taskId}`;

  const cardContent = (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: theme.border,
        bgcolor: theme.bgCard,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        position: "relative",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: "rgba(255,109,0,0.4)",
          transform: "translateY(-3px)",
          boxShadow: `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,109,0,0.1)`,
        },
      }}
    >
      {showEdit && onEdit && (
        <Tooltip title="Editar tarefa">
          <IconButton
            size="small"
            onClick={(event) => onEdit(event, task.taskId)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 1,
              color: theme.textSecondary,
              bgcolor: theme.bgElevated,
              border: "1px solid",
              borderColor: theme.border,
              "&:hover": {
                color: theme.brand,
                borderColor: "rgba(255,109,0,0.4)",
                bgcolor: "rgba(255,109,0,0.08)",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{ pr: showEdit ? 4 : 0 }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,109,0,0.1)",
            color: theme.brand,
            flexShrink: 0,
          }}
        >
          <AssignmentIcon fontSize="small" />
        </Box>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
          {task.isPublic && (
            <Chip
              label="Pública"
              size="small"
              sx={{
                bgcolor: "rgba(99,102,241,0.12)",
                color: "#818cf8",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
          {!task.isVisible && (
            <Chip
              icon={<VisibilityOffIcon sx={{ fontSize: "14px !important" }} />}
              label="Oculta"
              size="small"
              sx={{
                bgcolor: "rgba(245,158,11,0.12)",
                color: "#f59e0b",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
                "& .MuiChip-icon": { color: "#f59e0b" },
              }}
            />
          )}
        </Stack>
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          className={montserrat.className}
          sx={{
            color: theme.text,
            fontWeight: 700,
            mb: 0.75,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {task.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.textSecondary,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.55,
            fontSize: "0.8125rem",
          }}
        >
          {task.description || "Sem descrição disponível."}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" sx={{ color: theme.textMuted }}>
          {formatTaskDate(task.createdAt)}
        </Typography>
        {onResolve ? (
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: "16px !important" }} />}
            onClick={() => onResolve(task.taskId)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: theme.brand,
              "&:hover": { bgcolor: "rgba(255,109,0,0.08)" },
            }}
          >
            Resolver
          </Button>
        ) : (
          <Button
            component={Link}
            href={resolveHref}
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: "16px !important" }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: theme.brand,
              "&:hover": { bgcolor: "rgba(255,109,0,0.08)" },
            }}
          >
            Resolver
          </Button>
        )}
      </Stack>
    </Box>
  );

  if (!animate) return cardContent;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      sx={{ height: "100%" }}
    >
      {cardContent}
    </Box>
  );
}

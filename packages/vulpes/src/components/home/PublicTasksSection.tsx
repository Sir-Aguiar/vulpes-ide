"use client";

import { ITaskListItem } from "@/@types/Task";
import TaskCard from "@/components/tasks/TaskCard";
import { useAppTheme } from "@/providers/ColorModeProvider";
import API from "@/services/API";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function PublicTasksSection() {
  const theme = useAppTheme();
  const [tasks, setTasks] = useState<ITaskListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/task")
      .then((response) => setTasks(response.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: theme.bg,
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 10 },
        borderTop: "1px solid",
        borderColor: theme.border,
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      <Box sx={{ maxWidth: theme.maxWidth, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "flex-end" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 5 }}
        >
          <Stack spacing={1}>
            <Typography
              variant="overline"
              sx={{ color: theme.brand, fontWeight: 700, letterSpacing: 2 }}
            >
              Explorar
            </Typography>
            <Typography
              variant="h4"
              className={montserrat.className}
              sx={{ color: theme.text, fontWeight: 800 }}
            >
              Tarefas públicas
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.textSecondary,
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              Pratique com atividades abertas à comunidade — resolva e teste seu
              código agora mesmo.
            </Typography>
          </Stack>
          <Button
            component={Link}
            href="/tasks"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: theme.text,
              borderColor: theme.borderStrong,
              borderRadius: 2,
              flexShrink: 0,
              "&:hover": {
                borderColor: theme.brand,
                bgcolor: "rgba(255,109,0,0.06)",
              },
            }}
          >
            Ver todas
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: theme.brand }} />
          </Box>
        ) : tasks.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: theme.border,
              color: theme.textSecondary,
            }}
          >
            <Typography variant="body1">
              Nenhuma tarefa pública disponível no momento.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {tasks.slice(0, 6).map((task, index) => (
              <TaskCard key={task.taskId} task={task} index={index} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

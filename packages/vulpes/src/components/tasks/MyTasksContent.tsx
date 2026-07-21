"use client";

import {
  IMyClassTaskItem,
  IMyTasksClassSection,
  IMyTasksResponse,
} from "@/@types/ClassTask";
import { ITaskListItem } from "@/@types/Task";
import TaskCard from "@/components/tasks/TaskCard";
import { useAppTheme } from "@/providers/ColorModeProvider";
import API from "@/services/API";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

const montserrat = Montserrat({ subsets: ["latin"] });

function mapToTaskListItem(item: IMyClassTaskItem): ITaskListItem {
  return {
    taskId: item.task.taskId,
    title: item.task.title,
    description: item.task.description,
    creatorId: item.task.creator.userId,
    isPublic: false,
    isVisible: true,
    createdAt: item.createdAt,
  };
}

function ClassTasksSection({
  section,
  sectionIndex,
}: {
  section: IMyTasksClassSection;
  sectionIndex: number;
}) {
  const theme = useAppTheme();
  const { class: classInfo, tasks, totalTasks, hasMore } = section;

  return (
    <Box component="section">
      {sectionIndex > 0 && (
        <Divider sx={{ my: 5, borderColor: theme.border }} />
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,109,0,0.1)",
              color: theme.brand,
              flexShrink: 0,
            }}
          >
            <SchoolOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="h6"
              className={montserrat.className}
              sx={{ color: theme.text, fontWeight: 700 }}
            >
              {classInfo.name}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textMuted }}>
              Código {classInfo.code}
              {totalTasks > 0 && (
                <>
                  {" "}
                  · {totalTasks}{" "}
                  {totalTasks === 1 ? "tarefa" : "tarefas"}
                </>
              )}
            </Typography>
          </Box>
        </Stack>

        <Button
          component={Link}
          href={`/class/${classInfo.classId}`}
          variant="outlined"
          size="small"
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
          Ver turma
        </Button>
      </Stack>

      {tasks.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 5,
            gap: 1.5,
            borderRadius: 3,
            border: "1px dashed",
            borderColor: theme.border,
            color: theme.textSecondary,
            textAlign: "center",
            px: 3,
          }}
        >
          <AssignmentOutlinedIcon
            sx={{ fontSize: 40, color: theme.textMuted }}
          />
          <Typography variant="body2">
            Nenhuma tarefa disponível nesta turma no momento.
          </Typography>
        </Box>
      ) : (
        <>
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
            {tasks.map((classTask, index) => (
              <TaskCard
                key={classTask.classTaskId}
                task={mapToTaskListItem(classTask)}
                index={index}
                animate
                href={`/task?classTaskId=${classTask.classTaskId}`}
              />
            ))}
          </Box>

          {hasMore && (
            <Typography
              variant="body2"
              sx={{ color: theme.textMuted, mt: 2, textAlign: "center" }}
            >
              Exibindo as 5 tarefas mais recentes de {totalTasks}. Para ver
              todas, acesse a{" "}
              <Box
                component={Link}
                href={`/class/${classInfo.classId}`}
                sx={{
                  color: theme.brand,
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                página da turma {classInfo.name}
              </Box>
              .
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}

export default function MyTasksContent() {
  const theme = useAppTheme();
  const [classes, setClasses] = useState<IMyTasksClassSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      setLoading(true);
      try {
        const response = await API.get<IMyTasksResponse>(
          "/class-task/my-tasks",
        );
        setClasses(response.data.classes ?? []);
      } catch (error) {
        console.error("Failed to fetch my tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchMyTasks();
  }, []);

  const totalTasks = classes.reduce(
    (sum, section) => sum + section.totalTasks,
    0,
  );

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "calc(100vh - var(--appbar-height))",
        bgcolor: theme.bg,
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
        transition: "background-color 0.2s ease",
      }}
    >
      <Box sx={{ maxWidth: theme.maxWidth, mx: "auto" }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: theme.brand, fontWeight: 700, letterSpacing: 2 }}
          >
            Atividades
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            className={montserrat.className}
            sx={{ color: theme.text, fontWeight: 800 }}
          >
            Minhas tarefas
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.textSecondary, maxWidth: 560, lineHeight: 1.6 }}
          >
            Tarefas das turmas em que você está matriculado, agrupadas por
            turma.
            {totalTasks > 0 && !loading && (
              <Box component="span" sx={{ color: theme.textMuted, ml: 0.5 }}>
                ({totalTasks} {totalTasks === 1 ? "tarefa" : "tarefas"} no
                total)
              </Box>
            )}
          </Typography>
        </Stack>

        <Alert
          icon={<InfoOutlinedIcon fontSize="inherit" />}
          severity="info"
          sx={{
            mb: 4,
            borderRadius: 2,
            bgcolor: "rgba(255,109,0,0.06)",
            color: theme.text,
            border: "1px solid",
            borderColor: "rgba(255,109,0,0.2)",
            "& .MuiAlert-icon": { color: theme.brand },
          }}
        >
          Esta página exibe apenas as tarefas mais recentes de cada turma. Para
          acessar todas as suas tarefas com mais detalhes, visite a página da
          turma correspondente — use os links &quot;Ver turma&quot; em cada
          seção abaixo.
        </Alert>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 360,
              gap: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: theme.border,
              bgcolor: theme.bgElevated,
            }}
          >
            <CircularProgress sx={{ color: theme.brand }} />
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              Carregando suas tarefas...
            </Typography>
          </Box>
        ) : classes.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 360,
              gap: 2,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: theme.border,
              bgcolor: theme.bgElevated,
              px: 3,
              textAlign: "center",
            }}
          >
            <AssignmentOutlinedIcon
              sx={{ fontSize: 48, color: theme.textMuted }}
            />
            <Typography
              variant="h6"
              className={montserrat.className}
              sx={{ color: theme.text, fontWeight: 700 }}
            >
              Nenhuma tarefa encontrada
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.textSecondary, maxWidth: 400 }}
            >
              Você ainda não possui tarefas vinculadas às suas turmas. Entre em
              uma turma ou aguarde novas atividades serem publicadas.
            </Typography>
            <Button
              component={Link}
              href="/classes"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 1,
                textTransform: "none",
                fontWeight: 600,
                color: theme.text,
                borderColor: theme.borderStrong,
                "&:hover": {
                  borderColor: theme.brand,
                  bgcolor: "rgba(255,109,0,0.06)",
                },
              }}
            >
              Ver minhas turmas
            </Button>
          </Box>
        ) : (
          classes.map((section, index) => (
            <ClassTasksSection
              key={section.class.classId}
              section={section}
              sectionIndex={index}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

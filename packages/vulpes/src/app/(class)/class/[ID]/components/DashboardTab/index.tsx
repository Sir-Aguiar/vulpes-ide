import { ClassTaskDashboardData, ClassTaskDashboardStudentRow } from "@/@types/ClassTaskDashboard";
import { ClassTaskListDashboardData } from "@/@types/ClassTaskListDashboard";
import { ISubmission } from "@/@types/Submission";
import API from "@/services/API";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import {
  alpha,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import FeedbackDialog from "./FeedbackDialog";
import KpiCards from "./KpiCards";
import ListKpiCards from "./list/ListKpiCards";
import ListStudentsTable from "./list/ListStudentsTable";
import StudentsTable from "./StudentsTable";
import { ISearchOption, SearchType } from "./types";

interface IDashboardTabProps {
  classId: string;
}

export default function DashboardTab({ classId }: IDashboardTabProps) {
  const theme = useTheme();

  const [searchType, setSearchType] = useState<SearchType>("tasks");
  const [options, setOptions] = useState<ISearchOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ISearchOption | null>(null);

  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [dashboardData, setDashboardData] = useState<ClassTaskDashboardData | null>(null);
  const [submissionsByStudent, setSubmissionsByStudent] = useState<Record<string, ISubmission[]>>(
    {},
  );
  const [listDashboardData, setListDashboardData] = useState<ClassTaskListDashboardData | null>(
    null,
  );

  const [feedbackStudent, setFeedbackStudent] = useState<ClassTaskDashboardStudentRow | null>(
    null,
  );

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      setSelectedOption(null);
      setHasSearched(false);
      setDashboardData(null);
      setListDashboardData(null);

      try {
        if (searchType === "tasks") {
          const response = await API.get(`/class-task/class/${classId}`);
          const formatted: ISearchOption[] = response.data.data.map(
            ({ task }: { task: { taskId: string; title: string } }) => ({
              id: task.taskId,
              title: task.title,
            }),
          );
          setOptions(formatted);
        } else {
          const response = await API.get(`/list/class/${classId}`, {
            params: { page: 1, limit: 100 },
          });
          const formatted: ISearchOption[] = response.data.data.map(
            (list: { listId: string; title: string }) => ({
              id: list.listId,
              title: list.title,
            }),
          );
          setOptions(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
        toast.error(
          searchType === "tasks" ? "Erro ao carregar tarefas." : "Erro ao carregar listas.",
        );
        setOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [searchType, classId]);

  const fetchTaskDashboard = async (taskId: string) => {
    setLoadingDashboard(true);
    try {
      const [dashboardResponse, submissionsResponse] = await Promise.all([
        API.get<ClassTaskDashboardData>("/class-task/dashboard", {
          params: { classId, taskId },
        }),
        API.get<ISubmission[]>(`/submission/task/${taskId}`),
      ]);

      setDashboardData(dashboardResponse.data);

      const grouped: Record<string, ISubmission[]> = {};
      submissionsResponse.data.forEach((submission) => {
        if (!grouped[submission.studentId]) grouped[submission.studentId] = [];
        grouped[submission.studentId].push(submission);
      });
      Object.values(grouped).forEach((list) =>
        list.sort(
          (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
        ),
      );
      setSubmissionsByStudent(grouped);
      setHasSearched(true);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard.");
      setDashboardData(null);
      setSubmissionsByStudent({});
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchListDashboard = async (listId: string) => {
    setLoadingDashboard(true);
    try {
      const response = await API.get<ClassTaskListDashboardData>("/class-task-list/dashboard", {
        params: { classId, listId },
      });
      setListDashboardData(response.data);
      setHasSearched(true);
    } catch (error) {
      console.error("Failed to fetch list dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard.");
      setListDashboardData(null);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleSearch = () => {
    if (!selectedOption) return;
    if (searchType === "tasks") {
      fetchTaskDashboard(selectedOption.id);
    } else {
      fetchListDashboard(selectedOption.id);
    }
  };

  const handleFeedbackSubmitted = () => {
    setFeedbackStudent(null);
    if (selectedOption && searchType === "tasks") {
      fetchTaskDashboard(selectedOption.id);
    }
  };

  const feedbackAttempts = useMemo(
    () => (feedbackStudent ? submissionsByStudent[feedbackStudent.studentId] ?? [] : []),
    [feedbackStudent, submissionsByStudent],
  );

  const autocompleteLabel = searchType === "tasks" ? "Selecione uma tarefa" : "Selecione uma lista";

  return (
    <Stack spacing={2.5} sx={{ pb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          p: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <ToggleButtonGroup
            value={searchType}
            exclusive
            onChange={(_, value: SearchType | null) => value && setSearchType(value)}
            size="small"
            sx={{
              flexShrink: 0,
              "& .MuiToggleButton-root": {
                px: 1.75,
                textTransform: "none",
                fontWeight: 500,
                borderColor: "divider",
                color: "text.secondary",
                gap: 0.75,
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                },
              },
            }}
          >
            <ToggleButton value="tasks">
              <AssignmentOutlinedIcon fontSize="small" />
              Tarefas
            </ToggleButton>
            <ToggleButton value="lists">
              <FormatListBulletedOutlinedIcon fontSize="small" />
              Listas
            </ToggleButton>
          </ToggleButtonGroup>

          <Autocomplete
            fullWidth
            size="small"
            options={options}
            loading={loadingOptions}
            value={selectedOption}
            onChange={(_, newValue) => setSelectedOption(newValue)}
            getOptionLabel={(option) => option.title}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={autocompleteLabel}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingOptions ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Button
            variant="contained"
            disableElevation
            onClick={handleSearch}
            disabled={!selectedOption || loadingDashboard}
            startIcon={
              loadingDashboard ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SearchIcon fontSize="small" />
              )
            }
            sx={{ px: 3, flexShrink: 0, textTransform: "none", fontWeight: 600 }}
          >
            Pesquisar
          </Button>
        </Stack>
      </Paper>

      {loadingDashboard ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : !hasSearched || (searchType === "tasks" ? !dashboardData : !listDashboardData) ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
            py: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <TuneOutlinedIcon />
          </Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {searchType === "tasks" ? "Selecione uma tarefa" : "Selecione uma lista"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, textAlign: "center" }}>
            Escolha {searchType === "tasks" ? "a tarefa" : "a lista"} desejada e aperte em
            pesquisar para visualizar os envios e as métricas da turma.
          </Typography>
        </Paper>
      ) : searchType === "tasks" && dashboardData ? (
        <Stack spacing={2.5}>
          <KpiCards kpis={dashboardData.kpis} />
          <StudentsTable rows={dashboardData.students} onOpenFeedback={setFeedbackStudent} />
        </Stack>
      ) : listDashboardData ? (
        <Stack spacing={2.5}>
          <ListKpiCards kpis={listDashboardData.kpis} />
          <ListStudentsTable columns={listDashboardData.columns} rows={listDashboardData.students} />
        </Stack>
      ) : null}

      <FeedbackDialog
        open={!!feedbackStudent}
        student={feedbackStudent}
        attempts={feedbackAttempts}
        onClose={() => setFeedbackStudent(null)}
        onSubmitted={handleFeedbackSubmitted}
      />
    </Stack>
  );
}

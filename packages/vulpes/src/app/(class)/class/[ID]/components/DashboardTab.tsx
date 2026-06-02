import API from "@/services/API";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import {
  alpha,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { registerPortugolLanguage } from "../../../../../../libs/monaco-config";
import { Editor } from "@monaco-editor/react";
import { ISubmission } from "@/@types/Submission";

type SearchType = "tasks" | "lists";

interface ISearchOption {
  id: string;
  title: string;
}

interface IDashboardStudent {
  studentId: string;
  name: string;
  lastSubmission: {
    submissionId: string;
    isCorrect: boolean;
    submittedAt: string;
    code: string;
    professorComments: string | null;
  } | null;
}

interface ICodeCardProps {
  submission: ISubmission | null;
}

const surfaceSx = {
  borderRadius: 2.5,
  border: "1px solid",
  borderColor: "rgba(255, 255, 255, 0.08)",
  bgcolor: "rgba(255, 255, 255, 0.03)",
  backgroundImage: "none",
  boxShadow: "none",
} as const;

function PanelHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ px: 2, pt: 2, pb: subtitle ? 0.5 : 1.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

const CodeCard: React.FC<ICodeCardProps> = ({ submission }: ICodeCardProps) => {
  const handleEditorDidMount = (editorInstance: any, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        ...surfaceSx,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <PanelHeader
        title="Código enviado"
        subtitle={
          submission
            ? "Última submissão do aluno selecionado"
            : "Selecione um aluno na tabela"
        }
      />
      <Box
        sx={{
          flex: 1,
          minHeight: 200,
          mx: 1.5,
          mb: 1.5,
          borderRadius: 1.5,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          bgcolor: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {submission ? (
          <Editor
            height="100%"
            theme="vs-dark"
            language="portugol"
            onMount={handleEditorDidMount}
            value={submission.code}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum código para exibir
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

const FeedbackCard: React.FC<ICodeCardProps> = ({
  submission,
}: ICodeCardProps) => {
  const [professorComments, setProfessorComments] = useState<string>("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (submission) {
      setProfessorComments(submission.professorComments || "");
    }
  }, [submission]);

  const sendFeedback = async () => {
    if (!professorComments.trim()) {
      toast.error("Defina o comentário do professor");
      return;
    }

    setFeedbackLoading(true);
    try {
      await API.put(`/submission/feedback/${submission?.submissionId}`, {
        professorComments,
      });
      toast.success("Feedback enviado com sucesso!");
      setProfessorComments("");
    } catch (error: any) {
      console.error("Failed to send feedback:", error);
      toast.error(error.response?.data?.message || "Erro ao enviar feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        ...surfaceSx,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <PanelHeader
        title="Feedback"
        subtitle="Comentário do professor para o aluno"
      />
      <Box
        sx={{
          flex: 1,
          minHeight: 160,
          px: 1.5,
          "& .w-md-editor": { borderRadius: 1.5 },
        }}
      >
        <MDEditor
          height="100%"
          style={{ width: "100%" }}
          value={professorComments}
          onChange={(val) => setProfessorComments(val || "")}
        />
      </Box>
      <Stack
        direction="row"
        gap={1}
        justifyContent="flex-end"
        sx={{ px: 2, py: 1.5 }}
      >
        <Button size="small" color="inherit" sx={{ color: "text.secondary" }}>
          Cancelar
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={sendFeedback}
          disabled={feedbackLoading || !submission}
        >
          {feedbackLoading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            "Enviar feedback"
          )}
        </Button>
      </Stack>
    </Paper>
  );
};

type StudentStatus = "not_sent" | "sent" | "correct" | "wrong";

function getStudentStatus(student: IDashboardStudent): StudentStatus {
  if (!student.lastSubmission) return "not_sent";
  if (student.lastSubmission.isCorrect) return "correct";
  return "wrong";
}

function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const theme = useTheme();

  if (status === "not_sent") {
    return (
      <Chip
        icon={<RemoveCircleOutlineIcon />}
        label="Não enviou"
        size="small"
        variant="outlined"
        sx={{
          borderColor: alpha(theme.palette.grey[500], 0.35),
          color: "text.secondary",
          "& .MuiChip-icon": { color: "text.secondary" },
        }}
      />
    );
  }

  if (status === "correct") {
    return (
      <Chip
        icon={<CheckCircleOutlineIcon />}
        label="Certo"
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.success.main, 0.12),
          color: "success.light",
          border: "none",
          "& .MuiChip-icon": { color: "success.main" },
        }}
      />
    );
  }

  if (status === "wrong") {
    return (
      <Chip
        icon={<ErrorOutlineIcon />}
        label="Incorreto"
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.error.main, 0.12),
          color: "error.light",
          border: "none",
          "& .MuiChip-icon": { color: "error.main" },
        }}
      />
    );
  }

  return (
    <Chip
      label="Enviou"
      size="small"
      sx={{
        bgcolor: alpha(theme.palette.primary.main, 0.12),
        color: "primary.light",
        border: "none",
      }}
    />
  );
}

interface StatCardProps {
  label: string;
  value: number;
  accent: "default" | "success" | "error" | "warning";
}

function StatCard({ label, value, accent }: StatCardProps) {
  const theme = useTheme();

  const accentColor =
    accent === "success"
      ? theme.palette.success.main
      : accent === "error"
        ? theme.palette.error.main
        : accent === "warning"
          ? theme.palette.primary.main
          : theme.palette.text.secondary;

  return (
    <Paper
      elevation={0}
      sx={{
        ...surfaceSx,
        px: 2,
        py: 1.75,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          lineHeight: 1,
          color: accent === "default" ? "text.primary" : accentColor,
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

interface IDashboardTabProps {
  classId: string;
}

export default function DashboardTab({ classId }: IDashboardTabProps) {
  const [searchType, setSearchType] = useState<SearchType>("tasks");
  const [options, setOptions] = useState<ISearchOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ISearchOption | null>(
    null,
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<ISubmission | null>(null);
  const [students, setStudents] = useState<IDashboardStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalStudents = students.length;

  const paginatedStudents = useMemo(
    () => students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [students, page, rowsPerPage],
  );

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let notSent = 0;

    for (const student of students) {
      const status = getStudentStatus(student);
      if (status === "correct") correct += 1;
      else if (status === "wrong") wrong += 1;
      else notSent += 1;
    }

    return { correct, wrong, notSent, total: students.length };
  }, [students]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      setSelectedOption(null);
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
          searchType === "tasks"
            ? "Erro ao carregar tarefas."
            : "Erro ao carregar listas.",
        );
        setOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [searchType, classId]);

  const handleSearchTypeChange = (event: SelectChangeEvent<SearchType>) => {
    setSearchType(event.target.value as SearchType);
  };

  const handleSearch = async () => {
    if (!selectedOption) {
      toast.error(
        searchType === "tasks"
          ? "Selecione uma tarefa para pesquisar."
          : "Selecione uma lista para pesquisar.",
      );
      return;
    }

    setLoadingStudents(true);
    setHasSearched(true);
    setPage(0);
    setSelectedSubmission(null);
    try {
      const params =
        searchType === "tasks"
          ? { classId, taskId: selectedOption.id }
          : { classId, listId: selectedOption.id };

      const response = await API.get(`/class-task/dashboard`, { params });
      setStudents(response.data.students ?? []);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const autocompleteLabel = useMemo(
    () => (searchType === "tasks" ? "Pesquisar tarefa" : "Pesquisar lista"),
    [searchType],
  );

  return (
    <Stack spacing={2.5} sx={{ minHeight: "70vh", pb: 2 }}>
      <Paper elevation={0} sx={{ ...surfaceSx, p: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ md: "flex-start" }}
        >
          <FormControl size="small" sx={{ minWidth: { md: 140 } }}>
            <InputLabel id="dashboard-search-type-label">Tipo</InputLabel>
            <Select
              labelId="dashboard-search-type-label"
              label="Tipo"
              value={searchType}
              onChange={handleSearchTypeChange}
            >
              <MenuItem value="tasks">Tarefas</MenuItem>
              <MenuItem value="lists">Listas</MenuItem>
            </Select>
          </FormControl>

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

          <IconButton
            color="primary"
            onClick={handleSearch}
            disabled={loadingStudents}
            aria-label="Pesquisar"
            sx={{
              alignSelf: { xs: "flex-end", md: "center" },
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": {
                bgcolor: alpha("#e36c1c", 0.35),
                color: "rgba(255,255,255,0.5)",
              },
            }}
          >
            {loadingStudents ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SearchIcon fontSize="small" />
            )}
          </IconButton>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          flex: 1,
          minHeight: 0,
          alignItems: "stretch",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            flex: { xs: "1 1 auto", lg: "0 0 46%" },
            minWidth: 0,
            minHeight: { lg: "calc(100vh - 280px)" },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
            }}
          >
            <StatCard
              label="Enviaram certo"
              value={stats.correct}
              accent="success"
            />
            <StatCard
              label="Enviaram incorreto"
              value={stats.wrong}
              accent="error"
            />
            <StatCard
              label="Não enviaram"
              value={stats.notSent}
              accent="default"
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              ...surfaceSx,
              flex: 1,
              minHeight: 360,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <PanelHeader
              title="Alunos"
              subtitle={
                hasSearched && stats.total > 0
                  ? `${stats.total} aluno${stats.total !== 1 ? "s" : ""} na turma`
                  : "Resultados da tarefa ou lista selecionada"
              }
            />

            <TableContainer sx={{ flex: 1, minHeight: 0 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 120 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Aluno</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 168 }}>
                      Enviado em
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, width: 96 }}
                    >
                      Resultado
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingStudents ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary" variant="body2">
                          {hasSearched
                            ? "Nenhum aluno encontrado."
                            : "Selecione uma tarefa ou lista e pesquise."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => {
                      const status = getStudentStatus(student);
                      const isSelected =
                        !!student.lastSubmission &&
                        student.lastSubmission.submissionId ===
                          selectedSubmission?.submissionId;

                      return (
                        <TableRow
                          key={student.studentId}
                          hover
                          selected={isSelected}
                          onClick={() => {
                            setSelectedSubmission(
                              student.lastSubmission as ISubmission,
                            );
                          }}
                          sx={{
                            cursor: student.lastSubmission
                              ? "pointer"
                              : "default",
                            "&.Mui-selected": {
                              bgcolor: "rgba(227, 108, 28, 0.1) !important",
                            },
                            "&.Mui-selected:hover": {
                              bgcolor: "rgba(227, 108, 28, 0.14) !important",
                            },
                          }}
                        >
                          <TableCell>
                            <StudentStatusBadge status={status} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {student.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {student.lastSubmission
                                ? new Date(
                                    student.lastSubmission.submittedAt,
                                  ).toLocaleString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {!student.lastSubmission ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                —
                              </Typography>
                            ) : student.lastSubmission.isCorrect ? (
                              <Typography
                                variant="body2"
                                color="success.main"
                                fontWeight={500}
                              >
                                Correto
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="error.main"
                                fontWeight={500}
                              >
                                Incorreto
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalStudents}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count}`
              }
              sx={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                ".MuiTablePagination-toolbar": { minHeight: 44 },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  { fontSize: "0.8125rem" },
              }}
            />
          </Paper>
        </Stack>

        <Stack
          spacing={2}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: { lg: "calc(100vh - 280px)" },
          }}
        >
          <CodeCard submission={selectedSubmission} />
          <FeedbackCard submission={selectedSubmission} />
        </Stack>
      </Box>
    </Stack>
  );
}

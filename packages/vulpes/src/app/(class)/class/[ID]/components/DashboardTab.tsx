import API from "@/services/API";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
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
    isCorrect: boolean;
    submittedAt: string;
    code: string;
    professorComments: string | null;
  } | null;
}

interface ICodeCardProps {
  submission: ISubmission | null;
}

const CodeCard: React.FC<ICodeCardProps> = ({ submission }: ICodeCardProps) => {
  const handleEditorDidMount = (editorInstance: any, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  return (
    <Box
      component={Paper}
      elevation={2}
      sx={{
        gridColumn: "7 / 13",
        gridRow: "1/9",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
      }}
    >
      {submission ? (
        <Editor
          height="100%"
          theme="vs-dark"
          language="portugol"
          onMount={handleEditorDidMount}
          value={submission ? submission.code : ""}
          options={{ readOnly: true }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          Selecione um aluno para vizualizar
        </Typography>
      )}
    </Box>
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
      // await fetchSubmissions();
      toast.success("Feedback enviado com sucesso!");
      // setSelectedSubmission(null);
      setProfessorComments("");
    } catch (error: any) {
      console.error("Failed to send feedback:", error);
      toast.error(error.response?.data?.message || "Erro ao enviar feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <Box
      sx={{
        gridColumn: "7/13",
        gridRow: "9/19",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6">Feedback</Typography>
      <MDEditor
        height="100%"
        style={{ width: "100%" }}
        value={professorComments}
        onChange={(val) => setProfessorComments(val || "")}
      />
      <Stack direction="row" gap={2} justifyContent="flex-end">
        <Button>Cancelar</Button>
        <Button
          variant="contained"
          onClick={sendFeedback}
          disabled={feedbackLoading}
        >
          {feedbackLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Enviar Feedback"
          )}
        </Button>
      </Stack>
    </Box>
  );
};

type StudentStatus = "not_sent" | "sent" | "correct" | "wrong";

function getStudentStatus(student: IDashboardStudent): StudentStatus {
  if (!student.lastSubmission) return "not_sent";
  if (student.lastSubmission.isCorrect) return "correct";
  return "wrong";
}

function StudentStatusBadge({ status }: { status: StudentStatus }) {
  if (status === "not_sent") {
    return (
      <Chip
        icon={<RemoveCircleIcon sx={{ color: "#cfd8dc !important" }} />}
        label="Não enviou"
        size="small"
        sx={{
          bgcolor: "rgba(255,255,255,0.06)",
          color: "#cfd8dc",
          border: "1px solid rgba(255,255,255,0.12)",
          fontWeight: 600,
        }}
      />
    );
  }

  if (status === "correct") {
    return (
      <Chip
        icon={<CheckCircleIcon sx={{ color: "#66bb6a !important" }} />}
        label="Enviou certo"
        size="small"
        sx={{
          bgcolor: "rgba(102,187,106,0.12)",
          color: "#a5d6a7",
          border: "1px solid rgba(102,187,106,0.25)",
          fontWeight: 600,
        }}
      />
    );
  }

  if (status === "wrong") {
    return (
      <Chip
        icon={<ErrorIcon sx={{ color: "#ef5350 !important" }} />}
        label="Enviou errado"
        size="small"
        sx={{
          bgcolor: "rgba(239,83,80,0.12)",
          color: "#ef9a9a",
          border: "1px solid rgba(239,83,80,0.25)",
          fontWeight: 600,
        }}
      />
    );
  }

  return (
    <Chip
      label="Enviou"
      size="small"
      sx={{
        bgcolor: "rgba(227,108,28,0.12)",
        color: "#eea777",
        border: "1px solid rgba(227,108,28,0.25)",
        fontWeight: 600,
      }}
    />
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

  // TODO: paginação mockada (client-side). Idealmente a rota
  // `class-task/dashboard` deve receber `page`/`limit` e retornar o total de
  // registros, para então paginarmos no servidor. Trocar `page`/`rowsPerPage`
  // por parâmetros enviados ao backend e usar o `total` retornado.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // TODO: substituir pelo total retornado pela API quando a paginação for
  // movida para o backend.
  const totalStudents = students.length;

  // TODO: remover este fatiamento client-side quando o backend paginar os
  // resultados — a API deverá retornar apenas a página atual.
  const paginatedStudents = useMemo(
    () => students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [students, page, rowsPerPage],
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    // TODO: ao paginar no servidor, disparar aqui a busca da nova página.
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
    setPage(0); // TODO: ao paginar no servidor, buscar a primeira página aqui.
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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gridTemplateRows: "repeat(24, minmax(28px, auto))",
        gap: 2,
        minHeight: "70vh",
      }}
    >
      {/* 1 - Select de tipo de pesquisa */}
      <Box
        sx={{
          gridColumn: "1 / 3",
          gridRow: "1 / 3",
          display: "flex",
          alignItems: "top",
        }}
      >
        <FormControl fullWidth>
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
      </Box>

      {/* 2 - Autocomplete de busca */}
      <Box
        sx={{
          gridColumn: "3 / 7",
          gridRow: "1 / 3",
          display: "flex",
          alignItems: "top",
          gap: 2,
        }}
      >
        <Autocomplete
          fullWidth
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
                      <CircularProgress color="inherit" size={20} />
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
          onClick={handleSearch}
          disabled={loadingStudents}
          sx={{ width: "32px", height: "56px" }}
        >
          {loadingStudents ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SearchIcon />
          )}
        </Button>
      </Box>

      {/* 4 - Tabela de alunos */}
      <Box
        sx={{
          gridColumn: "1 / 7",
          gridRow: "7/19",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundImage: "none",
          }}
        >
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "text.secondary",
                    bgcolor: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                  },
                }}
              >
                <TableCell width={160}>Status</TableCell>
                <TableCell>Aluno</TableCell>
                <TableCell width={200}>Última submissão</TableCell>
                <TableCell width={130} align="center">
                  Resultado
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingStudents ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
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
                  return (
                    <TableRow
                      key={student.studentId}
                      hover
                      sx={{
                        transition: "background-color 0.15s ease",
                        "&:last-child td": { borderBottom: 0 },
                        "& td": {
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        },
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedSubmission(
                          student.lastSubmission as ISubmission,
                        );
                      }}
                    >
                      <TableCell>
                        <StudentStatusBadge status={status} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {student.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {student.lastSubmission
                            ? new Date(
                                student.lastSubmission.submittedAt,
                              ).toLocaleString()
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {!student.lastSubmission ? (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        ) : student.lastSubmission.isCorrect ? (
                          <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ fontWeight: 600 }}
                          >
                            Correto
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            color="error.main"
                            sx={{ fontWeight: 600 }}
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

        {/* TODO: paginação mockada — atualmente fatia os dados no client.
            Quando o backend suportar paginação, usar o `total` retornado pela
            API em `count` e disparar a busca da página em `onPageChange`. */}
        <TablePagination
          component="div"
          count={totalStudents}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            ".MuiTablePagination-toolbar": { minHeight: 48 },
          }}
        />
      </Box>

      <Box
        sx={{
          gridColumn: "1 / 7",
          gridRow: "3 / 7",
          minHeight: 0,
          display: "flex",
          gap: 2,
        }}
      >
        <div className="bg-black w-full h-full"></div>
        <div className="bg-black w-full h-full"></div>
        <div className="bg-black w-full h-full"></div>
      </Box>
      <FeedbackCard submission={selectedSubmission} />
      <CodeCard submission={selectedSubmission} />
    </Box>
  );
}

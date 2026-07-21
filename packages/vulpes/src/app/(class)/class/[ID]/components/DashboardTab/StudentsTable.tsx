import { ClassTaskDashboardStudentRow, SubmissionStatus } from "@/@types/ClassTaskDashboard";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  alpha,
  Avatar,
  Box,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  CORRECT: "Enviou",
  INCORRECT: "Enviou errado",
  NOT_SUBMITTED: "Não enviou",
};

const STATUS_PRIORITY: Record<SubmissionStatus, number> = {
  NOT_SUBMITTED: 0,
  INCORRECT: 1,
  CORRECT: 2,
};

type OrderBy = "name" | "status" | "submissions" | "lastSubmittedAt" | "feedback";
type Order = "asc" | "desc";

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const theme = useTheme();

  if (status === "NOT_SUBMITTED") {
    return (
      <Chip
        icon={<RemoveCircleOutlineIcon />}
        label={STATUS_LABEL.NOT_SUBMITTED}
        size="small"
        variant="outlined"
        sx={{
          borderColor: alpha(theme.palette.text.secondary, 0.35),
          color: "text.secondary",
          "& .MuiChip-icon": { color: "text.secondary" },
        }}
      />
    );
  }

  if (status === "CORRECT") {
    return (
      <Chip
        icon={<CheckCircleOutlineIcon />}
        label={STATUS_LABEL.CORRECT}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.success.main, 0.12),
          color: theme.palette.success.main,
          border: "none",
          fontWeight: 600,
          "& .MuiChip-icon": { color: theme.palette.success.main },
        }}
      />
    );
  }

  return (
    <Chip
      icon={<WarningAmberOutlinedIcon />}
      label={STATUS_LABEL.INCORRECT}
      size="small"
      sx={{
        bgcolor: alpha(theme.palette.error.main, 0.12),
        color: theme.palette.error.main,
        border: "none",
        fontWeight: 600,
        "& .MuiChip-icon": { color: theme.palette.error.main },
      }}
    />
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function getFeedbackState(row: ClassTaskDashboardStudentRow) {
  const canGiveFeedback = row.lastSubmissionId !== null;
  const needsFeedback = canGiveFeedback && row.hasPendingFeedback;
  return { canGiveFeedback, needsFeedback };
}

function getSortValue(row: ClassTaskDashboardStudentRow, orderBy: OrderBy): string | number {
  switch (orderBy) {
    case "name":
      return row.name.toLowerCase();
    case "status":
      return STATUS_PRIORITY[row.status];
    case "submissions":
      return row.submissionsCount;
    case "lastSubmittedAt":
      return row.lastSubmittedAt ? new Date(row.lastSubmittedAt).getTime() : -1;
    case "feedback": {
      const { canGiveFeedback, needsFeedback } = getFeedbackState(row);
      if (!canGiveFeedback) return 0;
      return needsFeedback ? 1 : 2;
    }
    default:
      return 0;
  }
}

const FILTERS: { key: SubmissionStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "CORRECT", label: "Enviou" },
  { key: "INCORRECT", label: "Enviou errado" },
  { key: "NOT_SUBMITTED", label: "Não enviou" },
];

const HEADERS: { key: OrderBy; label: string; align?: "center" | "right" }[] = [
  { key: "name", label: "Aluno" },
  { key: "status", label: "Estado do envio" },
  { key: "submissions", label: "Envios", align: "center" },
  { key: "lastSubmittedAt", label: "Último envio" },
  { key: "feedback", label: "Feedback", align: "right" },
];

interface IStudentsTableProps {
  rows: ClassTaskDashboardStudentRow[];
  onOpenFeedback: (row: ClassTaskDashboardStudentRow) => void;
}

export default function StudentsTable({ rows, onOpenFeedback }: IStudentsTableProps) {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>("name");
  const [order, setOrder] = useState<Order>("asc");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesQuery =
        !normalizedQuery || row.name.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [rows, statusFilter, query]);

  const sortedRows = useMemo(() => {
    const direction = order === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const va = getSortValue(a, orderBy);
      const vb = getSortValue(b, orderBy);
      if (va < vb) return -1 * direction;
      if (va > vb) return 1 * direction;
      return a.name.localeCompare(b.name);
    });
  }, [filteredRows, orderBy, order]);

  const handleFilterClick = (key: SubmissionStatus | "all") => {
    setStatusFilter(key);
  };

  const handleSort = (column: OrderBy) => {
    if (orderBy === column) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(column);
      setOrder("asc");
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ p: 2, pb: 1.5 }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Alunos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filteredRows.length} de {rows.length} aluno{rows.length !== 1 ? "s" : ""} da turma
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Buscar aluno"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ minWidth: { sm: 220 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, flexWrap: "wrap", rowGap: 1 }}>
        {FILTERS.map((filter) => {
          const selected = statusFilter === filter.key;
          return (
            <Chip
              key={filter.key}
              label={filter.label}
              size="small"
              onClick={() => handleFilterClick(filter.key)}
              sx={{
                fontWeight: 500,
                bgcolor: selected ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.06),
                color: selected ? theme.palette.primary.contrastText : "text.secondary",
                "&:hover": {
                  bgcolor: selected
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.text.primary, 0.1),
                },
              }}
            />
          );
        })}
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {HEADERS.map((header) => (
                <TableCell key={header.key} align={header.align} sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === header.key}
                    direction={orderBy === header.key ? order : "asc"}
                    onClick={() => handleSort(header.key)}
                  >
                    {header.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum aluno encontrado para este filtro.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => {
                const { canGiveFeedback, needsFeedback } = getFeedbackState(row);

                return (
                  <TableRow key={row.studentId} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                            color: theme.palette.primary.main,
                          }}
                        >
                          {initialsFrom(row.name)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {row.name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>

                    <TableCell align="center">
                      {row.submissionsCount > 0 ? (
                        <Chip
                          icon={<HistoryOutlinedIcon sx={{ fontSize: 14 }} />}
                          label={row.submissionsCount}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            borderColor: alpha(theme.palette.text.secondary, 0.3),
                            color: "text.secondary",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(row.lastSubmittedAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        icon={<SendOutlinedIcon sx={{ fontSize: 15 }} />}
                        label={needsFeedback ? "Enviar feedback" : "Editar feedback"}
                        size="small"
                        clickable={canGiveFeedback}
                        disabled={!canGiveFeedback}
                        onClick={canGiveFeedback ? () => onOpenFeedback(row) : undefined}
                        variant={needsFeedback ? "outlined" : "filled"}
                        sx={{
                          fontWeight: 500,
                          paddingY: 1.5,
                          paddingX: 1.2,
                          ...(needsFeedback
                            ? {
                                borderColor: alpha(theme.palette.primary.main, 0.4),
                                color: theme.palette.primary.main,
                                "& .MuiChip-icon": { color: theme.palette.primary.main },
                              }
                            : {
                                bgcolor: alpha(theme.palette.primary.main, 0.14),
                                color: theme.palette.primary.main,
                                border: "none",
                                "& .MuiChip-icon": { color: theme.palette.primary.main },
                              }),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

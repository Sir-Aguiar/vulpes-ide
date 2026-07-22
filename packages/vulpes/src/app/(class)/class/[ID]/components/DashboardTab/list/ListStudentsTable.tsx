import {
  ClassTaskListDashboardColumn,
  ClassTaskListDashboardStudentRow,
} from "@/@types/ClassTaskListDashboard";
import { SubmissionStatus } from "@/@types/ClassTaskDashboard";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
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
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  CORRECT: "Enviou",
  INCORRECT: "Enviou errado",
  NOT_SUBMITTED: "Não enviou",
};

type OrderBy = "name" | "score" | "submissions" | "lastSubmittedAt";
type Order = "asc" | "desc";

function StatusDot({ status, title }: { status: SubmissionStatus; title: string }) {
  const theme = useTheme();

  const color =
    status === "CORRECT"
      ? theme.palette.success.main
      : status === "INCORRECT"
        ? theme.palette.error.main
        : theme.palette.text.secondary;

  const icon =
    status === "CORRECT" ? (
      <CheckIcon sx={{ fontSize: 14 }} />
    ) : status === "INCORRECT" ? (
      <CloseIcon sx={{ fontSize: 14 }} />
    ) : (
      <RemoveIcon sx={{ fontSize: 12 }} />
    );

  return (
    <Tooltip title={`${title} — ${STATUS_LABEL[status]}`}>
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          bgcolor: status === "NOT_SUBMITTED" ? alpha(color, 0.08) : alpha(color, 0.14),
          color,
          border: status === "NOT_SUBMITTED" ? `1px solid ${alpha(color, 0.3)}` : "none",
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
}

function scoreColor(score: number, theme: Theme) {
  if (score >= 70) return theme.palette.success.main;
  if (score >= 40) return theme.palette.warning.main;
  return theme.palette.error.main;
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

function getSortValue(row: ClassTaskListDashboardStudentRow, orderBy: OrderBy): string | number {
  switch (orderBy) {
    case "name":
      return row.name.toLowerCase();
    case "score":
      return row.score;
    case "submissions":
      return row.submissionsCount;
    case "lastSubmittedAt":
      return row.lastSubmittedAt ? new Date(row.lastSubmittedAt).getTime() : -1;
  }
}

interface IListStudentsTableProps {
  columns: ClassTaskListDashboardColumn[];
  rows: ClassTaskListDashboardStudentRow[];
}

export default function ListStudentsTable({ columns, rows }: IListStudentsTableProps) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [orderBy, setOrderBy] = useState<OrderBy>("name");
  const [order, setOrder] = useState<Order>("asc");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !normalizedQuery || row.name.toLowerCase().includes(normalizedQuery);
      const matchesPending = !onlyPending || row.submissionsCount === 0;
      return matchesQuery && matchesPending;
    });
  }, [rows, query, onlyPending]);

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

      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
        <Chip
          label="Apenas pendentes"
          size="small"
          onClick={() => setOnlyPending((prev) => !prev)}
          sx={{
            fontWeight: 500,
            bgcolor: onlyPending ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.06),
            color: onlyPending ? theme.palette.primary.contrastText : "text.secondary",
            "&:hover": {
              bgcolor: onlyPending
                ? theme.palette.primary.dark
                : alpha(theme.palette.text.primary, 0.1),
            },
          }}
        />
      </Stack>

      <TableContainer>
        <Table size="small" sx={{ minWidth: 200 + columns.length * 60 + 260 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 200, maxWidth: 200 }}>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Aluno
                </TableSortLabel>
              </TableCell>

              {columns.map((column) => (
                <TableCell
                  key={column.classTaskListId}
                  align="center"
                  sx={{ fontWeight: 600, px: 0.5, width: 60, maxWidth: 60 }}
                >
                  <Tooltip title={column.title}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {`T${column.index}`}
                    </Typography>
                  </Tooltip>
                </TableCell>
              ))}

              <TableCell align="center" sx={{ fontWeight: 600, px: 0.5 }}>
                <TableSortLabel
                  active={orderBy === "score"}
                  direction={orderBy === "score" ? order : "asc"}
                  onClick={() => handleSort("score")}
                  sx={{ width: "100%", justifyContent: "center" }}
                >
                  Nota
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, px: 0.5 }}>
                <TableSortLabel
                  active={orderBy === "submissions"}
                  direction={orderBy === "submissions" ? order : "asc"}
                  onClick={() => handleSort("submissions")}
                  sx={{ width: "100%", justifyContent: "center" }}
                >
                  Envios
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === "lastSubmittedAt"}
                  direction={orderBy === "lastSubmittedAt" ? order : "asc"}
                  onClick={() => handleSort("lastSubmittedAt")}
                >
                  Último envio
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 4} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum aluno encontrado para este filtro.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => (
                <TableRow key={row.studentId} hover>
                  <TableCell sx={{ width: 200, maxWidth: 200 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          flexShrink: 0,
                          bgcolor: alpha(theme.palette.primary.main, 0.16),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {initialsFrom(row.name)}
                      </Avatar>
                      <Tooltip title={row.name}>
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ minWidth: 0 }}>
                          {row.name}
                        </Typography>
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  {row.cells.map((cell, index) => (
                    <TableCell
                      key={cell.classTaskListId}
                      align="center"
                      sx={{ px: 0.5, width: 60, maxWidth: 60 }}
                    >
                      <StatusDot status={cell.status} title={columns[index]?.title ?? ""} />
                    </TableCell>
                  ))}

                  <TableCell align="center" sx={{ px: 0.5 }}>
                    <Chip
                      label={`${row.score}%`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        minWidth: 52,
                        bgcolor: alpha(scoreColor(row.score, theme), 0.12),
                        color: scoreColor(row.score, theme),
                        border: "none",
                      }}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ px: 0.5 }}>
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
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatDate(row.lastSubmittedAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 200, maxWidth: 200 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap>
                  Aproveitamento
                </Typography>
              </TableCell>
              {columns.map((column) => {
                const pct = Math.round(column.accuracyRate * 100);
                return (
                  <TableCell
                    key={column.classTaskListId}
                    align="center"
                    sx={{ px: 0.5, width: 60, maxWidth: 60 }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: column.submittedCount > 0 ? scoreColor(pct, theme) : "text.secondary" }}
                    >
                      {column.submittedCount > 0 ? `${pct}%` : "—"}
                    </Typography>
                  </TableCell>
                );
              })}
              <TableCell colSpan={3} />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
}

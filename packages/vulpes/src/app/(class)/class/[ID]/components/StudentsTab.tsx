import API from "@/services/API";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

interface IClassStudent {
  classId: string;
  studentId: string;
  createdAt: string;
  student: {
    userId: string;
    name: string;
    email: string;
  };
}

interface IGetClassStudentsResponse {
  data: IClassStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type OrderBy = "name" | "email" | "createdAt";
type Order = "asc" | "desc";

function formatEnrollmentDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function matchesQuery(row: IClassStudent, query: string) {
  const needle = query.trim().toLocaleLowerCase("pt-BR");
  if (!needle) return true;
  const haystack = [
    row.student.name,
    row.student.email,
    formatEnrollmentDate(row.createdAt),
  ]
    .join(" ")
    .toLocaleLowerCase("pt-BR");
  return haystack.includes(needle);
}

function compareStudents(a: IClassStudent, b: IClassStudent, orderBy: OrderBy) {
  if (orderBy === "createdAt") {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }
  const left = orderBy === "name" ? a.student.name : a.student.email;
  const right = orderBy === "name" ? b.student.name : b.student.email;
  return left.localeCompare(right, "pt-BR", { sensitivity: "base" });
}

export default function StudentsTab({ classId }: { classId: string }) {
  const [students, setStudents] = useState<IClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>("name");
  const [order, setOrder] = useState<Order>("asc");

  const visibleStudents = useMemo(() => {
    const filtered = students.filter((row) => matchesQuery(row, query));
    const direction = order === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareStudents(a, b, orderBy) * direction,
    );
  }, [students, query, orderBy, order]);

  const handleSort = (column: OrderBy) => {
    if (orderBy === column) {
      setOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setOrderBy(column);
    setOrder("asc");
  };

  useEffect(() => {
    let cancelled = false;

    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const first = await API.get<IGetClassStudentsResponse>(
          `/class-student/class/${classId}`,
          { params: { page: 1, limit: 100 } },
        );
        const all = [...first.data.data];
        for (let page = 2; page <= first.data.totalPages; page += 1) {
          const next = await API.get<IGetClassStudentsResponse>(
            `/class-student/class/${classId}`,
            { params: { page, limit: 100 } },
          );
          all.push(...next.data.data);
        }
        if (!cancelled) setStudents(all);
      } catch (err) {
        console.error("Failed to fetch class students:", err);
        if (!cancelled) setError("Não foi possível carregar os alunos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <TextField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Pesquisar alunos"
        size="small"
        fullWidth
        sx={{ mb: 2, maxWidth: 420 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {students.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            Nenhum aluno matriculado nesta turma.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === "name" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleSort("name")}
                  >
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === "email" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "email"}
                    direction={orderBy === "email" ? order : "asc"}
                    onClick={() => handleSort("email")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={orderBy === "createdAt" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "createdAt"}
                    direction={orderBy === "createdAt" ? order : "asc"}
                    onClick={() => handleSort("createdAt")}
                  >
                    Data de Matrícula
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      Nenhum aluno encontrado para essa pesquisa.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleStudents.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>{row.student.name}</TableCell>
                    <TableCell>{row.student.email}</TableCell>
                    <TableCell>{formatEnrollmentDate(row.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

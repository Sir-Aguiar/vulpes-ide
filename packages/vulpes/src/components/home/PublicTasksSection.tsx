"use client";

import { IGetTasksResponse, ITaskListItem } from "@/@types/Task";
import TaskCard from "@/components/tasks/TaskCard";
import { useAppTheme } from "@/providers/ColorModeProvider";
import API from "@/services/API";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const montserrat = Montserrat({ subsets: ["latin"] });

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 500;

type PublishedSortOption =
  | "createdAt-desc"
  | "createdAt-asc"
  | "title-asc"
  | "title-desc";

const SORT_OPTIONS: { value: PublishedSortOption; label: string }[] = [
  { value: "createdAt-desc", label: "Data de criação (mais recente)" },
  { value: "createdAt-asc", label: "Data de criação (mais antiga)" },
  { value: "title-asc", label: "Ordem alfabética (A–Z)" },
  { value: "title-desc", label: "Ordem alfabética (Z–A)" },
];

function parseSortOption(option: PublishedSortOption) {
  const [sortBy, order] = option.split("-") as [
    "createdAt" | "title",
    "asc" | "desc",
  ];
  return { sortBy, order };
}

export default function PublicTasksSection() {
  const theme = useAppTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tasks, setTasks] = useState<ITaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] =
    useState<PublishedSortOption>("createdAt-desc");

  const { sortBy, order } = parseSortOption(sortOption);

  const searchFieldSx = useMemo(
    () => ({
      "& .MuiOutlinedInput-root": {
        bgcolor: theme.bgCard,
        color: theme.text,
        borderRadius: 2,
        "& fieldset": { borderColor: theme.border },
        "&:hover fieldset": { borderColor: theme.borderStrong },
        "&.Mui-focused fieldset": { borderColor: theme.brand },
      },
      "& .MuiInputBase-input::placeholder": {
        color: theme.textMuted,
        opacity: 1,
      },
      "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: theme.textMuted },
    }),
    [theme],
  );

  const selectSx = useMemo(
    () => ({
      minWidth: { xs: "100%", sm: 280 },
      bgcolor: theme.bgCard,
      color: theme.text,
      borderRadius: 2,
      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.borderStrong,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.brand,
      },
      "& .MuiSvgIcon-root": { color: theme.textMuted },
    }),
    [theme],
  );

  const applySearch = useCallback((value: string) => {
    const trimmed = value.trim();
    setSearchQuery((current) => {
      if (current !== trimmed) {
        setPage(1);
      }
      return trimmed;
    });
  }, []);

  const scheduleSearch = useCallback(
    (value: string) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        applySearch(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [applySearch],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    scheduleSearch(value);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    applySearch(searchInput);
  };

  const handleSearchBlur = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    applySearch(searchInput);
  };

  const handleSortChange = (value: PublishedSortOption) => {
    setSortOption(value);
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: PAGE_SIZE,
          sortBy,
          order,
        };
        if (searchQuery) params.search = searchQuery;

        const response = await API.get<IGetTasksResponse>("/task/published", {
          params,
        });
        setTasks(response.data.data ?? []);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Failed to fetch published tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchTasks();
  }, [page, searchQuery, sortBy, order]);

  return (
    <Box
      ref={sectionRef}
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
          sx={{ mb: 4 }}
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

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <TextField
            fullWidth
            placeholder="Buscar tarefas por título..."
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearchBlur}
            sx={searchFieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl sx={selectSx}>
            <InputLabel id="public-tasks-sort-label">Ordenar por</InputLabel>
            <Select
              labelId="public-tasks-sort-label"
              label="Ordenar por"
              value={sortOption}
              onChange={(event) =>
                handleSortChange(event.target.value as PublishedSortOption)
              }
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: theme.brand }} />
          </Box>
        ) : tasks.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              gap: 2,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: theme.border,
              color: theme.textSecondary,
              textAlign: "center",
              px: 3,
            }}
          >
            <AssignmentOutlinedIcon
              sx={{ fontSize: 48, color: theme.textMuted }}
            />
            <Typography variant="body1">
              {searchQuery
                ? "Nenhuma tarefa encontrada para este título."
                : "Nenhuma tarefa pública disponível no momento."}
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
              {tasks.map((task, index) => (
                <TaskCard key={task.taskId} task={task} index={index} />
              ))}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  size="large"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: theme.textSecondary,
                      borderColor: theme.border,
                    },
                    "& .MuiPaginationItem-root:hover": {
                      bgcolor: "rgba(255,109,0,0.08)",
                    },
                    "& .Mui-selected": {
                      bgcolor: `${theme.brand} !important`,
                      color: "#fff !important",
                      "&:hover": { bgcolor: `${theme.brandDark} !important` },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

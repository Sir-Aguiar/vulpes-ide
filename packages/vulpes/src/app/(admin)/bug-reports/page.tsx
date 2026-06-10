"use client";

import { IBugReport, BugReportStatus } from "@/@types/BugReport";
import AppNavBar from "@/components/AppNavBar";
import AuthGuard from "@/components/AuthGuard";
import BugReportDetailDialog from "@/components/BugReport/BugReportDetailDialog";
import {
  BUG_REPORT_SEVERITY_COLORS,
  BUG_REPORT_SEVERITY_LABELS,
  BUG_REPORT_STATUS_COLORS,
  BUG_REPORT_STATUS_LABELS,
} from "@/components/BugReport/bugReportLabels";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { getBugReports } from "@/services/bugReport";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Montserrat } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const montserrat = Montserrat({ subsets: ["latin"] });

const STATUS_TABS: Array<{ key: BugReportStatus | "ALL"; label: string }> = [
  { key: "ALL", label: "Todos" },
  { key: "OPEN", label: "Abertos" },
  { key: "IN_PROGRESS", label: "Em andamento" },
  { key: "RESOLVED", label: "Resolvidos" },
  { key: "CLOSED", label: "Fechados" },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max = 140) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export default function BugReportsPage() {
  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <AppNavBar />
      <BugReportsContent />
    </AuthGuard>
  );
}

function BugReportsContent() {
  const theme = useAppTheme();
  const [reports, setReports] = useState<IBugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<IBugReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getBugReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch bug reports:", error);
      toast.error("Erro ao carregar reports de bug.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const statusFilter = STATUS_TABS[tabIndex].key;

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "ALL" || report.status === statusFilter;

      if (!query) return matchesStatus;

      const haystack = [
        report.description,
        report.path,
        report.user.name,
        report.user.email,
        String(report.bugReportId),
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && haystack.includes(query);
    });
  }, [reports, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: reports.length };
    for (const status of STATUS_TABS) {
      if (status.key !== "ALL") {
        counts[status.key] = reports.filter((r) => r.status === status.key).length;
      }
    }
    return counts;
  }, [reports]);

  const handleReportUpdated = (updated: IBugReport) => {
    setReports((current) =>
      current.map((report) =>
        report.bugReportId === updated.bugReportId ? updated : report,
      ),
    );
    setSelectedReport(updated);
  };

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
            Administração
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            className={montserrat.className}
            sx={{ color: theme.text, fontWeight: 800 }}
          >
            Reports de bug
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.textSecondary, maxWidth: 620, lineHeight: 1.6 }}
          >
            Visualize, priorize e acompanhe os bugs reportados pelos usuários.
            {!loading && reports.length > 0 && (
              <Box component="span" sx={{ color: theme.textMuted, ml: 0.5 }}>
                ({reports.length}{" "}
                {reports.length === 1 ? "report" : "reports"})
              </Box>
            )}
          </Typography>
        </Stack>

        <TextField
          fullWidth
          placeholder="Buscar por descrição, rota, usuário ou ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ ...searchFieldSx, mb: 3 }}
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

        <Tabs
          value={tabIndex}
          onChange={(_, value) => setTabIndex(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            borderBottom: "1px solid",
            borderColor: theme.border,
            "& .MuiTab-root": {
              color: theme.textSecondary,
              textTransform: "none",
              fontWeight: 500,
              minHeight: 48,
            },
            "& .Mui-selected": { color: theme.brand },
            "& .MuiTabs-indicator": { backgroundColor: theme.brand },
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.key}
              label={`${tab.label} (${statusCounts[tab.key] ?? 0})`}
            />
          ))}
        </Tabs>

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
              Carregando reports...
            </Typography>
          </Box>
        ) : filteredReports.length === 0 ? (
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
            <BugReportOutlinedIcon
              sx={{ fontSize: 48, color: theme.textMuted }}
            />
            <Typography
              variant="h6"
              className={montserrat.className}
              sx={{ color: theme.text, fontWeight: 700 }}
            >
              {search || statusFilter !== "ALL"
                ? "Nenhum report encontrado"
                : "Nenhum bug reportado ainda"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.textSecondary, maxWidth: 420 }}
            >
              {search || statusFilter !== "ALL"
                ? "Tente ajustar os filtros ou limpar a busca."
                : "Quando usuários reportarem bugs, eles aparecerão aqui."}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 2,
            }}
          >
            {filteredReports.map((report) => (
              <Box
                key={report.bugReportId}
                onClick={() => setSelectedReport(report)}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: theme.border,
                  bgcolor: theme.bgCard,
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    borderColor: theme.brand,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: theme.text, fontWeight: 700 }}
                  >
                    #{report.bugReportId}
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={BUG_REPORT_STATUS_LABELS[report.status]}
                      color={BUG_REPORT_STATUS_COLORS[report.status]}
                      size="small"
                    />
                    <Chip
                      label={BUG_REPORT_SEVERITY_LABELS[report.severity]}
                      color={BUG_REPORT_SEVERITY_COLORS[report.severity]}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.text,
                    mb: 1.5,
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {truncate(report.description)}
                </Typography>

                <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: theme.textMuted }}>
                    Rota: {report.path}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.textMuted }}>
                    Por {report.user.name} · {formatDate(report.createdAt)}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  {report.screenshots.length > 0 ? (
                    <Chip
                      icon={
                        <ImageOutlinedIcon sx={{ fontSize: "16px !important" }} />
                      }
                      label={`${report.screenshots.length} screenshot${
                        report.screenshots.length > 1 ? "s" : ""
                      }`}
                      size="small"
                      sx={{
                        bgcolor: theme.bgElevated,
                        color: theme.textSecondary,
                        border: "1px solid",
                        borderColor: theme.border,
                      }}
                    />
                  ) : (
                    <Chip
                      label="Sem screenshots"
                      size="small"
                      variant="outlined"
                      sx={{ color: theme.textMuted, borderColor: theme.border }}
                    />
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <BugReportDetailDialog
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdated={handleReportUpdated}
      />
    </Box>
  );
}

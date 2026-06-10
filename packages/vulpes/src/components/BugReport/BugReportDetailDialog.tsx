"use client";

import {
  IUpdateBugReportDTO,
  UpdateBugReportSchema,
} from "@/@schemas/BugReport.schema";
import { IBugReport } from "@/@types/BugReport";
import RHFSelect from "@/components/RHF/Select";
import {
  BUG_REPORT_SEVERITY_LABELS,
  BUG_REPORT_STATUS_LABELS,
} from "@/components/BugReport/bugReportLabels";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { updateBugReport } from "@/services/bugReport";
import { safeZodResolver } from "@/utils/safeZodResolver";
import BugReportIcon from "@mui/icons-material/BugReport";
import CloseIcon from "@mui/icons-material/Close";
import ComputerIcon from "@mui/icons-material/Computer";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RouteIcon from "@mui/icons-material/Route";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface BugReportDetailDialogProps {
  report: IBugReport | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (report: IBugReport) => void;
}

function DetailSection({
  title,
  content,
}: {
  title: string;
  content?: string | null;
}) {
  const theme = useAppTheme();

  if (!content?.trim()) return null;

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ color: theme.text, fontWeight: 700, mb: 0.75 }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: theme.textSecondary,
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
        }}
      >
        {content}
      </Typography>
    </Box>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BugReportDetailDialog({
  report,
  open,
  onClose,
  onUpdated,
}: BugReportDetailDialogProps) {
  const theme = useAppTheme();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<IUpdateBugReportDTO>({
    resolver: safeZodResolver(UpdateBugReportSchema),
    defaultValues: {
      status: report?.status,
      severity: report?.severity,
    },
  });

  useEffect(() => {
    if (report) {
      reset({
        status: report.status,
        severity: report.severity,
      });
    }
  }, [report, reset]);

  const onSubmit = async (data: IUpdateBugReportDTO) => {
    if (!report) return;

    setSaving(true);
    try {
      const updated = await updateBugReport(report.bugReportId, data);
      toast.success("Report atualizado com sucesso.");
      onUpdated(updated);
      reset({
        status: updated.status,
        severity: updated.severity,
      });
    } catch (error) {
      console.error("Failed to update bug report:", error);
      toast.error("Erro ao atualizar o report.");
    } finally {
      setSaving(false);
    }
  };

  if (!report) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.bgCard,
            border: "1px solid",
            borderColor: theme.border,
            backgroundImage: "none",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: theme.border,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,109,0,0.12)",
                color: theme.brand,
              }}
            >
              <BugReportIcon />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: theme.text, fontWeight: 700 }}
              >
                Report #{report.bugReportId}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Reportado em {formatDate(report.createdAt)}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            aria-label="Fechar"
            sx={{ color: theme.textMuted }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ px: 3, py: 2.5, maxHeight: "70vh", overflowY: "auto" }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={BUG_REPORT_STATUS_LABELS[report.status]}
                color={
                  report.status === "OPEN"
                    ? "info"
                    : report.status === "IN_PROGRESS"
                      ? "warning"
                      : report.status === "RESOLVED"
                        ? "success"
                        : "default"
                }
                size="small"
              />
              <Chip
                label={`Prioridade: ${BUG_REPORT_SEVERITY_LABELS[report.severity]}`}
                color={
                  report.severity === "CRITICAL"
                    ? "error"
                    : report.severity === "HIGH"
                      ? "warning"
                      : report.severity === "MEDIUM"
                        ? "info"
                        : "default"
                }
                size="small"
                variant="outlined"
              />
            </Stack>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.bgElevated,
                border: "1px solid",
                borderColor: theme.border,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PersonOutlineIcon sx={{ fontSize: 18, color: theme.textMuted }} />
                <Typography variant="subtitle2" sx={{ color: theme.text, fontWeight: 700 }}>
                  Reportado por
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: theme.text }}>
                {report.user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                {report.user.email} · {report.user.role}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<RouteIcon sx={{ fontSize: "16px !important" }} />}
                label={report.path}
                size="small"
                sx={{
                  bgcolor: theme.bgElevated,
                  color: theme.textSecondary,
                  border: "1px solid",
                  borderColor: theme.border,
                }}
              />
              {report.os && (
                <Chip
                  icon={<ComputerIcon sx={{ fontSize: "16px !important" }} />}
                  label={report.os}
                  size="small"
                  sx={{
                    bgcolor: theme.bgElevated,
                    color: theme.textSecondary,
                    border: "1px solid",
                    borderColor: theme.border,
                  }}
                />
              )}
              {report.browser && (
                <Chip
                  icon={<LanguageIcon sx={{ fontSize: "16px !important" }} />}
                  label={report.browser}
                  size="small"
                  sx={{
                    bgcolor: theme.bgElevated,
                    color: theme.textSecondary,
                    border: "1px solid",
                    borderColor: theme.border,
                  }}
                />
              )}
            </Stack>

            <DetailSection title="Descrição" content={report.description} />
            <DetailSection
              title="Comportamento esperado"
              content={report.expectedBehavior}
            />
            <DetailSection
              title="Comportamento observado"
              content={report.actualBehavior}
            />
            <DetailSection
              title="Passos para reproduzir"
              content={report.stepsToReproduce}
            />

            {report.screenshots.length > 0 ? (
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <ImageOutlinedIcon sx={{ fontSize: 18, color: theme.textMuted }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: theme.text, fontWeight: 700 }}
                  >
                    Screenshots ({report.screenshots.length})
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                    },
                    gap: 1.5,
                  }}
                >
                  {report.screenshots.map((url, index) => (
                    <Box
                      key={url}
                      onClick={() => setPreviewUrl(url)}
                      sx={{
                        position: "relative",
                        aspectRatio: "4/3",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: theme.border,
                        cursor: "pointer",
                        bgcolor: theme.bgElevated,
                        "&:hover .overlay": { opacity: 1 },
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Box
                        className="overlay"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "rgba(0,0,0,0.45)",
                          opacity: 0,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        <ZoomInIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: theme.border,
                  bgcolor: theme.bgElevated,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: theme.textMuted }}>
                  Nenhuma screenshot foi enviada neste report.
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: theme.border }} />

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.bgElevated,
                border: "1px solid",
                borderColor: theme.border,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: theme.text, fontWeight: 700, mb: 2 }}
              >
                Gerenciar report
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <RHFSelect
                  control={control}
                  name="status"
                  label="Status"
                  errors={errors}
                  fullWidth
                >
                  {Object.entries(BUG_REPORT_STATUS_LABELS).map(
                    ([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ),
                  )}
                </RHFSelect>
                <RHFSelect
                  control={control}
                  name="severity"
                  label="Prioridade"
                  errors={errors}
                  fullWidth
                >
                  {Object.entries(BUG_REPORT_SEVERITY_LABELS).map(
                    ([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ),
                  )}
                </RHFSelect>
              </Stack>
              <Button
                type="submit"
                variant="contained"
                disabled={saving || !isDirty}
              >
                {saving ? <CircularProgress size={22} /> : "Salvar alterações"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Dialog>

      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setPreviewUrl(null)}
            aria-label="Fechar preview"
            sx={{
              position: "absolute",
              top: -48,
              right: 0,
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt="Screenshot em tela cheia"
              sx={{
                width: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}
        </Box>
      </Dialog>
    </>
  );
}

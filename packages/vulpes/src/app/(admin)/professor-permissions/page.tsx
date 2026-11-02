"use client";

import {
  IProfessorPermissionRequest,
  ProfessorPermissionRequestStatus,
} from "@/@types/ProfessorPermission";
import AppNavBar from "@/components/AppNavBar";
import AuthGuard from "@/components/AuthGuard";
import { useAppTheme } from "@/providers/ColorModeProvider";
import API from "@/services/API";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  FormControlLabel,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Montserrat } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const montserrat = Montserrat({ subsets: ["latin"] });

const STATUS_TABS: Array<{
  key: ProfessorPermissionRequestStatus | "ALL";
  label: string;
}> = [
  { key: "ALL", label: "Todas" },
  { key: "PENDING", label: "Pendentes" },
  { key: "APPROVED", label: "Aprovadas" },
  { key: "REJECTED", label: "Rejeitadas" },
];

const STATUS_CONFIG = {
  PENDING: { label: "Pendente", color: "warning" as const },
  APPROVED: { label: "Aprovado", color: "success" as const },
  REJECTED: { label: "Rejeitado", color: "error" as const },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfessorPermissionsPage() {
  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <AppNavBar />
      <ProfessorPermissionsContent />
    </AuthGuard>
  );
}

function ProfessorPermissionsContent() {
  const theme = useAppTheme();
  const [requests, setRequests] = useState<IProfessorPermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notify, setNotify] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "APPROVED" | "REJECTED" | null;
    requestId: number | null;
    requestName: string;
  }>({ open: false, action: null, requestId: null, requestName: "" });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await API.get<IProfessorPermissionRequest[]>(
        "/professor-permission-request",
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch professor permission requests:", error);
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const statusFilter = STATUS_TABS[tabIndex].key;

  const filteredRequests = useMemo(() => {
    if (statusFilter === "ALL") return requests;
    return requests.filter((request) => request.requestStatus === statusFilter);
  }, [requests, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      ALL: requests.length,
      PENDING: requests.filter((request) => request.requestStatus === "PENDING")
        .length,
      APPROVED: requests.filter(
        (request) => request.requestStatus === "APPROVED",
      ).length,
      REJECTED: requests.filter(
        (request) => request.requestStatus === "REJECTED",
      ).length,
    };
  }, [requests]);

  const handleOpenConfirmDialog = (
    action: "APPROVED" | "REJECTED",
    requestId: number,
    requestName: string,
  ) => {
    setNotify(true);
    setConfirmDialog({ open: true, action, requestId, requestName });
  };

  const handleCloseConfirmDialog = () => {
    if (submitting) return;

    setConfirmDialog({
      open: false,
      action: null,
      requestId: null,
      requestName: "",
    });
    setNotify(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.requestId || !confirmDialog.action) return;

    setSubmitting(true);
    try {
      await API.patch(
        `/professor-permission-request/${confirmDialog.requestId}`,
        {
          requestStatus: confirmDialog.action,
          ...(notify ? { notify: true } : {}),
        },
      );

      toast.success(
        confirmDialog.action === "APPROVED"
          ? "Solicitação aprovada com sucesso! Usuário promovido a Professor."
          : "Solicitação rejeitada.",
      );

      setConfirmDialog({
        open: false,
        action: null,
        requestId: null,
        requestName: "",
      });
      setNotify(true);
      void fetchRequests();
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Erro ao processar solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  const isApproval = confirmDialog.action === "APPROVED";

  const approveButtonSx = {
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "none",
    bgcolor:
      theme.mode === "dark"
        ? "rgba(143, 191, 168, 0.16)"
        : "rgba(61, 107, 84, 0.1)",
    color: theme.mode === "dark" ? "#c5ddd0" : "#3d6b54",
    "&:hover": {
      bgcolor:
        theme.mode === "dark"
          ? "rgba(143, 191, 168, 0.26)"
          : "rgba(61, 107, 84, 0.16)",
      boxShadow: "none",
    },
  };

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
            Solicitações de professor
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.textSecondary, maxWidth: 640, lineHeight: 1.6 }}
          >
            Analise os pedidos de acesso e decida quem pode criar e gerenciar
            tarefas na plataforma.
            {!loading && requests.length > 0 && (
              <Box component="span" sx={{ color: theme.textMuted, ml: 0.5 }}>
                ({requests.length}{" "}
                {requests.length === 1 ? "solicitação" : "solicitações"})
              </Box>
            )}
          </Typography>
        </Stack>

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
              label={`${tab.label} (${statusCounts[tab.key]})`}
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
              Carregando solicitações...
            </Typography>
          </Box>
        ) : filteredRequests.length === 0 ? (
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
            <SchoolOutlinedIcon sx={{ fontSize: 48, color: theme.textMuted }} />
            <Typography
              variant="h6"
              className={montserrat.className}
              sx={{ color: theme.text, fontWeight: 700 }}
            >
              {statusFilter === "ALL"
                ? "Nenhuma solicitação ainda"
                : "Nenhuma solicitação neste filtro"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.textSecondary, maxWidth: 420 }}
            >
              {statusFilter === "ALL"
                ? "Quando alguém pedir acesso de professor, o pedido aparece aqui."
                : "Tente outra aba para ver solicitações com outro status."}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredRequests.map((request) => (
              <Box
                key={request.professorPermissionRequestId}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: theme.border,
                  bgcolor: theme.bgCard,
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    borderColor: theme.borderStrong,
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", md: "flex-start" }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    sx={{ minWidth: 0, flex: 1 }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(255,109,0,0.12)",
                        color: theme.brand,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {initials(request.name)}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ color: theme.text, fontWeight: 700 }}
                        >
                          {request.name}
                        </Typography>
                        <Chip
                          label={STATUS_CONFIG[request.requestStatus].label}
                          color={STATUS_CONFIG[request.requestStatus].color}
                          size="small"
                        />
                      </Stack>

                      <Stack spacing={0.5}>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.textSecondary }}
                        >
                          {request.personalEmail}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.textSecondary }}
                        >
                          {request.institutionalEmail}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <ApartmentOutlinedIcon
                            sx={{ fontSize: 16, color: theme.textMuted }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: theme.textMuted }}
                          >
                            {request.institution?.name ?? "Instituição não informada"}
                            {" · "}
                            {formatDate(request.createdAt)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Button
                        component="a"
                        href={request.requestFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        sx={{
                          mt: 1.5,
                          px: 0,
                          minWidth: 0,
                          color: theme.brand,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": { bgcolor: "transparent", color: theme.brandDark },
                        }}
                      >
                        Ver documento comprobatório
                      </Button>
                    </Box>
                  </Stack>

                  {request.requestStatus === "PENDING" && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexShrink: 0, alignSelf: { md: "center" } }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() =>
                          handleOpenConfirmDialog(
                            "APPROVED",
                            request.professorPermissionRequestId,
                            request.name,
                          )
                        }
                        sx={approveButtonSx}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CloseIcon />}
                        onClick={() =>
                          handleOpenConfirmDialog(
                            "REJECTED",
                            request.professorPermissionRequestId,
                            request.name,
                          )
                        }
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Rejeitar
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: theme.bgCard,
              border: "1px solid",
              borderColor: theme.border,
              backgroundImage: "none",
            },
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
                display: "grid",
                placeItems: "center",
                bgcolor: isApproval
                  ? "rgba(34,197,94,0.14)"
                  : "rgba(239,68,68,0.14)",
                color: isApproval ? "success.main" : "error.main",
              }}
            >
              {isApproval ? <CheckIcon /> : <CloseIcon />}
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: theme.text, fontWeight: 700 }}
              >
                {isApproval ? "Aprovar solicitação" : "Rejeitar solicitação"}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                {confirmDialog.requestName}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={handleCloseConfirmDialog}
            aria-label="Fechar"
            disabled={submitting}
            sx={{ color: theme.textMuted }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={2.5} sx={{ px: 3, py: 2.5 }}>
          <Typography
            variant="body2"
            sx={{ color: theme.textSecondary, lineHeight: 1.7 }}
          >
            {isApproval
              ? `Tem certeza que deseja aprovar a solicitação de ${confirmDialog.requestName}? O usuário será promovido a professor.`
              : `Tem certeza que deseja rejeitar a solicitação de ${confirmDialog.requestName}?`}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: theme.bgElevated,
              border: "1px solid",
              borderColor: theme.border,
            }}
          >
            <FormControlLabel
              sx={{
                m: 0,
                alignItems: "center",
                "& .MuiFormControlLabel-label": { mt: 0 },
              }}
              control={
                <Checkbox
                  checked={notify}
                  onChange={(event) => setNotify(event.target.checked)}
                  disabled={submitting}
                  sx={{
                    p: 0.75,
                    color: theme.textMuted,
                    "&.Mui-checked": { color: theme.brand },
                  }}
                />
              }
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <MailOutlineIcon
                    sx={{ fontSize: 18, color: theme.textMuted }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.text, lineHeight: 1.4 }}
                  >
                    Notificar o usuário que solicitou sobre esta decisão por
                    e-mail?
                  </Typography>
                </Stack>
              }
            />
          </Box>
        </Stack>

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{
            px: 3,
            pb: 2.5,
            pt: 0.5,
          }}
        >
          <Button
            onClick={handleCloseConfirmDialog}
            disabled={submitting}
            sx={{ textTransform: "none", color: theme.textSecondary }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={isApproval ? "inherit" : "error"}
            disabled={submitting}
            sx={
              isApproval
                ? { ...approveButtonSx, minWidth: 120 }
                : { textTransform: "none", fontWeight: 600, minWidth: 120 }
            }
          >
            {submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : isApproval ? (
              "Aprovar"
            ) : (
              "Rejeitar"
            )}
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
}

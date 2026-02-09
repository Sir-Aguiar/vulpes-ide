"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Container,
  Tabs,
  Tab,
  Button,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";
import API from "@/services/API";
import { toast } from "react-toastify";
import {
  IProfessorPermissionRequest,
  ProfessorPermissionRequestStatus,
} from "@/@types/ProfessorPermission";

export default function ProfessorPermissionsPage() {
  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <AppNavBar />
      <ProfessorPermissionsContent />
    </AuthGuard>
  );
}

function ProfessorPermissionsContent() {
  const [requests, setRequests] = useState<IProfessorPermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
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
    fetchRequests();
  }, []);

  const getFilteredRequests = (): IProfessorPermissionRequest[] => {
    const statusMap: Record<number, ProfessorPermissionRequestStatus | null> = {
      0: null, // All
      1: "PENDING",
      2: "APPROVED",
      3: "REJECTED",
    };

    const filterStatus = statusMap[tabIndex];
    if (filterStatus === null) return requests;
    return requests.filter((r) => r.requestStatus === filterStatus);
  };

  const handleOpenConfirmDialog = (
    action: "APPROVED" | "REJECTED",
    requestId: number,
    requestName: string,
  ) => {
    setConfirmDialog({ open: true, action, requestId, requestName });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      action: null,
      requestId: null,
      requestName: "",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.requestId || !confirmDialog.action) return;

    try {
      await API.patch(
        `/professor-permission-request/${confirmDialog.requestId}`,
        {
          requestStatus: confirmDialog.action,
        },
      );

      toast.success(
        confirmDialog.action === "APPROVED"
          ? "Solicitação aprovada com sucesso! Usuário promovido a Professor."
          : "Solicitação rejeitada.",
      );

      fetchRequests();
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Erro ao processar solicitação");
    } finally {
      handleCloseConfirmDialog();
    }
  };

  const getStatusChip = (status: ProfessorPermissionRequestStatus) => {
    const config = {
      PENDING: { label: "Pendente", color: "warning" as const },
      APPROVED: { label: "Aprovado", color: "success" as const },
      REJECTED: { label: "Rejeitado", color: "error" as const },
    };
    return (
      <Chip
        label={config[status].label}
        color={config[status].color}
        size="small"
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = getFilteredRequests();

  const pendingCount = requests.filter(
    (r) => r.requestStatus === "PENDING",
  ).length;
  const approvedCount = requests.filter(
    (r) => r.requestStatus === "APPROVED",
  ).length;
  const rejectedCount = requests.filter(
    (r) => r.requestStatus === "REJECTED",
  ).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Solicitações de Permissão de Professor
      </Typography>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label={`Todas (${requests.length})`} />
        <Tab label={`Pendentes (${pendingCount})`} />
        <Tab label={`Aprovadas (${approvedCount})`} />
        <Tab label={`Rejeitadas (${rejectedCount})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredRequests.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            Nenhuma solicitação encontrada
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredRequests.map((request) => (
            <Card key={request.professorPermissionRequestId} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 300 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">{request.name}</Typography>
                      {getStatusChip(request.requestStatus)}
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <strong>Email Pessoal:</strong> {request.personalEmail}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <strong>Email Institucional:</strong>{" "}
                      {request.institutionalEmail}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      <strong>Instituição:</strong> {request.institution.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      <strong>Data da Solicitação:</strong>{" "}
                      {formatDate(request.createdAt)}
                    </Typography>

                    <Link
                      href={request.requestFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                      Ver Documento Comprobatório
                    </Link>
                  </Box>

                  {request.requestStatus === "PENDING" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() =>
                          handleOpenConfirmDialog(
                            "APPROVED",
                            request.professorPermissionRequestId,
                            request.name,
                          )
                        }
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() =>
                          handleOpenConfirmDialog(
                            "REJECTED",
                            request.professorPermissionRequestId,
                            request.name,
                          )
                        }
                      >
                        Rejeitar
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog}>
        <DialogTitle>
          {confirmDialog.action === "APPROVED"
            ? "Aprovar Solicitação"
            : "Rejeitar Solicitação"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === "APPROVED"
              ? `Tem certeza que deseja aprovar a solicitação de ${confirmDialog.requestName}? O usuário será promovido a Professor.`
              : `Tem certeza que deseja rejeitar a solicitação de ${confirmDialog.requestName}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.action === "APPROVED" ? "success" : "error"}
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

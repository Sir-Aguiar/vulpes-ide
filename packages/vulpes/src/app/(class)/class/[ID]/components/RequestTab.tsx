import API from "@/services/API";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface IClassRequest {
  classId: string;
  studentId: string;
  message: string | null;
  createdAt: string;
  student?: {
    userId: string;
    name: string;
    email: string;
  };
}

interface IGetClassRequestsResponse {
  requests: IClassRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function RequestsTab({ classId }: { classId: string }) {
  const [requests, setRequests] = useState<IClassRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await API.get<IGetClassRequestsResponse>(
        `/student-class-permission-request/class/${classId}`,
        { params: { page: 1, limit: 50 } },
      );
      setRequests(response.data.requests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [classId]);

  const handleApprove = async (studentId: string) => {
    try {
      await API.patch(
        `/student-class-permission-request/${classId}/${studentId}/approve`,
      );
      toast.success("Solicitação aprovada.");
      fetchRequests();
    } catch (error) {
      toast.error("Erro ao aprovar solicitação.");
    }
  };

  const handleReject = async (studentId: string) => {
    try {
      await API.patch(
        `/student-class-permission-request/${classId}/${studentId}/reject`,
      );
      toast.success("Solicitação rejeitada.");
      fetchRequests();
    } catch (error) {
      toast.error("Erro ao rejeitar solicitação.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">
          Nenhuma solicitação pendente.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {requests.map((request) => (
        <Card key={`${request.classId}-${request.studentId}`}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">
                {request.student?.name ?? "Aluno"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {request.student?.email ?? ""}
              </Typography>
              {request.message && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Mensagem: {request.message}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Enviada em:{" "}
                {new Date(request.createdAt).toLocaleDateString("pt-BR")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleReject(request.studentId)}
              >
                Rejeitar
              </Button>
              <Button
                variant="contained"
                onClick={() => handleApprove(request.studentId)}
              >
                Aprovar
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

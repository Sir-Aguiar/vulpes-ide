import API from "@/services/API";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface IListItem {
  listId: string;
  classId: string;
  title: string;
  deadline: string;
  submissionLimit: number;
}

interface IGetListsResponse {
  lists: IListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ListsTab({ classId }: { classId: string }) {
  const [lists, setLists] = useState<IListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await API.get<IGetListsResponse>(
        `/list/class/${classId}`,
        { params: { page: 1, limit: 50 } },
      );
      setLists(response.data.lists);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
      toast.error("Erro ao carregar listas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [classId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (lists.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">
          Nenhuma lista cadastrada.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: 2,
      }}
    >
      {lists.map((list) => (
        <Card key={list.listId}>
          <CardContent>
            <Typography variant="h6" noWrap>
              {list.title}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

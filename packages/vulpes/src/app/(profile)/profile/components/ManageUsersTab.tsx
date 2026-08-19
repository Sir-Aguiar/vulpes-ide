"use client";

import {
  IUserListItem,
  UserSortOrder,
} from "@/@types/UserManagement";
import { useAuth } from "@/providers/AuthProvider";
import { getUsers, updateUserStatus } from "@/services/userManagement";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Pagination,
  Stack,
  Switch,
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
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 450;

function formatCreatedAt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageUsersTab() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<IUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState<UserSortOrder>("desc");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: IUserListItem | null;
  }>({ open: false, user: null });
  const [deactivating, setDeactivating] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasActiveSearch = search.trim().length > 0;

  const commitSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    setSearch((prev) => {
      if (prev === trimmed) return prev;
      setPage(1);
      return trimmed;
    });
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page,
        limit: PAGE_SIZE,
        order,
        search: search || undefined,
      });
      setUsers(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [page, order, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      commitSearch(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSearchBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commitSearch(searchInput);
  };

  const handleSearchKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      commitSearch(searchInput);
    }
  };

  const handleToggleSort = () => {
    setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  const handlePageChange = (_: ChangeEvent<unknown>, nextPage: number) => {
    setPage(nextPage);
  };

  const applyStatusUpdate = async (
    target: IUserListItem,
    desativado: boolean,
  ): Promise<boolean> => {
    setStatusUpdatingId(target.userId);
    try {
      await updateUserStatus(target.userId, desativado);
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === target.userId ? { ...u, desativado } : u,
        ),
      );
      toast.success(
        desativado
          ? "Usuário desativado com sucesso"
          : "Usuário ativado com sucesso",
      );
      return true;
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error(
        desativado
          ? "Falha ao desativar usuário"
          : "Falha ao ativar usuário",
      );
      return false;
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleStatusSwitch = (target: IUserListItem) => {
    if (target.userId === currentUser?.userId) return;

    if (!target.desativado) {
      setConfirmDialog({ open: true, user: target });
      return;
    }

    void applyStatusUpdate(target, false);
  };

  const handleConfirmDeactivate = async () => {
    const target = confirmDialog.user;
    if (!target || deactivating) return;

    setDeactivating(true);
    try {
      const success = await applyStatusUpdate(target, true);
      if (success) {
        setConfirmDialog({ open: false, user: null });
      }
    } finally {
      setDeactivating(false);
    }
  };

  const handleCloseConfirmDialog = () => {
    if (deactivating) return;
    setConfirmDialog({ open: false, user: null });
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 0.5 }}>
            Gerenciar Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total} usuário{total !== 1 ? "s" : ""} cadastrado
            {total !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Buscar por nome ou e-mail"
          value={searchInput}
          onChange={(event) => handleSearchChange(event.target.value)}
          onBlur={handleSearchBlur}
          onKeyDown={handleSearchKeyDown}
          sx={{ minWidth: { sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <TableContainer sx={{ flex: 1 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active
                  direction={order}
                  onClick={handleToggleSort}
                >
                  Data de Criação
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} color="primary" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    {hasActiveSearch
                      ? "Nenhum usuário encontrado para esta pesquisa."
                      : "Nenhum usuário cadastrado."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((row) => {
                const isSelf = row.userId === currentUser?.userId;
                const isUpdating = statusUpdatingId === row.userId;
                const isActive = !row.desativado;

                return (
                  <TableRow key={row.userId} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{formatCreatedAt(row.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography
                          variant="caption"
                          color={isActive ? "success.main" : "text.secondary"}
                          sx={{ minWidth: 52, textAlign: "right" }}
                        >
                          {isActive ? "Ativo" : "Inativo"}
                        </Typography>
                        <Switch
                          checked={isActive}
                          disabled={isSelf || isUpdating}
                          onChange={() => handleStatusSwitch(row)}
                          size="small"
                          inputProps={{
                            "aria-label": isActive
                              ? `Desativar ${row.name}`
                              : `Ativar ${row.name}`,
                          }}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "primary.main",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                bgcolor: "primary.main",
                              },
                          }}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            size="medium"
            sx={{
              "& .MuiPaginationItem-root:hover": {
                bgcolor: "action.hover",
              },
              "& .Mui-selected": {
                bgcolor: "primary.main !important",
                color: "primary.contrastText !important",
                "&:hover": { bgcolor: "primary.dark !important" },
              },
            }}
          />
        </Box>
      )}

      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Desativar usuário</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja desativar o acesso deste usuário?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={deactivating}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDeactivate}
            color="error"
            variant="contained"
            disabled={deactivating}
            startIcon={
              deactivating ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {deactivating ? "Desativando..." : "Desativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

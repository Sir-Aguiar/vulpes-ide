"use client";

import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function DeactivateAccountTab() {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleOpenConfirmDialog = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
  };

  const handleDeactivateUser = async () => {
    try {
      await API.patch("user/desativar");
      toast.success("Usuário desativado com sucesso");
      handleCloseConfirmDialog();
      logout();
      router.push("/login");
    } catch (e) {
      toast.error("Falha ao desativar usuário");
      console.log("Falha ao desativar usuário: ", e);
    }
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
      }}
    >
      <Typography variant="h5" gutterBottom>
        Desativar Usuário
      </Typography>
      <div>
        <Button className="border-black" onClick={handleOpenConfirmDialog}>
          Desativar
        </Button>
      </div>

      <Dialog
        open={isConfirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Desativar conta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja desativar sua conta?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button
            onClick={handleDeactivateUser}
            color="error"
            variant="contained"
          >
            Desativar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

"use client";

import { ChangePasswordDTO } from "@/@dtos/User";
import { ChangePasswordSchema } from "@/@schemas/User";
import RHFTextField from "@/components/RHF/TextField";
import { safeZodResolver } from "@/utils/safeZodResolver";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type VisibilityField = "currentPassword" | "password" | "passwordConfirm";

export default function ChangePasswordTab() {
  const [visibility, setVisibility] = useState<Record<VisibilityField, boolean>>(
    {
      currentPassword: false,
      password: false,
      passwordConfirm: false,
    },
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ChangePasswordDTO>({
    resolver: safeZodResolver(ChangePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const toggleVisibility = (field: VisibilityField) =>
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));

  const renderVisibilityAdornment = (field: VisibilityField) => ({
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => toggleVisibility(field)} edge="end">
            {visibility[field] ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </InputAdornment>
      ),
    },
  });

  const onChangePassword = async (data: ChangePasswordDTO) => {
    try {
      // TODO: integrar com a API para validar a senha atual e atualizar a senha.
      // await API.patch("/user/password", {
      //   currentPassword: data.currentPassword,
      //   password: data.password,
      // });
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success("Senha alterada com sucesso!");
      reset({ currentPassword: "", password: "", passwordConfirm: "" });
      setVisibility({
        currentPassword: false,
        password: false,
        passwordConfirm: false,
      });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error("Senha atual incorreta.");
      } else {
        toast.error("Não foi possível alterar sua senha.");
      }
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Alterar senha
      </Typography>

      <form onSubmit={handleSubmit(onChangePassword)}>
        <Stack spacing={2} direction="column">
          <Typography variant="body2" color="text.secondary">
            Informe sua senha atual e defina uma nova senha.
          </Typography>

          <RHFTextField
            control={control}
            name="currentPassword"
            label="Senha atual"
            type={visibility.currentPassword ? "text" : "password"}
            errors={errors}
            autoComplete="current-password"
            slotProps={renderVisibilityAdornment("currentPassword")}
          />

          <RHFTextField
            control={control}
            name="password"
            label="Nova senha"
            type={visibility.password ? "text" : "password"}
            errors={errors}
            autoComplete="new-password"
            slotProps={renderVisibilityAdornment("password")}
          />

          <RHFTextField
            control={control}
            name="passwordConfirm"
            label="Confirmar nova senha"
            type={visibility.passwordConfirm ? "text" : "password"}
            errors={errors}
            autoComplete="new-password"
            slotProps={renderVisibilityAdornment("passwordConfirm")}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <LockResetIcon />
              )
            }
          >
            {isSubmitting ? "Salvando..." : "Atualizar senha"}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

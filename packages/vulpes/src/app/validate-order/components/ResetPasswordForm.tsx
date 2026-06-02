"use client";

import {
    CompleteResetPasswordSchema,
    ICompleteResetPasswordDTO,
} from "@/@schemas/Auth.schema";
import RHFTextField from "@/components/RHF/TextField";
import { completeResetPassword } from "@/services/resetPassword";
import { safeZodResolver } from "@/utils/safeZodResolver";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type VisibilityField = "password" | "passwordConfirm";

interface ResetPasswordFormProps {
  orderId: string;
}

export default function ResetPasswordForm({ orderId }: ResetPasswordFormProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState<Record<VisibilityField, boolean>>(
    {
      password: false,
      passwordConfirm: false,
    },
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ICompleteResetPasswordDTO>({
    resolver: safeZodResolver(CompleteResetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", passwordConfirm: "" },
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

  const onSubmit = async (data: ICompleteResetPasswordDTO) => {
    try {
      await completeResetPassword(orderId, data);
      toast.success("Senha redefinida com sucesso!");
      router.push("/login");
    } catch {
      toast.error(
        "Não foi possível redefinir sua senha. O link pode ter expirado.",
      );
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      sx={{
        width: "100%",
        maxWidth: 440,
        px: 3,
        py: 4,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 8px 32px rgba(0,0,0,0.4)"
            : "0 8px 32px rgba(0,0,0,0.06)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={600}>
            Nova senha
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Defina uma nova senha para a sua conta.
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
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
              size="large"
              disabled={!isValid || isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <LockResetIcon />
                )
              }
              sx={{ mt: 1 }}
            >
              {isSubmitting ? "Salvando..." : "Redefinir senha"}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}

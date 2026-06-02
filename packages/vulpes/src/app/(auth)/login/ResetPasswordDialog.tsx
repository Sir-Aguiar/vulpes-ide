"use client";

import { IResetPasswordDTO, ResetPasswordSchema } from "@/@schemas/Auth.schema";
import RHFTextField from "@/components/RHF/TextField";
import { requestResetPasswordOrder } from "@/services/resetPassword";
import { safeZodResolver } from "@/utils/safeZodResolver";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Step = "email" | "sent";

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ResetPasswordDialog({
  open,
  onClose,
}: ResetPasswordDialogProps) {
  const [step, setStep] = useState<Step>("email");
  const [sentEmail, setSentEmail] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<IResetPasswordDTO>({
    resolver: safeZodResolver(ResetPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setStep("email");
        setSentEmail("");
        reset({ email: "" });
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [open, reset]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const onRequestReset = async (data: IResetPasswordDTO) => {
    try {
      await requestResetPasswordOrder(data);

      setSentEmail(data.email);
      setStep("sent");
      toast.info(
        `Se existir uma conta com esse email, enviaremos um link de redefinição para ${data.email}.`,
      );
    } catch (error: any) {
      //Todo: Handle error message

      toast.error("Não foi possível solicitar a redefinição de senha.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 0.5 }}>
        {step === "email" ? "Redefinir senha" : "Verifique seu email"}
      </DialogTitle>
      <DialogContent sx={{ pb: 4, overflowX: "hidden" }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleSubmit(onRequestReset)}>
                <Stack spacing={3}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    Informe o email da sua conta. Enviaremos um link para você
                    definir uma nova senha.
                  </Typography>

                  <RHFTextField
                    control={control}
                    name="email"
                    label="Email"
                    type="email"
                    errors={errors}
                    autoComplete="email"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : undefined
                    }
                  >
                    {isSubmitting ? "Enviando..." : "Enviar link"}
                  </Button>
                </Stack>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Stack spacing={3} alignItems="center" sx={{ pt: 1 }}>
                <MarkEmailReadOutlinedIcon
                  sx={{ fontSize: 48, color: "primary.main" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  Enviamos um link de redefinição para{" "}
                  <strong>{sentEmail}</strong>. O link expira em 30 minutos —
                  abra o email e siga as instruções.
                </Typography>
                <Button variant="outlined" onClick={handleClose} fullWidth>
                  Fechar
                </Button>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

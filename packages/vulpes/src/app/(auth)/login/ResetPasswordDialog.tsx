"use client";

import { IResetPasswordDTO, ResetPasswordSchema } from "@/@schemas/Auth.schema";
import CodeInput from "@/components/CodeInput";
import RHFTextField from "@/components/RHF/TextField";
import { safeZodResolver } from "@/utils/safeZodResolver";
import {
  Box,
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

const CODE_LENGTH = 5;

type Step = "email" | "code";

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ResetPasswordDialog({
  open,
  onClose,
}: ResetPasswordDialogProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

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
        setEmail("");
        setCode(Array(CODE_LENGTH).fill(""));
        setCodeError(null);
        setIsValidatingCode(false);
        reset({ email: "" });
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [open, reset]);

  const handleClose = () => {
    if (isSubmitting || isValidatingCode) return;
    onClose();
  };

  const onRequestReset = async (data: IResetPasswordDTO) => {
    try {
      // TODO: integrar com a API de redefinição de senha. O backend cuida do
      // envio do email com o código de redefinição.
      // await API.post("/auth/reset-password", { email: data.email });
      await new Promise((resolve) => setTimeout(resolve, 800));

      setEmail(data.email);
      setCode(Array(CODE_LENGTH).fill(""));
      setCodeError(null);
      setStep("code");
      toast.info(`Enviamos um código de redefinição para ${data.email}.`);
    } catch (error) {
      toast.error("Não foi possível enviar o código de redefinição.");
    }
  };

  const onValidateCode = async (fullCode: string) => {
    setIsValidatingCode(true);
    setCodeError(null);
    try {
      // TODO: integrar com a API para validar o código de redefinição.
      // await API.post("/auth/reset-password/verify", { email, code: fullCode });
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success("Código validado com sucesso!");
      onClose();
    } catch (error) {
      setCodeError("Código inválido. Tente novamente.");
      setCode(Array(CODE_LENGTH).fill(""));
      toast.error("Código inválido. Tente novamente.");
    } finally {
      setIsValidatingCode(false);
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
                    Informe o email da sua conta. Enviaremos um código para você
                    redefinir sua senha.
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
                    {isSubmitting ? "Enviando..." : "Enviar código"}
                  </Button>
                </Stack>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Stack spacing={3} alignItems="center">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  Digite o código de {CODE_LENGTH} caracteres enviado para{" "}
                  <strong>{email}</strong>.
                </Typography>

                <CodeInput
                  length={CODE_LENGTH}
                  value={code}
                  onChange={(next) => {
                    setCode(next);
                    if (codeError) setCodeError(null);
                  }}
                  onComplete={onValidateCode}
                  disabled={isValidatingCode}
                />

                <Box sx={{ minHeight: 24 }}>
                  {isValidatingCode ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Validando código...
                      </Typography>
                    </Stack>
                  ) : codeError ? (
                    <Typography variant="body2" color="error">
                      {codeError}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

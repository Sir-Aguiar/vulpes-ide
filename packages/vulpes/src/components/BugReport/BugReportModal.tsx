"use client";

import { BugReportSchema, IBugReportForm } from "@/@schemas/BugReport.schema";
import RHFTextField from "@/components/RHF/TextField";
import ScreenshotUpload from "@/components/BugReport/ScreenshotUpload";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { submitBugReport } from "@/services/bugReport";
import { detectBrowser, detectOS } from "@/utils/detect-environment";
import { safeZodResolver } from "@/utils/safeZodResolver";
import BugReportIcon from "@mui/icons-material/BugReport";
import CloseIcon from "@mui/icons-material/Close";
import ComputerIcon from "@mui/icons-material/Computer";
import LanguageIcon from "@mui/icons-material/Language";
import RouteIcon from "@mui/icons-material/Route";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface IBugReportModalProps {
  open: boolean;
  onClose: () => void;
}

const multilineFieldProps = {
  multiline: true,
  minRows: 3,
  maxRows: 8,
} as const;

export default function BugReportModal({
  open,
  onClose,
}: IBugReportModalProps) {
  const theme = useAppTheme();
  const pathname = usePathname();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IBugReportForm>({
    resolver: safeZodResolver(BugReportSchema),
    mode: "onChange",
    defaultValues: {
      path: pathname ?? "/",
      description: "",
      expectedBehavior: "",
      actualBehavior: "",
      stepsToReproduce: "",
      screenshots: [],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        path: pathname ?? "/",
        description: "",
        expectedBehavior: "",
        actualBehavior: "",
        stepsToReproduce: "",
        screenshots: [],
      });
    }
  }, [open, pathname, reset]);

  useEffect(() => {
    setValue("path", pathname ?? "/", { shouldValidate: true });
  }, [pathname, setValue]);

  const onSubmit = async (data: IBugReportForm) => {
    try {
      await submitBugReport(data);
      toast.success("Bug reportado com sucesso! Obrigado pelo feedback.");
      onClose();
    } catch (error) {
      console.error("Erro ao enviar bug report:", error);
      toast.error("Não foi possível enviar o relatório. Tente novamente.");
    }
  };

  const os = detectOS();
  const browser = detectBrowser();

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.94, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
        transition: { duration: 0.22, ease: "easeOut" },
        sx: {
          borderRadius: 3,
          bgcolor: theme.bgCard,
          border: "1px solid",
          borderColor: theme.border,
          backgroundImage: "none",
          overflow: "hidden",
        },
      }}
    >
      <AnimatePresence>
        {open && (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,109,0,0.12)",
                    color: theme.brand,
                  }}
                >
                  <BugReportIcon />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: theme.text, fontWeight: 700 }}
                  >
                    Reportar bug
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.textSecondary }}
                  >
                    Descreva o problema para que possamos corrigi-lo.
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Fechar"
                sx={{ color: theme.textMuted }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            <Box sx={{ px: 3, py: 2.5, maxHeight: "70vh", overflowY: "auto" }}>
              <Stack spacing={2.5}>
                <RHFTextField
                  control={control}
                  name="path"
                  label="Página atual"
                  errors={errors}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <RouteIcon
                          fontSize="small"
                          sx={{ color: theme.textMuted, mr: 1 }}
                        />
                      ),
                    },
                  }}
                  helperText="Esta rota será enviada automaticamente com o report."
                />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<ComputerIcon sx={{ fontSize: "16px !important" }} />}
                    label={`${os}`}
                    size="small"
                    sx={{
                      bgcolor: theme.bgElevated,
                      color: theme.textSecondary,
                      border: "1px solid",
                      borderColor: theme.border,
                      padding: "8px",
                    }}
                  />
                  <Chip
                    icon={<LanguageIcon sx={{ fontSize: "16px !important" }} />}
                    label={`${browser}`}
                    size="small"
                    sx={{
                      bgcolor: theme.bgElevated,
                      color: theme.textSecondary,
                      border: "1px solid",
                      borderColor: theme.border,
                      padding: "8px",
                    }}
                  />
                </Stack>

                <RHFTextField
                  control={control}
                  name="description"
                  label="Descrição do bug *"
                  errors={errors}
                  {...multilineFieldProps}
                  placeholder="Explique o que aconteceu e o impacto no seu uso..."
                />

                <Divider>(Opcional) Informações adicionais</Divider>

                <RHFTextField
                  control={control}
                  name="stepsToReproduce"
                  label="Passos para reproduzir"
                  errors={errors}
                  {...multilineFieldProps}
                  placeholder="1. Acesse a página...&#10;2. Clique em...&#10;3. Observe que..."
                />

                <RHFTextField
                  control={control}
                  name="actualBehavior"
                  label="Comportamento observado"
                  errors={errors}
                  {...multilineFieldProps}
                />

                <RHFTextField
                  control={control}
                  name="expectedBehavior"
                  label="Comportamento esperado"
                  errors={errors}
                  {...multilineFieldProps}
                />

                <Controller
                  control={control}
                  name="screenshots"
                  render={({ field, fieldState }) => (
                    <ScreenshotUpload
                      value={field.value ?? []}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              justifyContent="flex-end"
              sx={{
                px: 3,
                py: 2,
                borderTop: "1px solid",
                borderColor: theme.border,
                bgcolor: theme.bgElevated,
              }}
            >
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{
                  textTransform: "none",
                  color: theme.textSecondary,
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <BugReportIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: theme.brand,
                  "&:hover": { bgcolor: theme.brandDark },
                }}
              >
                {isSubmitting ? "Enviando..." : "Enviar report"}
              </Button>
            </Stack>
          </Box>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

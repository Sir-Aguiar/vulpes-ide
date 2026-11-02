"use client";

import {
  CreateTeacherPermissionSchema,
  ICreateTeacherPermissionDTO,
} from "@/@schemas/RequestPermission.schema";
import RHFSelect from "@/components/RHF/Select";
import RHFTextField from "@/components/RHF/TextField";
import API from "@/services/API";
import { safeZodResolver } from "@/utils/safeZodResolver";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { MenuItem } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Institution = {
  institutionId: number;
  name: string;
};

type RequestPermissionSectionProps = {
  initialName: string;
  initialPersonalEmail: string;
  initialInstitutionId?: number;
  institutions: Institution[];
  onInstitutionSelected: (institutionId: number) => void;
  onCreateAccount: (data: {
    name: string;
    institutionId: number;
  }) => Promise<void>;
};

function getRequestErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error && "response" in error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;

    if (typeof status === "number") return status;
  }

  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/status code (\d+)/);

  return match ? Number(match[1]) : undefined;
}

export default function RequestPermissionSection({
  initialName,
  initialPersonalEmail,
  initialInstitutionId,
  institutions,
  onInstitutionSelected,
  onCreateAccount,
}: RequestPermissionSectionProps) {
  const muiTheme = useTheme();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const institutionLocked = initialInstitutionId !== undefined;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ICreateTeacherPermissionDTO>({
    resolver: safeZodResolver(CreateTeacherPermissionSchema),
    mode: "onChange",
    defaultValues: {
      name: initialName,
      personalEmail: initialPersonalEmail,
      institutionalEmail: "",
      institutionId: initialInstitutionId,
      document: undefined,
    },
  });

  useEffect(() => {
    if (initialName && initialPersonalEmail) {
      setValue("name", initialName);
      setValue("personalEmail", initialPersonalEmail);
    }

    if (initialInstitutionId) {
      setValue("institutionId", initialInstitutionId);
    }
  }, [initialInstitutionId, initialName, initialPersonalEmail, setValue]);

  const onSubmit = async (data: ICreateTeacherPermissionDTO) => {
    const savedRequest = {
      ...data,
      name: initialName || data.name,
      institutionId: initialInstitutionId ?? data.institutionId,
    };
    let createdAccount = accountCreated;

    if (!createdAccount) {
      try {
        await onCreateAccount({
          name: savedRequest.name,
          institutionId: savedRequest.institutionId,
        });
        createdAccount = true;
        setAccountCreated(true);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(error);
        }

        if (getRequestErrorStatus(error) === 409) {
          toast.error("Email já está em uso");
        } else {
          toast.error("Erro ao criar conta");
        }

        return;
      }
    }

    try {
      const formData = new FormData();

      for (const key in savedRequest) {
        const value = savedRequest[key as keyof ICreateTeacherPermissionDTO];

        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }

      await API.post("professor-permission-request", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsSuccess(true);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }

      toast.error(
        createdAccount
          ? "Sua conta foi criada, mas não foi possível enviar a solicitação. Tente enviar novamente."
          : "Erro ao enviar solicitação.",
      );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isSuccess ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Solicitar Acesso
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Preencha os dados abaixo para solicitar sua conta de professor.
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <RHFTextField
                control={control}
                name="name"
                label="Nome Completo"
                errors={errors}
                disabled
              />

              <RHFTextField
                control={control}
                name="personalEmail"
                label="Email Pessoal"
                type="email"
                errors={errors}
              />

              <RHFTextField
                control={control}
                name="institutionalEmail"
                label="Email Institucional"
                type="email"
                errors={errors}
              />

              <RHFSelect
                control={control}
                name="institutionId"
                id="professor-institution"
                labelId="professor-institution-label"
                label="Instituição de Ensino"
                errors={errors}
                disabled={institutionLocked}
                onChange={(event) => {
                  if (institutionLocked) return;

                  const institutionId = Number(event.target.value);

                  if (!Number.isNaN(institutionId) && institutionId > 0) {
                    setValue("institutionId", institutionId, {
                      shouldValidate: true,
                    });
                    onInstitutionSelected(institutionId);
                  }
                }}
              >
                {institutions.map(({ institutionId, name }) => (
                  <MenuItem key={institutionId} value={institutionId}>
                    {name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <Controller
                control={control}
                name="document"
                render={({
                  field: { onChange, value, ...field },
                  fieldState: { error },
                }) => (
                  <Box>
                    <input
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      style={{ display: "none" }}
                      id="request-file-upload"
                      type="file"
                      onChange={(e) =>
                        onChange(e.target.files?.[0] || undefined)
                      }
                      {...field}
                    />
                    <label htmlFor="request-file-upload">
                      <Box
                        sx={{
                          border: "2px dashed",
                          borderColor: error ? "error.main" : "primary.main",
                          borderRadius: 2,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: error ? "error.dark" : "primary.dark",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <CloudUploadIcon
                          sx={{
                            fontSize: 48,
                            color: error ? "error.main" : "primary.main",
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="body1"
                          color="text.primary"
                          fontWeight="medium"
                          align="center"
                        >
                          {value
                            ? value.name
                            : "Clique ou arraste para enviar o arquivo"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Formatos: .pdf, .doc, .docx, .jpg, .png
                        </Typography>
                      </Box>
                    </label>
                    {error && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ ml: 1, mt: 0.5, display: "block" }}
                      >
                        {error.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mt: 2,
                  height: 48,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Enviar Solicitação"
                )}
              </Button>
            </Stack>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              mb: 4,
              position: "relative",
              width: 120,
              height: 120,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: muiTheme.palette.success.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="72"
                height="72"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: 0.3,
                }}
              >
                <motion.path d="M20 6L9 17l-5-5" />
              </motion.svg>
            </motion.div>
          </Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="bold"
              color="success.main"
              align="center"
            >
              Sucesso!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
            >
              Sua solicitação de acesso foi enviada com sucesso.
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                router.push("/");
              }}
              sx={{ mt: 3, display: "block", mx: "auto" }}
            >
              Voltar
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { safeZodResolver } from "@/utils/safeZodResolver";

import {
  CreateTeacherPermissionSchema,
  ICreateTeacherPermissionDTO,
} from "@/@schemas/RequestPermission.schema";
import RHFTextField from "@/components/RHF/TextField";
import API from "@/services/API";
import { useRouter, useSearchParams } from "next/navigation";
import RHFSelect from "@/components/RHF/Select";
import { MenuItem } from "@mui/material";

export default function RequestPermissionPage() {
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ICreateTeacherPermissionDTO>({
    resolver: safeZodResolver(CreateTeacherPermissionSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      personalEmail: "",
      institutionalEmail: "",
      document: undefined,
    },
  });
  const [Institutions, setInstitutions] = useState<any[]>([]);

  const router = useRouter();

  const onSubmit = async (data: ICreateTeacherPermissionDTO) => {
    try {
      const formData = new FormData();

      for (const key in data) {
        const value = data[key as keyof ICreateTeacherPermissionDTO];

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
      toast.error("Erro ao enviar solicitação.");
    }
  };

  useEffect(() => {
    API.get("/institution").then((response) => {
      setInstitutions(response.data);
    });

    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const institutionId = searchParams.get("institutionId");

    if (name && email) {
      setValue("name", name);
      setValue("personalEmail", email);
    }

    if (institutionId) {
      setValue("institutionId", Number(institutionId));
    }

    window.history.replaceState({}, document.title, "/request-permission");
  }, [searchParams]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        minHeight: "690px",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          p: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 480 }}>
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Stack spacing={1} sx={{ mb: 5 }}>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Solicitar Acesso
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Preencha os dados abaixo para solicitar sua conta de
                    professor.
                  </Typography>
                </Stack>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={2}>
                    <RHFTextField
                      control={control}
                      name="name"
                      label="Nome Completo"
                      errors={errors}
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
                      label="Instituição de Ensino"
                      errors={errors}
                    >
                      {Institutions.map(({ institutionId, name }) => (
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
                                borderColor: error
                                  ? "error.main"
                                  : "primary.main",
                                borderRadius: 2,
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: error
                                    ? "error.dark"
                                    : "primary.dark",
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
                      backgroundColor: "#2e7d32", // success.main default
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
                  >
                    Voltar
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import { safeZodResolver } from "@/utils/safeZodResolver";

import { SignupSchema, ISignupDTO } from "@/@schemas/Auth.schema";
import RequestPermissionSection from "./RequestPermissionSection";
import RHFTextField from "@/components/RHF/TextField";
import { useAuth } from "@/providers/AuthProvider";
import RHFSelect from "@/components/RHF/Select";
import API from "@/services/API";
import { MenuItem } from "@mui/material";

function toInstitutionId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return undefined;
}

export default function SignupPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [openProfessorModal, setOpenProfessorModal] = useState(false);
  const [professorStep, setProfessorStep] = useState<"intro" | "details">(
    "intro",
  );
  const [Institutions, setInstitutions] = useState<any[]>([]);

  const router = useRouter();
  const { signup } = useAuth();

  useEffect(() => {
    API.get("/institution").then((response) => {
      setInstitutions(response.data);
    });
  }, []);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ISignupDTO>({
    resolver: safeZodResolver(SignupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data: ISignupDTO) => {
    try {
      const { passwordConfirm, ...signupData } = data;
      await signup(signupData);
      setIsSuccess(true);
      toast.success("Conta criada com sucesso!");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("Email já está em uso");
      } else {
        toast.error("Erro ao criar conta");
      }
    }
  };

  const handleOpenProfessorRequest = async () => {
    const isFormValid = await trigger();

    if (!isFormValid) {
      toast.warning(
        "Preencha todos os dados do formulário para solicitar acesso como professor.",
      );
      return;
    }

    setOpenProfessorModal(true);
  };

  const handleCloseProfessorModal = () => {
    setOpenProfessorModal(false);
  };

  const mainName = watch("name");
  const mainInstitutionId = toInstitutionId(watch("institutionId"));

  const handleInstitutionSelected = (institutionId: number) => {
    setValue("institutionId", institutionId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCreateAccountForProfessor = async ({
    name,
    institutionId,
  }: {
    name: string;
    institutionId: number;
  }) => {
    const { email, password } = getValues();

    setValue("name", name);
    setValue("institutionId", institutionId);

    await signup({
      name,
      email,
      password,
      institutionId,
    });
  };

  useEffect(() => {
    if (openProfessorModal) return;

    const timeout = setTimeout(() => setProfessorStep("intro"), 220);
    return () => clearTimeout(timeout);
  }, [openProfessorModal]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
      }}
    >
      <Box
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          bgcolor: "background.paper",
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
                    Criar Conta
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Preencha os dados abaixo para começar a usar a plataforma.
                  </Typography>
                </Stack>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={3}>
                    <RHFTextField
                      control={control}
                      name="name"
                      label="Nome Completo"
                      errors={errors}
                      autoComplete="name"
                    />

                    <RHFTextField
                      control={control}
                      name="email"
                      label="Email"
                      type="email"
                      errors={errors}
                      autoComplete="email"
                    />

                    <RHFTextField
                      control={control}
                      name="password"
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      errors={errors}
                      autoComplete="new-password"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <RHFTextField
                      control={control}
                      name="passwordConfirm"
                      label="Confirmar Senha"
                      type={showPasswordConfirm ? "text" : "password"}
                      errors={errors}
                      autoComplete="new-password"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowPasswordConfirm(!showPasswordConfirm)
                                }
                                edge="end"
                              >
                                {showPasswordConfirm ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <RHFSelect
                      key={mainInstitutionId ?? "none"}
                      control={control}
                      name="institutionId"
                      label="Instituição"
                      errors={errors}
                    >
                      {Institutions.map(({ institutionId, name }) => (
                        <MenuItem key={institutionId} value={institutionId}>
                          {name}
                        </MenuItem>
                      ))}
                    </RHFSelect>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={!isValid || isSubmitting}
                      sx={{ mt: 2 }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>

                    <Box sx={{ textAlign: "center", mt: 1 }}>
                      <Link
                        component="button"
                        type="button"
                        underline="hover"
                        onClick={handleOpenProfessorRequest}
                        sx={{ cursor: "pointer", fontWeight: 600 }}
                      >
                        Solicitar Acesso como professor
                      </Link>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1.5 }}
                      >
                        Já tem uma conta?{" "}
                        <Link
                          href="/login"
                          underline="hover"
                          sx={{ cursor: "pointer", fontWeight: 600 }}
                        >
                          Faça login
                        </Link>
                      </Typography>
                    </Box>
                  </Stack>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      fontSize: 120,
                      color: "success.main",
                      mb: 3,
                    }}
                  />
                </motion.div>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Conta Criada com Sucesso!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Bem-vindo à plataforma Vulpes IDE.
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          height: "100%",
          bgcolor: "primary.main",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          color: "primary.contrastText",
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Vulpes IDE
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 400, textAlign: "center" }}>
          Aprenda programação de forma interativa e intuitiva
        </Typography>
      </Box>

      <Dialog
        open={openProfessorModal}
        onClose={handleCloseProfessorModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: "background.paper",
              backgroundImage: "none",
              maxHeight: "calc(100% - 64px)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  flexShrink: 0,
                }}
              >
                <SchoolIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Você é professor?
              </Typography>
            </Stack>
            <IconButton
              aria-label="Fechar"
              onClick={handleCloseProfessorModal}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            px: 3,
            pt: 2,
            pb: 3,
            overflowX: "hidden",
            overflowY: professorStep === "details" ? "auto" : "hidden",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {professorStep === "intro" ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -36 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7, mb: 3 }}
                >
                  Se você é professor e deseja criar e gerenciar tarefas para
                  seus alunos, solicite acesso especial. Envie seus documentos
                  de identificação e aguarde a aprovação.
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => setProfessorStep("details")}
                    variant="contained"
                    size="small"
                  >
                    Solicitar Acesso de Professor
                  </Button>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -36 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <RequestPermissionSection
                  initialName={mainName}
                  initialPersonalEmail={getValues("email")}
                  initialInstitutionId={mainInstitutionId}
                  institutions={Institutions}
                  onInstitutionSelected={handleInstitutionSelected}
                  onCreateAccount={handleCreateAccountForProfessor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

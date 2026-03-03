"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { redirect, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import { safeZodResolver } from "@/utils/safeZodResolver";

import { SignupSchema, ISignupDTO } from "@/@schemas/Auth.schema";
import RHFTextField from "@/components/RHF/TextField";
import { useAuth } from "@/providers/AuthProvider";
import RHFSelect from "@/components/RHF/Select";
import API from "@/services/API";
import { MenuItem } from "@mui/material";

export default function SignupPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [openProfessorModal, setOpenProfessorModal] = useState(false);
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
    formState: { errors, isValid, isSubmitting },
    getValues,
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
        setOpenProfessorModal(true);
      }, 1000);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("Email já está em uso");
      } else {
        toast.error("Erro ao criar conta");
      }
    }
  };

  const handleContinueAsStudent = () => {
    setOpenProfessorModal(false);
    router.push("/");
  };

  const handleRequestProfessorAccess = () => {
    setOpenProfessorModal(false);

    const { name, email, institutionId } = getValues();

    const queryParams = new URLSearchParams({
      name,
      email,
    }).toString();

    const requestURL = window.location.origin + "/request-permission";

    redirect(
      `${requestURL}?${queryParams}${institutionId ? `&institutionId=${institutionId}` : ""}`,
    );
  };

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

                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
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
        onClose={handleContinueAsStudent}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">Você é professor?</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se você é um professor e deseja criar e gerenciar tarefas para seus
            alunos, você pode solicitar acesso especial. Envie uma solicitação
            com seus documentos de identificação e aguarde a aprovação.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 500 }}>
            Caso contrário, você pode continuar como estudante e começar a usar
            a plataforma imediatamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleContinueAsStudent} variant="outlined">
            Continuar como Estudante
          </Button>
          <Button
            onClick={handleRequestProfessorAccess}
            variant="contained"
            startIcon={<SchoolIcon />}
          >
            Solicitar Acesso de Professor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

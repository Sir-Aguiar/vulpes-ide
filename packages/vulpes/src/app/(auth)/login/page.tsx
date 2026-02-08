"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { safeZodResolver } from "@/utils/safeZodResolver";

import { LoginSchema, ILoginDTO } from "@/@schemas/Auth.schema";
import RHFTextField from "@/components/RHF/TextField";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ILoginDTO>({
    resolver: safeZodResolver(LoginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ILoginDTO) => {
    try {
      await login(data);
      toast.success("Login realizado com sucesso!");
      router.push("/");
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error("Email ou senha inválidos");
      } else {
        toast.error("Erro ao fazer login");
      }
    }
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
      {/* Form Side */}
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
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 480 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stack spacing={1} sx={{ mb: 5 }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Bem-vindo de Volta
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Entre com suas credenciais para acessar a plataforma.
              </Typography>
            </Stack>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
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
                  autoComplete="current-password"
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
                    "Entrar"
                  )}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Não tem uma conta?{" "}
                    <Link
                      href="/signup"
                      underline="hover"
                      sx={{ cursor: "pointer", fontWeight: 600 }}
                    >
                      Criar conta
                    </Link>
                  </Typography>
                </Box>
              </Stack>
            </form>
          </motion.div>
        </Box>
      </Box>

      {/* Hero Side */}
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
    </Box>
  );
}

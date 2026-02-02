"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";
import API from "@/services/API";
import { CreateClassSchema, ICreateClassDTO } from "@/@schemas/Class.schema";
import { safeZodResolver } from "@/utils/safeZodResolver";
import { toast } from "react-toastify";
import RHFTextField from "@/components/RHF/TextField";
import { IClass } from "@/@types/Class";

export default function NewClassPage() {
  return (
    <AuthGuard requiredRoles={["PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <NewClassContent />
    </AuthGuard>
  );
}

function NewClassContent() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ICreateClassDTO>({
    resolver: safeZodResolver(CreateClassSchema),
    mode: "onChange",
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: ICreateClassDTO) => {
    setSubmitting(true);
    try {
      const response = await API.post<IClass>("/class", data);
      toast.success(`Turma criada! Código: ${response.data.code}`);
      router.push("/classes");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao criar turma");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Nova Turma
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <RHFTextField
              control={control}
              name="name"
              label="Nome da Turma"
              errors={errors}
              placeholder="Ex: Programação I - 2026.1"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !isValid}
              >
                {submitting ? <CircularProgress size={24} /> : "Criar Turma"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

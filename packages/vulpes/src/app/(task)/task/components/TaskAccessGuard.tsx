"use client";

import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useRouter } from "next/navigation";
import { TaskAccessMode } from "../types";

interface TaskAccessGuardProps {
  access: TaskAccessMode | null;
  children: React.ReactNode;
}

export function TaskAccessGuard({ access, children }: TaskAccessGuardProps) {
  const router = useRouter();

  if (!access) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 64px)",
          gap: 2,
          bgcolor: "#263238",
          color: "white",
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 56, color: "error.main", mb: 1 }} />
        <Typography variant="h6" fontWeight={600}>
          Acesso inválido
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nenhum identificador de tarefa foi fornecido.
          <br />
          Utilize um dos parâmetros: <code>taskId</code> ou{" "}
          <code>classTaskId</code>.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push("/")}
          sx={{ mt: 1 }}
        >
          Voltar ao início
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}

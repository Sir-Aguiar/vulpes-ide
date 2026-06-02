"use client";

import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InvalidTokenView() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      sx={{
        width: "100%",
        maxWidth: 420,
        textAlign: "center",
        px: 3,
        py: 5,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 8px 32px rgba(0,0,0,0.4)"
            : "0 8px 32px rgba(0,0,0,0.06)",
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
          }}
        >
          <LinkOffOutlinedIcon sx={{ fontSize: 36, color: "text.secondary" }} />
        </Box>

        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={600}>
            Link inválido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Este link de redefinição de senha expirou ou já foi utilizado.
            Solicite um novo link na página de login.
          </Typography>
        </Stack>

        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="large"
          fullWidth
        >
          Voltar ao login
        </Button>
      </Stack>
    </Box>
  );
}

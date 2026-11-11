"use client";

import { useAppTheme } from "@/providers/ColorModeProvider";
import { Box, Link as MuiLink, Stack, Typography } from "@mui/material";
import { Montserrat } from "next/font/google";
import Link from "next/link";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function HomeFooter() {
  const theme = useAppTheme();

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: theme.bgElevated,
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 10 },
        borderTop: "1px solid",
        borderColor: theme.border,
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      <Stack
        direction="row"
        spacing={3}
        sx={{ justifyContent: "center", mb: 2 }}
      >
        <MuiLink
          component={Link}
          href="/termos"
          underline="hover"
          variant="caption"
          className={montserrat.className}
          sx={{ color: theme.textSecondary }}
        >
          Termos de Uso
        </MuiLink>
        <MuiLink
          component={Link}
          href="/termos#privacidade"
          underline="hover"
          variant="caption"
          className={montserrat.className}
          sx={{ color: theme.textSecondary }}
        >
          Privacidade
        </MuiLink>
      </Stack>
      <Typography
        variant="caption"
        className={montserrat.className}
        sx={{
          display: "block",
          textAlign: "center",
          color: theme.textMuted,
        }}
      >
        © {new Date().getFullYear()} Vulpes IDE — Ambiente de desenvolvimento
        para Portugol
      </Typography>
    </Box>
  );
}

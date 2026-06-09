"use client";

import { useAuth } from "@/providers/AuthProvider";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CodeIcon from "@mui/icons-material/Code";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SchoolIcon from "@mui/icons-material/School";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/providers/ColorModeProvider";

const montserrat = Montserrat({ subsets: ["latin"] });

const CODE_LINES = [
  { n: 1, t: "algoritmo", c: "#c586c0" },
  { n: 2, t: "  var a, b, soma: inteiro", c: "#9cdcfe" },
  { n: 3, t: "  inicio", c: "#c586c0" },
  { n: 4, t: "    leia(a)", c: "#dcdcaa" },
  { n: 5, t: "    leia(b)", c: "#dcdcaa" },
  { n: 6, t: "    soma <- a + b", c: "#d4d4d4" },
  { n: 7, t: '    escreva("Resultado: ", soma)', c: "#dcdcaa" },
  { n: 8, t: "  fim", c: "#c586c0" },
];

export default function HeroSection() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const theme = useAppTheme();

  const firstName = user?.name?.split(" ")[0];

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: theme.bg,
        transition: "background-color 0.2s ease",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: theme.heroGradient,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: theme.mode === "dark" ? 0.04 : 0.5,
          backgroundImage: `
            linear-gradient(${theme.gridLine} 1px, transparent 1px),
            linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          px: { xs: 3, md: 6 },
          py: { xs: 10, md: 8 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: theme.maxWidth,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: { xs: 6, lg: 8 },
            alignItems: "center",
          }}
        >
          <Stack spacing={3}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography
                variant="h2"
                className={montserrat.className}
                sx={{
                  fontWeight: 800,
                  color: theme.text,
                  fontSize: { xs: "2.25rem", md: "3.25rem" },
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                {isAuthenticated && firstName ? (
                  `Bem-Vindo`
                ) : (
                  <>
                    Aprenda{" "}
                    <Box component="span" sx={{ color: theme.brand }}>
                      Portugol
                    </Box>{" "}
                    na prática
                  </>
                )}
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Typography
                variant="h6"
                className={montserrat.className}
                sx={{
                  color: theme.textSecondary,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: 480,
                }}
              >
                Escreva, execute e envie algoritmos com correção automática,
                feedback do professor e acompanhamento em turmas.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/tasks")}
                  sx={{
                    bgcolor: theme.brand,
                    color: "#fff",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    "&:hover": { bgcolor: theme.brandDark },
                  }}
                >
                  Explorar tarefas
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SchoolIcon />}
                  onClick={() => router.push("/classes")}
                  sx={{
                    color: theme.text,
                    borderColor: theme.borderStrong,
                    fontWeight: 600,
                    textTransform: "none",
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: theme.brand,
                      bgcolor: "rgba(255,109,0,0.06)",
                    },
                  }}
                >
                  Minhas turmas
                </Button>
              </Stack>
            </motion.div>
          </Stack>
        </Box>
      </Box>

      <Box
        component={motion.div}
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pb: 4,
          color: theme.textMuted,
        }}
      >
        <Typography
          variant="caption"
          className={montserrat.className}
          sx={{ mb: 0.5 }}
        >
          Descubra mais
        </Typography>
        <KeyboardArrowDownIcon />
      </Box>
    </Box>
  );
}

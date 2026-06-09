"use client";

import { useAppTheme } from "@/providers/ColorModeProvider";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import GroupsIcon from "@mui/icons-material/Groups";
import RateReviewIcon from "@mui/icons-material/RateReview";
import TerminalIcon from "@mui/icons-material/Terminal";
import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

const FEATURES = [
  {
    icon: <TerminalIcon />,
    title: "Editor integrado",
    description:
      "Escreva código Portugol com syntax highlighting, execução instantânea e resultados de testes em tempo real.",
    accent: "#FF6D00",
  },
  {
    icon: <AutoFixHighIcon />,
    title: "Correção automática",
    description:
      "Testes definidos pelo professor rodam automaticamente ao executar, indicando acertos e erros com clareza.",
    accent: "#6366f1",
  },
  {
    icon: <RateReviewIcon />,
    title: "Feedback personalizado",
    description:
      "Receba comentários detalhados do professor sobre suas submissões e saiba exatamente o que melhorar.",
    accent: "#22c55e",
  },
  {
    icon: <GroupsIcon />,
    title: "Turmas e listas",
    description:
      "Participe de turmas, resolva listas de exercícios e acompanhe seu progresso junto com colegas e docentes.",
    accent: "#f59e0b",
  },
] as const;

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const theme = useAppTheme();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: theme.border,
        bgcolor: theme.bgCard,
        height: "100%",
        transition: "border-color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: theme.borderStrong,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${feature.accent}18`,
          color: feature.accent,
          mb: 2,
        }}
      >
        {feature.icon}
      </Box>
      <Typography
        variant="subtitle1"
        className={montserrat.className}
        sx={{ color: theme.text, fontWeight: 700, mb: 1 }}
      >
        {feature.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.textSecondary, lineHeight: 1.65 }}
      >
        {feature.description}
      </Typography>
    </Box>
  );
}

export default function FeaturesSection() {
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
      <Box sx={{ maxWidth: theme.maxWidth, mx: "auto" }}>
        <Stack
          spacing={1}
          sx={{ mb: 5, textAlign: { xs: "left", md: "center" } }}
        >
          <Typography
            variant="overline"
            sx={{ color: theme.brand, fontWeight: 700, letterSpacing: 2 }}
          >
            Recursos
          </Typography>
          <Typography
            variant="h4"
            className={montserrat.className}
            sx={{ color: theme.text, fontWeight: 800 }}
          >
            Tudo que você precisa para aprender
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.textSecondary,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Do primeiro algoritmo à entrega de atividades — acompanhamos
            cada etapa do seu aprendizado.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

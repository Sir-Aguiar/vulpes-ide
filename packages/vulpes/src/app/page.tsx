"use client";

import AppNavBar from "@/components/AppNavBar";
import FeaturesSection from "@/components/home/FeaturesSection";
import FeedbackWidget from "@/components/home/FeedbackWidget";
import HeroSection from "@/components/home/HeroSection";
import HomeFooter from "@/components/home/HomeFooter";
import PublicTasksSection from "@/components/home/PublicTasksSection";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { Box } from "@mui/material";

export default function Home() {
  const theme = useAppTheme();

  return (
    <>
      <AppNavBar position="sticky" />
      <Box
        component="main"
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: theme.bg,
          transition: "background-color 0.2s ease",
        }}
      >
        <HeroSection />
        <FeaturesSection />
        <FeedbackWidget />
        <PublicTasksSection />
        <HomeFooter />
      </Box>
    </>
  );
}

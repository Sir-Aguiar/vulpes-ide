"use client";

import AppNavBar from "@/components/AppNavBar";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/providers/AuthProvider";
import { useAppTheme } from "@/providers/ColorModeProvider";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import {
  Box,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  SxProps,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo, useState } from "react";

import ChangePasswordTab from "./components/ChangePasswordTab";
import DeactivateAccountTab from "./components/DeactivateAccountTab";
import InstitutionalDataTab from "./components/InstitutionalDataTab";
import ManageUsersTab from "./components/ManageUsersTab";
import PersonalInfoTab from "./components/PersonalInfoTab";

const ALL_TABS = [
  {
    key: "personal",
    label: "Informações Pessoais",
    icon: <PersonIcon />,
    Component: PersonalInfoTab,
    adminOnly: false,
  },
  {
    key: "password",
    label: "Alterar senha",
    icon: <LockIcon />,
    Component: ChangePasswordTab,
    adminOnly: false,
  },
  {
    key: "institutional",
    label: "Dados institucionais",
    icon: <SchoolIcon />,
    Component: InstitutionalDataTab,
    adminOnly: false,
  },
  {
    key: "manage-users",
    label: "Gerenciar Usuários",
    icon: <PeopleIcon />,
    Component: ManageUsersTab,
    adminOnly: true,
  },
  {
    key: "deactivate",
    label: "Desativar conta",
    icon: <DeleteForeverIcon />,
    Component: DeactivateAccountTab,
    adminOnly: false,
  },
] as const;

type ProfileTab = (typeof ALL_TABS)[number];

interface SideBarProps {
  tabs: readonly ProfileTab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

function SideBar({ tabs, activeIndex, onChange }: SideBarProps) {
  const theme = useAppTheme();
  const boxStyle: SxProps = {
    width: "296px",
    flexShrink: 0,
    height: "100%",
    borderRadius: "8px",
    p: 1,
  };

  return (
    <Box sx={boxStyle} component={Paper} elevation={2}>
      <List
        component="nav"
        sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const isDanger = tab.key === "deactivate";

          return (
            <ListItemButton
              key={tab.key}
              selected={isActive}
              onClick={() => onChange(index)}
              sx={{
                borderRadius: "8px",
                color: isDanger ? "error.main" : "text.secondary",
                transition: "background-color 0.2s ease, color 0.2s ease",
                "& .MuiListItemIcon-root": {
                  color: "inherit",
                  minWidth: 40,
                },
                "&:hover": {
                  backgroundColor: theme.hover,
                },
                "&.Mui-selected": {
                  backgroundColor: theme.brandGlow,
                  color: isDanger ? "error.main" : theme.brand,
                  "&:hover": {
                    backgroundColor: theme.brandGlow,
                  },
                },
              }}
            >
              <ListItemIcon>{tab.icon}</ListItemIcon>
              <ListItemText
                primary={tab.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function ProfileContent({
  tabs,
  activeIndex,
  direction,
}: {
  tabs: readonly ProfileTab[];
  activeIndex: number;
  direction: number;
}) {
  const ActiveComponent = tabs[activeIndex].Component;

  return (
    <Box
      component={Paper}
      elevation={2}
      sx={{
        position: "relative",
        flex: 1,
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={tabs[activeIndex].key}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

export default function Page() {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const tabs = useMemo(() => {
    const isAdmin = user?.role === "ADMIN";
    return ALL_TABS.filter((tab) => !tab.adminOnly || isAdmin);
  }, [user?.role]);

  const safeActiveIndex = Math.min(activeIndex, tabs.length - 1);

  const handleChange = (next: number) => {
    setDirection(next > safeActiveIndex ? 1 : -1);
    setActiveIndex(next);
  };

  return (
    <AuthGuard requiredRoles={["STUDENT", "PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <Container
        sx={{
          maxWidth: "lg",
          display: "flex",
          flexDirection: "row",
          gap: 2,
          py: 2,
          width: "100%",
          height: "calc(100vh - 65px)",
        }}
      >
        <SideBar
          tabs={tabs}
          activeIndex={safeActiveIndex}
          onChange={handleChange}
        />
        <ProfileContent
          tabs={tabs}
          activeIndex={safeActiveIndex}
          direction={direction}
        />
      </Container>
    </AuthGuard>
  );
}

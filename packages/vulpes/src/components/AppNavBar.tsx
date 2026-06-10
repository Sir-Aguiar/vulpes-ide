"use client";

import { useAppTheme, useColorMode } from "@/providers/ColorModeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useBugReport } from "@/providers/BugReportProvider";
import AddIcon from "@mui/icons-material/Add";
import BugReportIcon from "@mui/icons-material/BugReport";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Logout from "@mui/icons-material/Logout";
import Person from "@mui/icons-material/Person";
import {
  AppBar,
  AppBarProps,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

interface IProps extends AppBarProps {}

export default function AppNavBar(props?: IProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const theme = useAppTheme();
  const { isDark, toggleMode } = useColorMode();
  const { openBugReport } = useBugReport();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    toast.info("Logout realizado com sucesso");
    router.push("/login");
  };

  const handleProfile = () => {
    handleClose();
    router.push("/profile");
  };

  const handleBugReports = () => {
    handleClose();
    router.push("/bug-reports");
  };

  const navItems = [
    {
      label: "Turmas",
      path: "/classes",
      roles: ["STUDENT", "PROFESSOR", "ADMIN"],
    },
    {
      label: "Tarefas",
      path: "/tasks",
      roles: ["STUDENT", "PROFESSOR", "ADMIN"],
    },
    {
      label: "Permissões",
      path: "/professor-permissions",
      roles: ["ADMIN"],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !user?.role || item.roles.includes(user.role),
  );

  const navButtonSx = (active: boolean) => ({
    color: active ? theme.brand : theme.navbarText,
    fontWeight: active ? 600 : 400,
    textTransform: "none" as const,
    fontSize: "0.95rem",
    "&:hover": {
      backgroundColor: theme.hover,
      color: theme.brand,
    },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.navbar,
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: theme.border,
        color: theme.text,
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
      {...props}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            mr: 4,
            cursor: "pointer",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: theme.brand,
          }}
          onClick={() => router.push("/")}
        >
          Vulpes IDE
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button
            onClick={() => router.push("/")}
            sx={navButtonSx(pathname === "/")}
          >
            Início
          </Button>
          {visibleNavItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => router.push(item.path)}
              sx={navButtonSx(pathname === item.path)}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<BugReportIcon fontSize="small" />}
          onClick={openBugReport}
          sx={{
            ml: 1,
            textTransform: "none",
            fontWeight: 600,
            color: theme.text,
            borderColor: theme.borderStrong,
            "&:hover": {
              borderColor: theme.brand,
              bgcolor: "rgba(255,109,0,0.06)",
              color: theme.brand,
            },
          }}
        >
          Reportar bug
        </Button>

        <Button
          variant="outlined"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => router.push("/new-task")}
          sx={{
            ml: 1,
            textTransform: "none",
            fontWeight: 600,
            color: theme.text,
            borderColor: theme.borderStrong,
            "&:hover": {
              borderColor: theme.brand,
              bgcolor: "rgba(255,109,0,0.06)",
              color: theme.brand,
            },
          }}
        >
          Criar Tarefa
        </Button>

        {user && (
          <Box>
            <Tooltip title="Configurações da conta">
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={Boolean(anchorEl) ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? "true" : undefined}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.brand,
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.15))",
                  mt: 1.5,
                  minWidth: 240,
                  bgcolor: theme.menuBg,
                  color: theme.text,
                  border: "1px solid",
                  borderColor: theme.menuBorder,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                  {user.name || "Usuário"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.menuTextMuted }}
                  noWrap
                >
                  {user.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: "block",
                    color: theme.brand,
                    fontWeight: 500,
                  }}
                >
                  {user.role}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: theme.menuBorder }} />

              <MenuItem
                onClick={(event) => event.stopPropagation()}
                sx={{ "&:hover": { bgcolor: theme.hover }, py: 1 }}
              >
                <ListItemIcon>
                  {isDark ? (
                    <DarkModeIcon
                      fontSize="small"
                      sx={{ color: theme.menuTextMuted }}
                    />
                  ) : (
                    <LightModeIcon
                      fontSize="small"
                      sx={{ color: theme.menuTextMuted }}
                    />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Tema escuro"
                  primaryTypographyProps={{ fontSize: "0.875rem" }}
                />
                <Switch
                  checked={isDark}
                  onChange={toggleMode}
                  size="small"
                  inputProps={{ "aria-label": "Alternar tema escuro" }}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.brand,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: theme.brand,
                    },
                  }}
                />
              </MenuItem>

              <MenuItem
                onClick={handleProfile}
                sx={{ "&:hover": { bgcolor: theme.hover } }}
              >
                <ListItemIcon>
                  <Person
                    fontSize="small"
                    sx={{ color: theme.menuTextMuted }}
                  />
                </ListItemIcon>
                Perfil
              </MenuItem>
              {user.role === "ADMIN" && (
                <MenuItem
                  onClick={handleBugReports}
                  sx={{ "&:hover": { bgcolor: theme.hover } }}
                >
                  <ListItemIcon>
                    <BugReportIcon
                      fontSize="small"
                      sx={{ color: theme.menuTextMuted }}
                    />
                  </ListItemIcon>
                  Reports de bug
                </MenuItem>
              )}
              <MenuItem
                onClick={handleLogout}
                sx={{ "&:hover": { bgcolor: theme.hover } }}
              >
                <ListItemIcon>
                  <Logout
                    fontSize="small"
                    sx={{ color: theme.menuTextMuted }}
                  />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

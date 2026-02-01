"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "react-toastify";

export default function AppNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
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

  const navItems = [
    { label: "Início", path: "/", roles: ["STUDENT", "PROFESSOR", "ADMIN"] },
    {
      label: "Tarefas",
      path: "/tasks",
      roles: ["STUDENT", "PROFESSOR", "ADMIN"],
    },
    {
      label: "Nova Tarefa",
      path: "/new-task",
      roles: ["PROFESSOR", "ADMIN"],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 0, mr: 4, cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          Vulpes IDE
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
          {visibleNavItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => router.push(item.path)}
              sx={{
                color: "white",
                mx: 1,
                backgroundColor:
                  pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {user && (
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {user.name || user.email}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

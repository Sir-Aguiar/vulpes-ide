"use client";

import { useAuth } from "@/providers/AuthProvider";
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
  Menu,
  MenuItem,
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

  const navItems = [
    {
      label: "Turmas",
      path: "/classes",
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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(10, 10, 10, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.08)",
        color: "#fff",
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
            color: "#FF6D00",
          }}
          onClick={() => router.push("/")}
        >
          Vulpes IDE
        </Typography>

        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button
            onClick={() => router.push("/")}
            sx={{
              color: pathname === "/" ? "#FF6D00" : "rgba(255, 255, 255, 0.7)",
              fontWeight: pathname === "/" ? 600 : 400,
              textTransform: "none",
              fontSize: "0.95rem",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "#FF6D00",
              },
            }}
          >
            Início
          </Button>
          {visibleNavItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => router.push(item.path)}
              sx={{
                color:
                  pathname === item.path
                    ? "#FF6D00"
                    : "rgba(255, 255, 255, 0.7)",
                fontWeight: pathname === item.path ? 600 : 400,
                textTransform: "none",
                fontSize: "0.95rem",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#FF6D00",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Button>
          <Link href="/new-task">Criar Tarefa</Link>
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
                    bgcolor: "#FF6D00",
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
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.5))",
                  mt: 1.5,
                  minWidth: 200,
                  bgcolor: "#1E1E1E",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                  {user.name || "Usuário"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  noWrap
                >
                  {user.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: "block",
                    color: "#FF6D00",
                    fontWeight: 500,
                  }}
                >
                  {user.role}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />
              <MenuItem
                onClick={handleProfile}
                sx={{ "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}
              >
                <ListItemIcon>
                  <Person
                    fontSize="small"
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                  />
                </ListItemIcon>
                Perfil
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" } }}
              >
                <ListItemIcon>
                  <Logout
                    fontSize="small"
                    sx={{ color: "rgba(255, 255, 255, 0.7)" }}
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

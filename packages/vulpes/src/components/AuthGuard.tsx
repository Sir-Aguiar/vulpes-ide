"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: ("STUDENT" | "PROFESSOR" | "ADMIN")[];
}

export default function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (!loading && requiredRoles && user && !requiredRoles.includes(user.role)) {
      // User doesn't have any of the required roles
      router.push("/");
    }
  }, [isAuthenticated, loading, user, requiredRoles, router]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

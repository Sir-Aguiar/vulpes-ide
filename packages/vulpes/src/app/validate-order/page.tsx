"use client";

import InvalidTokenView from "@/app/validate-order/components/InvalidTokenView";
import ResetPasswordForm from "@/app/validate-order/components/ResetPasswordForm";
import { validateResetPasswordOrder } from "@/services/resetPassword";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type PageStatus = "loading" | "valid" | "invalid" | "missing-token";

export default function ValidateOrderPage() {
  const [isWindowReady, setIsWindowReady] = useState(false);

  useEffect(() => {
    setIsWindowReady(true);
  }, []);

  return (
    <Suspense fallback={<PageShell status="loading" />}>
      {isWindowReady ? <ValidateOrderContent /> : <PageShell status="loading" />}
    </Suspense>
  );
}

function ValidateOrderContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<PageStatus>("loading");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("missing-token");
      return;
    }

    let cancelled = false;

    const validate = async () => {
      setStatus("loading");
      try {
        const { orderId: validatedOrderId } =
          await validateResetPasswordOrder(token);

        if (cancelled) return;

        setOrderId(validatedOrderId);
        setStatus("valid");
      } catch {
        if (cancelled) return;
        setStatus("invalid");
      }
    };

    validate();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "valid" && orderId) {
    return (
      <PageShell status="valid">
        <ResetPasswordForm orderId={orderId} />
      </PageShell>
    );
  }

  if (status === "invalid" || status === "missing-token") {
    return (
      <PageShell status="invalid">
        <InvalidTokenView />
      </PageShell>
    );
  }

  return <PageShell status="loading" />;
}

function PageShell({
  status,
  children,
}: {
  status: PageStatus;
  children?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        backgroundImage: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(ellipse at top, rgba(227,108,28,0.08), transparent 55%)"
            : "radial-gradient(ellipse at top, rgba(227,108,28,0.06), transparent 55%)",
        px: 2,
        py: 4,
      }}
    >
      {status === "loading" ? (
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Validando link...
          </Typography>
        </Stack>
      ) : (
        children
      )}
    </Box>
  );
}

"use client";

import { EDITOR_THEMES, UserPreferencesSchema } from "@/@schemas/User";
import RHFSelect from "@/components/RHF/Select";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import { safeZodResolver } from "@/utils/safeZodResolver";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

type PreferencesForm = z.infer<typeof UserPreferencesSchema>;

const DEFAULTS: PreferencesForm = {
  editorTheme: "vs-dark",
  editorFontSize: 14,
  editorWordWrap: true,
  adminNotifyBugReport: false,
};

const THEME_LABELS: Record<(typeof EDITOR_THEMES)[number], string> = {
  "vs-dark": "Escuro",
  vs: "Claro",
  "portugol-dark": "Portugol escuro",
  "portugol-light": "Portugol claro",
};

export default function UserPreferencesTab() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PreferencesForm>({
    resolver: safeZodResolver(UserPreferencesSchema),
    mode: "onChange",
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data } = await API.get<Partial<PreferencesForm>>(
          "/user/me/preferences",
        );
        if (!active) return;

        reset({
          editorTheme: EDITOR_THEMES.includes(
            data.editorTheme as (typeof EDITOR_THEMES)[number],
          )
            ? (data.editorTheme as PreferencesForm["editorTheme"])
            : DEFAULTS.editorTheme,
          editorFontSize:
            typeof data.editorFontSize === "number"
              ? data.editorFontSize
              : DEFAULTS.editorFontSize,
          editorWordWrap:
            typeof data.editorWordWrap === "boolean"
              ? data.editorWordWrap
              : DEFAULTS.editorWordWrap,
          adminNotifyBugReport: data.adminNotifyBugReport ?? false,
        });
      } catch {
        if (active) toast.error("Não foi possível carregar suas preferências.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [reset]);

  const onSave = async (data: PreferencesForm) => {
    const payload: Record<string, string | number | boolean> = {
      editorTheme: data.editorTheme,
      editorFontSize: data.editorFontSize,
      editorWordWrap: data.editorWordWrap,
    };

    if (isAdmin) {
      payload.adminNotifyBugReport = data.adminNotifyBugReport;
    }

    try {
      await API.patch("/user/me/preferences", payload);
      toast.success("Preferências salvas.");
    } catch {
      toast.error("Não foi possível salvar suas preferências.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", p: 3, overflow: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Preferências de Usuário
      </Typography>

      <form onSubmit={handleSubmit(onSave)}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Editor de código
            </Typography>
            <Stack spacing={2}>
              <RHFSelect
                control={control}
                name="editorTheme"
                errors={errors}
                label=""
              >
                {EDITOR_THEMES.map((theme) => (
                  <MenuItem key={theme} value={theme}>
                    {THEME_LABELS[theme]}
                  </MenuItem>
                ))}
              </RHFSelect>

              <Controller
                control={control}
                name="editorWordWrap"
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                      />
                    }
                    label="Quebra de linha"
                  />
                )}
              />

              <Controller
                control={control}
                name="editorFontSize"
                render={({ field }) => (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Tamanho da fonte: {field.value}
                    </Typography>
                    <Slider
                      value={field.value}
                      min={8}
                      max={32}
                      step={1}
                      valueLabelDisplay="auto"
                      onChange={(_, value) => field.onChange(value as number)}
                    />
                  </Box>
                )}
              />
            </Stack>
          </Box>

          {isAdmin && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Administração
                </Typography>
                <Controller
                  control={control}
                  name="adminNotifyBugReport"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(_, checked) => field.onChange(checked)}
                        />
                      }
                      label="Receber notificação de report de erros"
                    />
                  )}
                />
              </Box>
            </>
          )}

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Salvar preferências"
            )}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

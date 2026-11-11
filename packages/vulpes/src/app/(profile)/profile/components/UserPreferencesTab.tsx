"use client";

import { IUserPreferences } from "@/@dtos/Auth";
import { EDITOR_THEMES, UserPreferencesSchema } from "@/@schemas/User";
import { normalizeStoredEditorTheme } from "@/utils/editor-preferences";
import RHFSelect from "@/components/RHF/Select";
import { useStoredUserPreferences } from "@/hooks/useStoredUserPreferences";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import { writeStoredUserPreferences } from "@/utils/user-preferences-storage";
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
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

type PreferencesForm = z.infer<typeof UserPreferencesSchema>;

const DEFAULTS: PreferencesForm = {
  editorTheme: "dark",
  editorFontSize: 14,
  editorWordWrap: true,
  adminNotifyBugReport: true,
};

function formFromUser(preferences: IUserPreferences | undefined): PreferencesForm {
  return {
    editorTheme: preferences?.editorTheme
      ? normalizeStoredEditorTheme(preferences.editorTheme)
      : DEFAULTS.editorTheme,
    editorFontSize:
      typeof preferences?.editorFontSize === "number"
        ? preferences.editorFontSize
        : DEFAULTS.editorFontSize,
    editorWordWrap:
      typeof preferences?.editorWordWrap === "boolean"
        ? preferences.editorWordWrap
        : DEFAULTS.editorWordWrap,
    adminNotifyBugReport: preferences?.adminNotifyBugReport ?? true,
  };
}

const THEME_LABELS: Record<(typeof EDITOR_THEMES)[number], string> = {
  dark: "Escuro",
  light: "Claro",
};

export default function UserPreferencesTab() {
  const { user } = useAuth();
  const storedPreferences = useStoredUserPreferences();
  const isAdmin = user?.role === "ADMIN";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PreferencesForm>({
    resolver: safeZodResolver(UserPreferencesSchema),
    mode: "onChange",
    defaultValues: formFromUser(storedPreferences),
  });

  useEffect(() => {
    reset(formFromUser(storedPreferences));
  }, [reset, storedPreferences]);

  const onSave = async (data: PreferencesForm) => {
    const payload: IUserPreferences = {
      editorTheme: data.editorTheme,
      editorFontSize: data.editorFontSize,
      editorWordWrap: data.editorWordWrap,
      ...(isAdmin
        ? { adminNotifyBugReport: data.adminNotifyBugReport }
        : {}),
    };

    try {
      await API.patch("/user/me/preferences", payload);
      const { data } = await API.get<IUserPreferences>("/user/me/preferences");
      writeStoredUserPreferences(data ?? {});
      toast.success("Preferências salvas.");
    } catch {
      toast.error("Não foi possível salvar suas preferências.");
    }
  };

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
                label="Tema do editor"
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

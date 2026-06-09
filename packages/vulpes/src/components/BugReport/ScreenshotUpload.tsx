"use client";

import { useAppTheme } from "@/providers/ColorModeProvider";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import {
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_FILES = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface IScreenshotUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ScreenshotUpload({
  value,
  onChange,
  error,
}: IScreenshotUploadProps) {
  const theme = useAppTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const appendFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const merged = [...value];

      for (const file of list) {
        if (merged.length >= MAX_FILES) break;
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) continue;
        if (file.size > 5 * 1024 * 1024) continue;
        merged.push(file);
      }

      onChange(merged.slice(0, MAX_FILES));
    },
    [onChange, value],
  );

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const canAddMore = value.length < MAX_FILES;

  const previews = useMemo(
    () => value.map((file) => URL.createObjectURL(file)),
    [value],
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" sx={{ color: theme.text, fontWeight: 600 }}>
          Screenshots
        </Typography>
        <Typography variant="caption" sx={{ color: theme.textMuted }}>
          {value.length}/{MAX_FILES} · até 5 MB cada
        </Typography>
      </Stack>

      <Box
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length > 0) {
            appendFiles(event.dataTransfer.files);
          }
        }}
        onClick={() => canAddMore && inputRef.current?.click()}
        sx={{
          border: "2px dashed",
          borderColor: error
            ? "#ef4444"
            : dragOver
              ? theme.brand
              : theme.borderStrong,
          borderRadius: 2.5,
          bgcolor: dragOver ? "rgba(255,109,0,0.06)" : theme.bgElevated,
          p: value.length === 0 ? 3 : 2,
          cursor: canAddMore ? "pointer" : "default",
          transition: "border-color 0.2s ease, background-color 0.2s ease",
          "&:hover": canAddMore
            ? {
                borderColor: theme.brand,
                bgcolor: "rgba(255,109,0,0.04)",
              }
            : undefined,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) appendFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {value.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,109,0,0.1)",
                color: theme.brand,
              }}
            >
              <AddPhotoAlternateIcon />
            </Box>
            <Typography variant="body2" sx={{ color: theme.text, fontWeight: 600 }}>
              Arraste imagens ou clique para enviar
            </Typography>
            <Typography variant="caption" sx={{ color: theme.textMuted }}>
              JPEG, PNG, WebP ou GIF
            </Typography>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
              gap: 1.5,
            }}
          >
            {value.map((file, index) => (
                <Box
                  key={`${file.name}-${index}`}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: theme.border,
                    aspectRatio: "4/3",
                    bgcolor: theme.bgCard,
                  }}
                >
                  <Box
                    component="img"
                    src={previews[index]}
                    alt={file.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Remover screenshot"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeAt(index);
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      px: 0.75,
                      py: 0.5,
                      bgcolor: "rgba(0,0,0,0.6)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ color: "#fff", display: "block", fontSize: "0.65rem" }}
                    >
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                </Box>
              ))}

            {canAddMore && (
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: theme.borderStrong,
                  aspectRatio: "4/3",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  color: theme.textMuted,
                  bgcolor: theme.bgCard,
                }}
              >
                <ImageIcon fontSize="small" />
                <Typography variant="caption">Adicionar</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {error && (
        <Typography variant="caption" sx={{ color: "#ef4444" }}>
          {error}
        </Typography>
      )}
    </Stack>
  );
}

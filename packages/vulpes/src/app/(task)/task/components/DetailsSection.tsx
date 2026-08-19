"use client";

import { ITask } from "@/@types/Task";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { Box } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";

export interface IDetailsSectionProps {
  task: ITask | null;
}

export function DetailsSection({ task }: IDetailsSectionProps) {
  const theme = useAppTheme();

  return (
    <Box
      data-color-mode={theme.mode}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: theme.contentPanel,
        color: theme.contentPanelText,
        border: "1px solid",
        borderColor: theme.contentPanelBorder,
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <MDEditor.Markdown
          source={task?.description || ""}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: theme.contentPanelText,
          }}
        />
      </Box>
    </Box>
  );
}

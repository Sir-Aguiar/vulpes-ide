"use client";

import { ITask } from "@/@types/Task";
import { Box } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";

export interface IDetailsSectionProps {
  task: ITask | null;
}

export function DetailsSection({ task }: IDetailsSectionProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "transparent",
        color: "white",
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <MDEditor.Markdown
          source={task?.description || ""}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "white",
          }}
        />
      </Box>
    </Box>
  );
}

import { COLORS } from "@/utils/colors";
import { Box, IconButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface ICollapsibleHeaderProps {
  icon: React.ReactNode;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  trailing?: React.ReactNode;
}

export default function CollapsibleHeader({
  icon,
  title,
  collapsed,
  onToggle,
  trailing,
}: ICollapsibleHeaderProps) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        bgcolor: "#252526",
        borderBottom: collapsed ? "none" : "1px solid",
        borderColor: "rgba(255,255,255,0.08)",
        cursor: "pointer",
        userSelect: "none",
        borderRadius: collapsed ? "8px" : "8px 8px 0 0",
        transition: "background-color 0.15s ease",
        "&:hover": { bgcolor: "#2d2d30" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: COLORS.dark.primary[500], display: "flex" }}>
          {icon}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "#d4d4d4", fontWeight: 600, letterSpacing: 0.2 }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {trailing}
        <IconButton
          size="small"
          sx={{ color: "#9e9e9e", p: 0.25 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {collapsed ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ExpandLessIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}

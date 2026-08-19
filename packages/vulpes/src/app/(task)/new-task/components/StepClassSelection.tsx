"use client";

import { IClassListItem } from "@/@types/Class";
import { useAppTheme } from "@/providers/ColorModeProvider";
import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const checkboxIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkboxCheckedIcon = <CheckBoxIcon fontSize="small" />;

interface StepClassSelectionProps {
  classes: IClassListItem[];
  selectedClasses: IClassListItem[];
  onSelectionChange: (classes: IClassListItem[]) => void;
  loading: boolean;
}

export const StepClassSelection = ({
  classes,
  selectedClasses,
  onSelectionChange,
  loading,
}: StepClassSelectionProps) => {
  const theme = useAppTheme();

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
        pr: 1,
        color: theme.text,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Vincular às Turmas
        </Typography>
        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
          Selecione as turmas onde esta tarefa ficará disponível automaticamente.
          Você pode deixar em branco para adicionar depois.
        </Typography>
      </Box>

      <Autocomplete
        multiple
        options={classes}
        disableCloseOnSelect
        loading={loading}
        value={selectedClasses}
        onChange={(_, newValue) => onSelectionChange(newValue)}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.classId === value.classId}
        renderOption={(props, option, { selected }) => {
          const { key, ...otherProps } = props;
          return (
            <li key={option.classId} {...otherProps}>
              <Checkbox
                icon={checkboxIcon}
                checkedIcon={checkboxCheckedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              <Box>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Código: {option.code}
                </Typography>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Turmas (opcional)"
            placeholder={selectedClasses.length === 0 ? "Selecione turmas..." : ""}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ mb: 3 }}
      />

      {selectedClasses.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            border: "1px solid",
            borderColor: theme.border,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Turmas selecionadas ({selectedClasses.length})
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {selectedClasses.map((classItem) => (
              <Typography key={classItem.classId} component="li" variant="body2">
                {classItem.name}{" "}
                <Box component="span" sx={{ color: theme.textMuted }}>
                  (Código: {classItem.code})
                </Box>
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

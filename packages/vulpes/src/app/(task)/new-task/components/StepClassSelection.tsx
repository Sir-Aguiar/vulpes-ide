import { IClassListItem } from "@/@types/Class";
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
  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto pr-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Vincular às Turmas</h2>
        <p className="text-sm opacity-70">
          Selecione as turmas onde esta tarefa ficará disponível automaticamente.
          Você pode deixar em branco para adicionar depois.
        </p>
      </div>

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
        <div className="p-4 rounded-md border border-gray-100/10">
          <h3 className="text-lg font-medium mb-2">Turmas selecionadas ({selectedClasses.length})</h3>
          <ul className="list-disc list-inside space-y-1">
            {selectedClasses.map((classItem) => (
              <li key={classItem.classId} className="text-sm">
                {classItem.name} <span className="opacity-60">(Código: {classItem.code})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

import API from "@/services/API";
import {
  CreateListFormSchema,
  getCreateListDefaultValues,
  ICreateListFormDTO,
  IListTaskFormItem,
  toCreateListPayload,
} from "@/@schemas/List.schema";
import RHFTextField from "@/components/RHF/TextField";
import { safeZodResolver } from "@/utils/safeZodResolver";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface IProps {
  classId: string;
  onCreated: () => void;
}

interface ITaskItem {
  taskId: string;
  title: string;
  description: string;
  isPublic: boolean;
  isVisible: boolean;
  creatorId: string;
  creator?: {
    userId: string;
    name: string;
  };
}

interface IGetTasksResponse {
  data: { classId: string; taskId: string; task: ITaskItem }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const checkboxIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkboxCheckedIcon = <CheckBoxIcon fontSize="small" />;

function syncSelectedTasks(
  current: IListTaskFormItem[],
  newTasks: ITaskItem[],
): IListTaskFormItem[] {
  return newTasks.map((task) => {
    const existing = current.find((item) => item.taskId === task.taskId);
    return (
      existing ?? {
        taskId: task.taskId,
        title: task.title,
        weight: 1,
      }
    );
  });
}

export default function CreateListTab({ classId, onCreated }: IProps) {
  const [submitting, setSubmitting] = useState(false);
  const [tasks, setTasks] = useState<ITaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ICreateListFormDTO>({
    resolver: safeZodResolver(CreateListFormSchema),
    mode: "onChange",
    defaultValues: getCreateListDefaultValues(),
  });

  const selectedTasks = watch("selectedTasks");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await API.get<IGetTasksResponse>(
          `/class-task/class/${classId}`,
        );
        const formattedTasks = response.data.data.map(({ task }) => task);
        setTasks(formattedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast.error("Erro ao carregar tarefas disponíveis.");
      } finally {
        setLoadingTasks(false);
      }
    };

    void fetchTasks();
  }, [classId]);

  const onSubmit = async (data: ICreateListFormDTO) => {
    setSubmitting(true);
    try {
      await API.post("/list", toCreateListPayload(classId, data));
      const taskCount = data.selectedTasks.length;
      toast.success(
        taskCount > 0
          ? `Lista criada com ${taskCount} tarefa(s)!`
          : "Lista criada com sucesso!",
      );
      reset(getCreateListDefaultValues());
      onCreated();
    } catch (error) {
      toast.error("Erro ao criar lista.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTaskOptions = tasks.filter((task) =>
    selectedTasks.some((item) => item.taskId === task.taskId),
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: 3,
        alignItems: "start",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Informações da lista
        </Typography>

        <RHFTextField
          control={control}
          name="title"
          label="Nome da lista"
          errors={errors}
        />

        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <RHFTextField
            control={control}
            name="deadline"
            label="Data limite"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            errors={errors}
            fullWidth
          />
          <RHFTextField
            control={control}
            name="releaseDate"
            label="Data de lançamento"
            type="datetime-local"
            errors={errors}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <RHFTextField
          control={control}
          name="submissionLimit"
          label="Limite de envios"
          type="number"
          errors={errors}
          inputProps={{ min: 1, step: 1 }}
        />

        <Controller
          control={control}
          name="selectedTasks"
          render={({ field }) => (
            <Autocomplete
              multiple
              options={tasks}
              disableCloseOnSelect
              loading={loadingTasks}
              value={selectedTaskOptions}
              onChange={(_, newValue) =>
                field.onChange(syncSelectedTasks(field.value, newValue))
              }
              getOptionLabel={(option) => option.title}
              isOptionEqualToValue={(option, value) =>
                option.taskId === value.taskId
              }
              renderOption={(props, option, { selected }) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={option.taskId} {...otherProps}>
                    <Checkbox
                      icon={checkboxIcon}
                      checkedIcon={checkboxCheckedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    <Box>
                      <Typography variant="body1">{option.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.creator?.name ?? "Autor desconhecido"}
                        {option.isPublic ? " • Pública" : ""}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tarefas (opcional)"
                  placeholder={
                    field.value.length === 0 ? "Selecione tarefas..." : ""
                  }
                  error={!!errors.selectedTasks}
                  helperText={errors.selectedTasks?.message?.toString()}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTasks ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{ alignSelf: "flex-start", mt: 1 }}
        >
          {submitting ? <CircularProgress size={24} /> : "Criar Lista"}
        </Button>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          minHeight: { lg: 360 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AssignmentOutlinedIcon color="action" fontSize="small" />
          <Typography variant="h6" component="h2">
            Pesos das tarefas
          </Typography>
        </Stack>

        {selectedTasks.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Selecione tarefas no formulário ao lado para definir o peso de
              cada uma. O peso padrão é 1.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0} divider={<Divider flexItem />}>
            {selectedTasks.map((task, index) => (
              <Stack
                key={task.taskId}
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ py: 1.5 }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {task.title}
                  </Typography>
                </Box>
                <Controller
                  control={control}
                  name={`selectedTasks.${index}.weight`}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Peso"
                      type="number"
                      size="small"
                      sx={{ width: 100 }}
                      inputProps={{ min: 0.1, step: 0.1 }}
                      error={!!errors.selectedTasks?.[index]?.weight}
                      helperText={
                        errors.selectedTasks?.[index]?.weight?.message
                      }
                    />
                  )}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

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
  tasks: ITaskItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const checkboxIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkboxCheckedIcon = <CheckBoxIcon fontSize="small" />;

export default function CreateListTab({ classId, onCreated }: IProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submissionLimit, setSubmissionLimit] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [tasks, setTasks] = useState<ITaskItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<ITaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Filter tasks: only show tasks that are (visible AND public) OR owned by the user
  const availableTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isVisibleAndPublic = task.isVisible && task.isPublic;
      const isOwner = task.creatorId === user?.userId;
      return isVisibleAndPublic || isOwner;
    });
  }, [tasks, user?.userId]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await API.get<IGetTasksResponse>("/task", {
          params: { page: 1, limit: 100 },
        });
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast.error("Erro ao carregar tarefas disponíveis.");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Informe o nome da lista.");
      return;
    }

    if (!deadline) {
      toast.error("Informe a data limite.");
      return;
    }

    const parsedDate = new Date(deadline);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Data limite inválida.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/list", {
        classId,
        title: title.trim(),
        deadline: parsedDate.toISOString(),
        submissionLimit: submissionLimit || 1,
        taskIds: selectedTasks.map((t) => t.taskId),
      });
      const taskCount = selectedTasks.length;
      toast.success(
        taskCount > 0
          ? `Lista criada com ${taskCount} tarefa(s)!`
          : "Lista criada com sucesso!",
      );
      setTitle("");
      setDeadline("");
      setSubmissionLimit(1);
      setSelectedTasks([]);
      onCreated();
    } catch (error) {
      toast.error("Erro ao criar lista.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <TextField
        fullWidth
        label="Nome da lista"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Data limite"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        fullWidth
        label="Limite de envios"
        type="number"
        value={submissionLimit}
        onChange={(e) => {
          const rawValue = e.target.value;
          // Treat empty input or invalid numbers as the minimum allowed value
          if (rawValue === "") {
            setSubmissionLimit(1);
            return;
          }
          const parsed = Number(rawValue);
          if (Number.isNaN(parsed) || parsed < 1) {
            setSubmissionLimit(1);
          } else {
            setSubmissionLimit(Math.floor(parsed));
          }
        }}
        sx={{ mb: 2 }}
      />
      <Autocomplete
        multiple
        options={availableTasks}
        disableCloseOnSelect
        loading={loadingTasks}
        value={selectedTasks}
        onChange={(_, newValue) => setSelectedTasks(newValue)}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.taskId === value.taskId}
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
              selectedTasks.length === 0 ? "Selecione tarefas..." : ""
            }
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
        sx={{ mb: 3 }}
      />
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? <CircularProgress size={24} /> : "Criar Lista"}
      </Button>
    </Box>
  );
}

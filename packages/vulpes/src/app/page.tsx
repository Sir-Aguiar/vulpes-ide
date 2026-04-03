"use client";

import { ITask } from "@/@types/Task";
import AppNavBar from "@/components/AppNavBar";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [Tasks, setTasks] = useState<ITask[]>([]);

  useEffect(() => {
    API.get("/task").then((response) => {
      setTasks(response.data.tasks);
    });
  }, []);

  return (
    <>
      <AppNavBar position="sticky" />
      <div className={`w-full min-h-[200vh] flex flex-col`}>
        <div className="w-full h-screen pb-24 pt-64 flex flex-col items-center justify-center gap-4">
          <Typography
            className={montserrat.className}
            variant="h2"
            sx={{ fontWeight: 500 }}
          >
            Bem-vindos
          </Typography>
          <Typography className={montserrat.className} variant="h5">
            O ambiente de desenvolvimento integrado para Portugol
          </Typography>

          <div className="flex flex-col items-center mt-auto">
            <Typography className={montserrat.className} variant="h6">
              Descubra Mais
            </Typography>
            <KeyboardArrowDownIcon fontSize="large" />
          </div>
        </div>
        <div className="w-full h-screen py-12 px-8 flex flex-col items-center gap-8">
          <Typography className={montserrat.className} variant="h4">
            Tarefas Públicas
          </Typography>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell width={120}></TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell align="right">Dificuldade</TableCell>
                  <TableCell align="right">Data de Criação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Tasks.map((task) => (
                  <TableRow key={task.taskId}>
                    <TableCell>
                      <Link
                        href={`/task/${task.taskId}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Typography variant="body2" color="primary">
                          Ver Detalhes
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {task.title}
                    </TableCell>
                    <TableCell align="right">Fácil</TableCell>
                    <TableCell align="right">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
}

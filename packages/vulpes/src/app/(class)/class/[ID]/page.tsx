"use client";

import { IClass } from "@/@types/Class";

import AppNavBar from "@/components/AppNavBar";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";

import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import RequestsTab from "./components/RequestTab";
import CreateListTab from "./components/CreateListTab";
import ListsTab from "./components/ListsTab";
import TasksTab from "./components/TaskTab";

export default function ClassPage() {
  const { ID } = useParams();
  const { user } = useAuth();
  const classId = Array.isArray(ID) ? ID[0] : ID;
  const isProfessorOrAdmin =
    user?.role === "PROFESSOR" || user?.role === "ADMIN";

  const [tabIndex, setTabIndex] = useState(0);
  const [classData, setClassData] = useState<IClass | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  const isOwnerOrAdmin =
    user?.role === "ADMIN" ||
    (classData?.professorId && user?.userId === classData.professorId);

  const tabs = useMemo(() => {
    if (isOwnerOrAdmin) {
      return [
        { key: "tasks", label: "Tarefas" },
        { key: "requests", label: "Solicitações" },
        { key: "create", label: "Criar Lista" },
        { key: "lists", label: "Listas" },
      ];
    }

    return [
      { key: "lists", label: "Listas" },
      { key: "tasks", label: "Tarefas" },
    ];
  }, [isOwnerOrAdmin]);

  useEffect(() => {
    if (tabIndex > tabs.length - 1) {
      setTabIndex(0);
    }
  }, [tabIndex, tabs.length]);

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return;
      setLoadingClass(true);
      setClassError(null);
      try {
        const response = await API.get<IClass>(`/class/${classId}`);
        setClassData(response.data);
      } catch (error) {
        console.error("Failed to fetch class:", error);
        setClassError("Não foi possível carregar a turma.");
      } finally {
        setLoadingClass(false);
      }
    };

    fetchClass();
  }, [classId]);

  if (loadingClass) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (classError || !classData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Alert severity="error">{classError ?? "Turma não encontrada."}</Alert>
      </Box>
    );
  }

  const activeTab = tabs[tabIndex]?.key ?? "lists";

  return (
    <AuthGuard requiredRoles={["STUDENT", "PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1">
            {classData.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Código: {classData.code} • Professor: {classData.professor.name}
          </Typography>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ mb: 3 }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>

        {activeTab === "tasks" && (
          <TasksTab
            classId={classData.classId}
            isProfessorOrAdmin={isProfessorOrAdmin}
          />
        )}
        {activeTab === "requests" && (
          <RequestsTab classId={classData.classId} />
        )}
        {activeTab === "create" && (
          <CreateListTab
            classId={classData.classId}
            onCreated={() =>
              setTabIndex(tabs.findIndex((t) => t.key === "lists"))
            }
          />
        )}
        {activeTab === "lists" && <ListsTab classId={classData.classId} />}
      </Container>
    </AuthGuard>
  );
}

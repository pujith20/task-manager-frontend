// app/dashboard/page.js
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";

import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import TaskTable from "./components/TaskTable/page";

const DashboardWrapper = styled("div")(() => ({
  padding: "2rem",
  minHeight: "100vh",
  backgroundColor: "#f4f6f8",
}));

const GridWrapper = styled("div")({
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
});

const SectionTitle = styled(Typography)(() => ({
  marginBottom: "1rem",
  fontWeight: "bold",
  fontSize: "1.5rem",
}));

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("assigned");
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("role");
    if (!token) {
      router.push("/login");
    } else {
      const user = localStorage.getItem("user");
      if (!user) {
        router.push("/login");
      }
      if (role === "Manager") {
        router.push("/manager"); // Navigate to /manager
      } else if (role === "Admin") {
        router.push("/admin"); // Navigate to /admin
      }
    }
  }, [router]);

  const fetchTasks = async (category) => {
    setLoading(true);
    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("jwtToken");

    try {
      const res = await fetch(
        `http://localhost:3001/api/tasks?category=${selectedCategory}&userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      console.log(data.tasks);
      setTasks(data.tasks);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      fetchTasks(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    logAction(`Switched to ${category} tasks`);
  };

  const getTitle = () => {
    switch (selectedCategory) {
      case "assigned":
        return "Tasks Assigned to You";
      case "created":
        return "Tasks You Created";
      case "overdue":
        return "Overdue Tasks";
      default:
        return "";
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (task.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("http://localhost:3001/api/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const logAction = async (action) => {
    try {
      const token = localStorage.getItem("jwtToken");
      await fetch("http://localhost:3001/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
    } catch (err) {
      console.error("Failed to log action", err);
    }
  };

  const handleTaskCreated = () => {
    console.log("handleTaskCreated called"); // Add this log
    fetchTasks(selectedCategory);
    setIsTaskFormOpen(false);
  };

  const handleOpenTaskForm = () => {
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
  };

  const tasksPerPage = 6;
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  return (
    <DashboardWrapper>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <SectionTitle variant="h4">Dashboard</SectionTitle>
        <button
          onClick={() => {
            setShowLogs(!showLogs);
            if (!showLogs) fetchLogs(); // Fetch logs when opening
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {showLogs ? "Hide Logs" : "Show Logs"}
        </button>
      </Box>

      {isTaskFormOpen && (
        <TaskForm
          onSave={handleSaveTask}
          onCancel={handleCloseTaskForm}
          onTaskCreated={handleTaskCreated} // Make sure this prop is passed
        />
      )}

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={2}
        mt={4}
        mb={2}
      >
        <Box flexGrow={1}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          />
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap">
          <select
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              minWidth: "160px",
              outline: "none",
            }}
            value={selectedCategory}
            onChange={(e) => handleCardClick(e.target.value)}
          >
            <option
              value="assigned"
              onClick={() => handleCardClick("assigned")}
            >
              Assigned to Me
            </option>
            <option value="created" onClick={() => handleCardClick("created")}>
              Created by Me
            </option>
            <option value="overdue" onClick={() => handleCardClick("overdue")}>
              Overdue Tasks
            </option>
          </select>

          <select
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              minWidth: "160px",
              outline: "none",
            }}
            onChange={(e) => {
              const sortKey = e.target.value;
              const sorted = [...tasks].sort((a, b) => {
                if (sortKey === "dueDate") {
                  return new Date(a.dueDate) - new Date(b.dueDate);
                } else if (sortKey === "priority") {
                  const order = { High: 1, Medium: 2, Low: 3 };
                  return order[a.priority] - order[b.priority];
                } else if (sortKey === "status") {
                  return a.status.localeCompare(b.status);
                }
                return 0;
              });
              setTasks(sorted);
            }}
          >
            <option value="">Sort By</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </Box>
      </Box>

      {showLogs && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">User Activity Logs</Typography>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
              {logs.map((log, index) => (
                <li key={index}>
                  {new Date(log.timestamp).toLocaleString()} - {log.action}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {selectedCategory && currentTasks.length > 0 ? (
        <TaskTable tasks={currentTasks} title={getTitle()} />
      ) : (
        <Typography variant="body1" sx={{ mt: 4, textAlign: "center" }}>
          No tasks ? Create your tasks and explore NOW ....
        </Typography>
      )}
      <Box display="flex" justifyContent="center" mt={4} gap={1}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor:
                currentPage === index + 1 ? "#1976d2" : "#e0e0e0",
              color: currentPage === index + 1 ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}
      </Box>
    </DashboardWrapper>
  );
};

export default Dashboard;

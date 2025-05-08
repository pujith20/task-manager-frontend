// ManagerComponent.js
"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import { Edit, Assignment } from "@mui/icons-material";
import { Alert, AlertTitle } from "@mui/material";
import getSocket from "../lib/socket";

const ManagerDashboard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#f1f8e9",
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  width: "100%",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
}));

const ManagerTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  color: "#388e3c",
}));

const TaskTableContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(2),
  overflowX: "auto",
  maxHeight: "500px", // Added maxHeight for scrollable table
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 700,
  "& .MuiTableCell-head": {
    backgroundColor: "#e6ee9c",
    color: "#212121",
    fontWeight: "bold",
    position: "sticky", // Make thead sticky
    top: 0,
    zIndex: 1,
  },
  "& .MuiTableCell-body": {
    fontSize: "1rem",
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    cursor: "pointer",
  },
  "& .MuiTableCell-root": {
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)", // Lighter border
  },
}));

const ManagerComponent = () => {
  const [tasks, setTasks] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [assignedUserId, setAssignedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = getSocket();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "To Do",
    assignee: "",
    isRecurring: false,
    recurrence: "None",
  });

  useEffect(() => {
      const role = localStorage.getItem("role");
      setUserRole(role);
    }, []);

  // Fetch tasks for the manager (all tasks)
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("http://localhost:3001/api/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.status}`);
      }
      const data = await res.json();
      console.log(data.tasks);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users for the assign dialog
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers(); // Ensure users are fetched before tasks.
      await fetchTasks();
    };
    fetchData();
  }, [fetchTasks, fetchUsers]);

  if (userRole !== "Manager") {
      return (
        <Alert severity="warning">
          <AlertTitle>Unauthorized</AlertTitle>
          You do not have permission to access this page.
        </Alert>
      );
    }

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      assignee: task.assignee || "",
      isRecurring: task.isRecurring || false,
      recurrence: task.recurrence || "None",
    });
    setOpenEditDialog(true);
  };

  const handleUpdateTask = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `http://localhost:3001/api/tasks/update/${selectedTask._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to update task: ${res.status}`);
      }
      const updated = await res.json();
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === updated._id ? updated : t))
      ); // Update the task in the list
      setOpenEditDialog(false);
      setSelectedTask(null);
      socket.emit("taskUpdated", updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedTask(null);
  };

  const handleOpenAssignDialog = (taskId) => {
    setSelectedTaskId(taskId);
    setOpenAssignDialog(true);
    fetchUsers(); // Fetch users when the dialog opens
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedTaskId(null);
    setAssignedUserId("");
  };

  const handleAssignTask = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `http://localhost:3001/api/tasks/update/${selectedTaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assignee: assignedUserId }), // Send only the assignee
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to assign task: ${res.status}`);
      }
      const updatedTask = await res.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTaskId ? { ...task, assignee: updatedTask.assignee } : task
        )
      );

      setOpenAssignDialog(false);
      setSelectedTaskId(null);
      setAssignedUserId("");
      socket.emit("taskAssigned", updatedTask);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTask = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch("http://localhost:3001/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const result = await response.json();
      setTasks((prevTasks) => [...prevTasks, result]);
      setOpenCreateDialog(false);
      socket.emit("taskCreated", result);
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        status: "To Do",
        assignee: "",
        isRecurring: false,
        recurrence: "None",
      });
    } catch (error) {
      console.error("Error submitting task:", error);
      setError(error.message);
    }
  };

  const openCreateTaskDialog = () => {
    setOpenCreateDialog(true);
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "To Do",
      assignee: "",
      isRecurring: false,
      recurrence: "None",
    });
  };

  const closeCreateTaskDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTask) {
      handleUpdateTask();
    } else {
      handleCreateTask();
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "N/A";
  };

  if (loading) {
    return <div>Loading...</div>; // Simple loading indicator
  }

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <ManagerDashboard>
      <ManagerTitle variant="h6">Manager Dashboard</ManagerTitle>
      <TaskTableContainer>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned By</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>
                  {task.creator ? getUserName(task.creator) : "N/A"}
                </TableCell>
                <TableCell>
                  {task.assignee ? getUserName(task.assignee) : "N/A"}
                </TableCell>

                <TableCell>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpenAssignDialog(task._id)}
                    >
                      <Assignment />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TaskTableContainer>

      {/* Edit/Create Task Dialog */}
      <Dialog
        open={openEditDialog || openCreateDialog}
        onClose={openEditDialog ? handleCloseEditDialog : closeCreateTaskDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedTask ? "Edit Task" : "Create Task"}
        </DialogTitle>
        <DialogContent>
          <Box p={2}>
            <Typography variant="h5" gutterBottom>
              {selectedTask ? "Edit Task" : "Create Task"}
            </Typography>

            <Box mb={2}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={
                  openEditDialog ? handleCloseEditDialog : closeCreateTaskDialog
                }
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="user-select-label">Assign To User</InputLabel>
            <Select
              labelId="user-select-label"
              id="user-select"
              value={assignedUserId}
              label="Assign To User"
              onChange={(e) => setAssignedUserId(e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAssignTask} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </ManagerDashboard>
  );
};

export default ManagerComponent;

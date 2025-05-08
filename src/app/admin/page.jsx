// AdminComponent.js
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
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import { Alert, AlertTitle } from "@mui/material";
import getSocket from "../lib/socket";

const AdminDashboard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#f0f4c3",
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  width: "100%",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
}));

const AdminTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  color: "#827717",
}));

const TaskTableContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(2),
  overflowX: "auto",
  maxHeight: "500px",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 700,
  "& .MuiTableCell-head": {
    backgroundColor: "#f4ff81",
    color: "#212121",
    fontWeight: "bold",
    position: "sticky",
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
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const AdminComponent = () => {
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
  const [userRole, setUserRole] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("https://task-manager-backend-emo1.onrender.com/api/tasks", {
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

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("https://task-manager-backend-emo1.onrender.com/api/auth/", {
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
      await fetchUsers();
      await fetchTasks();
    };
    fetchData();
  }, [fetchTasks, fetchUsers]);

  if (userRole !== "Admin") {
    return (
      <Alert severity="warning">
        <AlertTitle>Unauthorized</AlertTitle>
        You do not have permission to access this page.
      </Alert>
    );
  }

  // --- Task Management ---
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
        `https://task-manager-backend-emo1.onrender.com/api/tasks/update/${selectedTask._id}`,
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
      );
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
    fetchUsers();
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
        `https://task-manager-backend-emo1.onrender.com/api/tasks/update/${selectedTaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assignee: assignedUserId }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to assign task: ${res.status}`);
      }
      const updatedTask = await res.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTaskId
            ? { ...task, assignee: updatedTask.assignee }
            : task
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
      const response = await fetch("https://task-manager-backend-emo1.onrender.com/api/tasks/create", {
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

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (task) => {
    setTaskToDelete(task);
    setOpenDeleteDialog(true);
  };

  // Function to handle actual deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `https://task-manager-backend-emo1.onrender.com/api/tasks/delete/${taskToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to delete task: ${res.status}`);
      }

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskToDelete._id)
      );

      setOpenDeleteDialog(false);
      setTaskToDelete(null);
      socket.emit("taskDeleted", taskToDelete);
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to handle closing the delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTaskToDelete(null);
  };

  // --- User Management ---
  const handleOpenUserDialog = (user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `https://task-manager-backend-emo1.onrender.com/api/auth/update/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userFormData),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to update user: ${res.status}`);
      }
      const updatedUser = await res.json();
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      setOpenUserDialog(false);
      setSelectedUser(null);
      socket.emit("userUpdated", updatedUser);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `https://task-manager-backend-emo1.onrender.com/api/auth/delete/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      setUsers(users.filter((user) => user._id !== userId));
      setOpenEditUserDialog(false);
      socket.emit("userDeleted", userId);
    } catch (error) {
      setError(error.message);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "N/A";
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setOpenEditUserDialog(true);
  };

  const handleCloseEditUserDialog = () => {
    setOpenEditUserDialog(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
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
    <AdminDashboard>
      <AdminTitle variant="h6">Admin Dashboard</AdminTitle>

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
                <TableCell>
                  {new Date(task.dueDate).toLocaleDateString()}
                </TableCell>
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
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteConfirmation(task)}
                    >
                      <DeleteIcon />
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
        <DialogTitle>{selectedTask ? "Edit Task" : "Create Task"}</DialogTitle>
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
          <Button
            onClick={handleAssignTask}
            variant="contained"
            color="primary"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteTask} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditUserDialog}
        onClose={handleCloseEditUserDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box p={2}>
            <Typography variant="h5" gutterBottom>
              Edit User Details
            </Typography>

            <Box mb={2}>
              <TextField
                label="Name"
                name="name"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, name: e.target.value })
                }
                fullWidth
                required
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, email: e.target.value })
                }
                fullWidth
                required
              />
            </Box>

            <Box mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={userFormData.role}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, role: e.target.value })
                  }
                >
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                onClick={handleCloseEditUserDialog}
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                variant="contained"
                color="primary"
                style={{ marginRight: "10px" }}
              >
                Save
              </Button>
              <Button
                onClick={() => handleDeleteUser(selectedUser._id)}
                variant="contained"
                color="error"
              >
                Delete
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* User List Table */}
      <Paper style={{ marginTop: "20px", padding: "10px", overflowX: "auto" }}>
        <Typography variant="h6" style={{ marginBottom: "10px" }}>
          User List
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>UserName</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditUser(user)}
                    startIcon={<PersonIcon />}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </AdminDashboard>
  );
};

export default AdminComponent;

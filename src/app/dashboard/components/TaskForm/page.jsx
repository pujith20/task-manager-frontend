import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  FormControlLabel,
  Switch
} from "@mui/material";
import getSocket from "../../../lib/socket";

const TaskForm = ({ task, onSave, onCancel }) => {
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

  const [users, setUsers] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    fetch("https://task-manager-backend-emo1.onrender.com/api/auth/")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  useEffect(() => {
    if (task) {
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
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'isRecurring' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async () => {
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
      onSave(result); // callback with the new task
      if (formData.assignee) {
        socket.emit("taskAssigned", {
          // Use the socket instance
          toUserId: formData.assignee,
          task: result, // Pass the newly created task data
        });
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      alert("Failed to submit task. See console for details.");
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        {task ? "Edit Task" : "Create Task"}
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
          <Select name="status" value={formData.status} onChange={handleChange}>
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
      <Box mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.isRecurring}
              onChange={handleChange}
              name="isRecurring"
            />
          }
          label="Recurring Task"
        />
      </Box>
      {formData.isRecurring && (
        <Box mb={2}>
          <FormControl fullWidth required>
            <InputLabel>Recurrence</InputLabel>
            <Select
              name="recurrence"
              value={formData.recurrence}
              onChange={handleChange}
            >
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button onClick={onCancel} variant="outlined" sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default TaskForm;

"use client";

import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Paper,
  Box,
  useTheme,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";

const TaskTable = ({ tasks, title }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (!tasks || tasks.length === 0) return null;

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "done":
        return { backgroundColor: "#c8e6c9", color: "#256029" };
      case "to do":
        return { backgroundColor: "#fff9c4", color: "#827717" };
      case "pending":
        return { backgroundColor: "#ffe0b2", color: "#e65100" };
      case "overdue":
        return { backgroundColor: "#ffcdd2", color: "#b71c1c" };
      default:
        return { backgroundColor: "#e0e0e0", color: "#424242" };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority.toLowerCase()) {
      case "low":
        return { backgroundColor: "#dcedc8", color: "#33691e" };
      case "medium":
        return { backgroundColor: "#bbdefb", color: "#0d47a1" };
      case "high":
        return { backgroundColor: "#ffcdd2", color: "#b71c1c" };
      default:
        return { backgroundColor: "#eeeeee", color: "#212121" };
    }
  };

  return (
    <Paper elevation={0} sx={{ mt: 4, p: 2, backgroundColor: "transparent" }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          overflowX: isSmallScreen ? "auto" : "visible", // Enable horizontal scroll on small screens
          width: "100%", // Ensure the box takes full width
        }}
      >
        <Table
          sx={{
            borderCollapse: "collapse",
            "& td, & th": {
              borderBottom: "1px solid #ccc",
              padding: isSmallScreen ? "8px" : "16px", // Adjust padding for small screens
              whiteSpace: "nowrap", // Prevent text wrapping
            },
            "& th": {
              fontWeight: "bold",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow key={index}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: "999px",
                      display: "inline-block",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      ...getPriorityStyle(task.priority),
                    }}
                  >
                    {task.priority}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: "999px",
                      display: "inline-block",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      ...getStatusStyle(task.status),
                    }}
                  >
                    {task.status}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default TaskTable;

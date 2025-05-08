"use client";

import React, { useState, useEffect, useRef } from "react";
import getSocket from "../../../lib/socket";
import { Badge, IconButton, Popover, Typography, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";


const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const socket = getSocket();
  const popoverRef = useRef(null); // Ref for the Popover
  


  const fetchNotifications = async (anchorTarget) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("https://task-manager-backend-emo1.onrender.com/api/notifications/", {
        credentials: "include",
        headers: {
          // Add the Authorization header
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotifications(data);
      if(anchorTarget){
        console.log(anchorTarget);
        setAnchorEl(anchorTarget); 
      }
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("user");
    if (!storedUserId) return;

    socket.emit("register", storedUserId);

    socket.on("newTask", (task) => {
      const newNotification = {
        _id: Date.now(),
        message: `New task assigned: ${task.title}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    });

    socket.on("notificationCreated", (notification) => {
      // Listen for new event
      setNotifications((prev) => [notification, ...prev]);
    });

    fetchNotifications(null);

    return () => {
      socket.off("newTask");
      socket.off("notificationCreated"); // Clean up
    };
  }, []);

  

  const handleClick = async (event) => {
    const target = event.currentTarget;
    if (anchorEl) {
      handleClose(); // If already open, close it
    } else {
      await fetchNotifications(target); // Fetch and open
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setUnreadCount(notifications.filter((notif) => !notif.read).length);
  }, [notifications]);

  const open = Boolean(anchorEl);

  useEffect(() => {
    console.log("Notifications state:", notifications);
 }, [notifications]);

  

  return (
    <>
      <IconButton onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id="notification-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300, minHeight: 100 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          {notifications.length === 0 ? (
            <Typography variant="body2">No notifications</Typography>
          ) : (
            notifications.map((n) => (
              <Box
                key={n._id}
                sx={{
                  mb: 1,
                  p: 1,
                  backgroundColor: n.read ? "#fff" : "#f0f0f0",
                  borderRadius: "4px",
                  border: '1px solid #e0e0e0', // Add a border
                }}
              >
                <Typography variant="body2">
                    <strong>Message:</strong> {n.message}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Created At:</strong> {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                  
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;

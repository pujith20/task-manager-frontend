"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, Menu, ChevronLeft } from "lucide-react";
import TaskForm from "../TaskForm/page";
import NotificationBell from "../NotificationBell/page";

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.common.white,
  marginRight: theme.spacing(2),
  "&:hover": {
    color: "rgba(255, 255, 255, 0.7)",
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#d9534f",
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: "#c9302c",
  },
}));

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const showNavbar = pathname !== "/login";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { palette, togglePalette } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false); // New state for screen size

  useEffect(() => {
    setIsDarkMode(palette.mode === "dark");
  }, [palette.mode]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 600); // Define your small screen breakpoint here
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);
  };

  return (
    <>
      {showNavbar ? (
        <>
          <AppBar
            position="static"
            sx={{
              backgroundColor: "#1976d2",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2, display: { sm: "none" } }} // Hide on larger screens
              >
                <Menu />
              </IconButton>
              <Typography
                variant="h6"
                component={Link}
                href="/"
                sx={{ flexGrow: 1, textDecoration: "none", color: "white" }}
              >
                My Website
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexGrow: 1,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleOpenDialog}
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    borderRadius: "8px",
                    paddingX: 2,
                    paddingY: 1,
                    fontWeight: 600,
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#388e3c",
                    },
                    display: { xs: "none", sm: "flex" }, // Only show on medium+ screens
                  }}
                >
                  Create Task
                </Button>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={togglePalette} color="inherit">
                  {isDarkMode ? <Sun /> : <Moon />}
                </IconButton>
                <NotificationBell />
              </Box>
              {!isSmallScreen && ( // Only show on large screens
                <LogoutButton
                  onClick={handleLogout}
                  sx={{ ml: { xs: 0, sm: 2 } }}
                >
                  Logout
                </LogoutButton>
              )}
            </Toolbar>
          </AppBar>
          <Drawer
            open={isDrawerOpen}
            onClose={toggleDrawer(false)}
            sx={{
              "& .MuiDrawerPaper": { width: 240 },
            }}
          >
            <Toolbar>
              <IconButton onClick={toggleDrawer(false)} sx={{ ml: -1 }}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" sx={{ ml: 2 }}>
                My Website
              </Typography>
            </Toolbar>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/about"
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText primary="About" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/services"
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText primary="Services" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href="/contact"
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText primary="Contact" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleLogout();
                    toggleDrawer(false);
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleOpenDialog}>
                  <ListItemText primary="Create Task" />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="sm"
          >
            <Box p={3}>
              <TaskForm
                onSave={(data) => {
                  console.log("Saved task:", data);
                  handleCloseDialog();
                }}
                onCancel={handleCloseDialog}
              />
            </Box>
          </Dialog>
        </>
      ) : null}
    </>
  );
};

export default Navbar;

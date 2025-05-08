"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stack, TextField, Button, Typography, MenuItem } from "@mui/material";

export default function SignupForm({ setIsSignUp }) {
  const [name, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("User");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for the JWT token in localStorage
    const token = localStorage.getItem("jwtToken");
    if (token) {
      // If a token exists, the user is likely logged in, so redirect them to the dashboard
      router.push("/dashboard");
    }
  }, [router]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name || !username || !email || !password || !confirmPassword || !role) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Invalid email format.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed.");

      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("user", data.user.id);
      localStorage.setItem("role",data.user.role);
      router.push("/dashboard");
    } catch (err) {
      setFormError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignupSubmit} style={{ width: "100%" }}>
      <Stack spacing={2}>
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          select
          fullWidth
        >
          <MenuItem value="User">User</MenuItem>
          <MenuItem value="Manager">Manager</MenuItem>
          <MenuItem value="Admin" disabled>
            Admin (Restricted)
          </MenuItem>
        </TextField>
        {formError && (
          <Typography color="error" variant="body2">
            {formError}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "#4caf50",
            "&:hover": { backgroundColor: "#388e3c" },
          }}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </Stack>
    </form>
  );
}

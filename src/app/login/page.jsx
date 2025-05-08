"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import loginAnimation from "../animations/login.json";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { styled, useTheme } from "@mui/material/styles";
import { Stack, useMediaQuery } from "@mui/material";
import SignupForm from "../signup/page";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: 800,
  width: "100%",
  margin: "auto",
  borderRadius: "16px",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    padding: theme.spacing(1),
    margin: theme.spacing(1), // Added margin to the container
  },
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingRight: theme.spacing(4),
  [theme.breakpoints.down("lg")]: {
    paddingRight: theme.spacing(1),
  },
  [theme.breakpoints.down("md")]: {
    paddingRight: 0,
    paddingBottom: theme.spacing(1),
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  paddingLeft: theme.spacing(4),
  [theme.breakpoints.down("lg")]: {
    paddingLeft: theme.spacing(1),
  },
  [theme.breakpoints.down("md")]: {
    paddingLeft: 0,
  },
}));

const OrganizoLogo = styled(Typography)(({ theme }) => ({
  fontSize: "1.75rem", // Reduced font size
  fontWeight: "bold",
  marginBottom: theme.spacing(3), // Reduced marginBottom
  color: "#4caf50",
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.25rem", // Further reduced font size for very small screens
    marginBottom: theme.spacing(2), // Reduced marginBottom
  },
}));

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!username || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Parse JSON for error message
        throw new Error(errorData.message || "Login failed.");
      }
      const data = await response.json();

      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("user", data.user.id);
      localStorage.setItem("role", data.user.role);
      toast.success("Login Successful!");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
      toast.error(err.message || "Login Failed"); // show error to user
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPasswordClick = async () => {
    if (!username) {
      toast.error("Please enter your username first.");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:3001/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Username not found.");
      }
      const data = await res.json();
      setEmail(data.email);
      console.log(data);
      setForgotPassword(true);
      toast.success("OTP will be sent to your registered email.");
    } catch (err) {
      toast.error(err.message || "Failed to initiate password reset.");
    }
  };

  const handleSendOTP = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      const data = await res.json();
      toast.success("OTP sent successfully");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/verify-otp", {
        //changed the route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      // IMPORTANT:  Parse the response as JSON.  This is the key fix.
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to verify OTP");
      }
      const data = await res.json();
      toast.success("OTP Verified!");
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.message || "Failed to verify OTP");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error("Enter the password....");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      const data = await res.json();
      toast.success("Password reset successful! Logging in.............");
      setForgotPassword(false);
      setOtpSent(false);
      const loginRes = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: newPassword }), // Changed to email
      });
      if (!loginRes.ok) {
        const errorLoginData = await loginRes.json();
        throw new Error(errorLoginData.message || "Login failed");
      }
      const loginData = await loginRes.json();

      localStorage.setItem("jwtToken", loginData.token);
      localStorage.setItem("user", loginData.user.id);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message || "Reset failed");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f0f4c3",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StyledPaper elevation={0}>
        <LeftPanel>
          <div
            style={{
              maxWidth: isMobile ? "60%" : "80%",
              maxHeight: isMobile ? "100px" : "300px",
              marginBottom: isMobile ? "10rem" : "2rem",
            }}
          >
            <Lottie
              loop
              animationData={loginAnimation}
              style={{ marginBottom: isMobile ? "1rem" : "2rem" }}
            />
          </div>
        </LeftPanel>
        <RightPanel>
          {forgotPassword ? (
            <>
              {!otpSent ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Sending OTP to {email}
                  </Typography>
                  <Button
                    onClick={handleSendOTP}
                    variant="contained"
                    color="primary"
                  >
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <TextField
                      label="OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      disabled={otpVerified} // Disable the input after verification
                    />
                    <Button
                      onClick={handleVerifyOTP}
                      variant="contained"
                      color="secondary" // Changed to a secondary color
                      disabled={otpVerified}
                    >
                      Verify
                    </Button>
                  </Box>
                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    disabled={!otpVerified} // Disable if OTP is not verified.
                  />
                  <Button
                    onClick={handleResetPassword}
                    variant="contained"
                    color="primary"
                    disabled={!otpVerified} // Disable until OTP verified
                  >
                    Reset Password
                  </Button>
                </>
              )}
              <Typography
                variant="body2"
                sx={{ mt: 2, cursor: "pointer", color: "#4caf50" }}
                onClick={() => setForgotPassword(false)}
              >
                Back to Login
              </Typography>
            </>
          ) : (
            <>
              <OrganizoLogo variant="h4">Organizo</OrganizoLogo>
              {isSignUp ? (
                <>
                  <SignupForm setIsSignUp={setIsSignUp} />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Already have an account?{" "}
                    <span
                      onClick={() => setIsSignUp(false)}
                      style={{ color: "#4caf50", cursor: "pointer" }}
                    >
                      Log In
                    </span>
                  </Typography>
                </>
              ) : (
                <>
                  <form onSubmit={handleLoginSubmit} style={{ width: "100%" }}>
                    <Stack spacing={3}>
                      <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={!!error}
                        helperText={error}
                        sx={{ height: "40px" }}
                      />
                      <TextField
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        sx={{ height: "40px" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, cursor: "pointer", color: "#4caf50" }}
                        onClick={handleForgotPasswordClick}
                      >
                        Forgot Password?
                      </Typography>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        fullWidth
                        sx={{
                          backgroundColor: "#ffeb3b",
                          color: "#212121",
                          "&:hover": { backgroundColor: "#f5d600" },
                          padding: "10px 24px",
                          fontSize: "0.8rem",
                        }}
                      >
                        {loading ? "Loading..." : "Continue →"}
                      </Button>
                    </Stack>
                  </form>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Don’t have an account?{" "}
                    <span
                      onClick={() => setIsSignUp(true)}
                      style={{ color: "#4caf50", cursor: "pointer" }}
                    >
                      Sign Up
                    </span>
                  </Typography>
                </>
              )}
            </>
          )}
        </RightPanel>
      </StyledPaper>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Box>
  );
}

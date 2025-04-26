"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";

const Checkout = () => {
  const [isGuest, setIsGuest] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useRouter();
  const { guestCart } = useSelector((state) => state.cart);

  const handleGuestCheckout = async () => {
    if (!email || !phone) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // Here you would make an API call to create a temporary account
      // and send the password via email
      const response = await fetch("/api/auth/guest-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to create guest account");
      }

      // If successful, navigate to payment page
      navigate("/payment");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      // If successful, navigate to payment page
      navigate("/payment");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {isGuest ? "Guest Checkout" : "Login"}
            </Typography>
            <Divider sx={{ my: 2 }} />

            {isGuest ? (
              <>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                  required
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                />
              </>
            )}

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={isGuest ? handleGuestCheckout : handleLogin}
                sx={{ mr: 2 }}>
                {isGuest ? "Continue as Guest" : "Login"}
              </Button>
              <Button variant="outlined" onClick={() => setIsGuest(!isGuest)}>
                {isGuest ? "Login Instead" : "Continue as Guest"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            {/* Add order summary details here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;

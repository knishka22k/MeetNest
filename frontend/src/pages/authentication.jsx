import React, { useContext, useState } from "react";

import {
    Avatar,
    Box,
    Button,
    CssBaseline,
    Grid,
    Paper,
    Snackbar,
    TextField
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import {
    createTheme,
    ThemeProvider
} from "@mui/material/styles";

import { AuthContext } from "../contexts/AuthContext";

const defaultTheme = createTheme();

export default function Authentication() {

    // === STATES ===

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [formState, setFormState] = useState(0);

    const [open, setOpen] = useState(false);

    // === CONTEXT ===

    const { handleRegister, handleLogin } = useContext(AuthContext);

    // === AUTH FUNCTION ===

    const handleAuth = async () => {

        try {

            // === LOGIN ===

            if (formState === 0) {

                const result = await handleLogin(username, password);

                if (result) {
                    setError(result);
                }
            }

            // === REGISTER ===

            if (formState === 1) {

                const result = await handleRegister(
                    name,
                    username,
                    password
                );

                if (result.success) {

                    setName("");
                    setUsername("");
                    setPassword("");

                    setMessage(result.message);

                    setOpen(true);

                    setError("");

                    setFormState(0);

                } else {

                    setError(result.message);
                }
            }

        } catch (err) {

            console.log(err);

            const message =
                err?.response?.data?.message ||
                "Something went wrong";

            setError(message);
        }
    };

    // ================= UI =================

    return (
        <ThemeProvider theme={defaultTheme}>

            <Grid
                container
                component="main"
                sx={{ height: "100vh" }}
            >

                <CssBaseline />

                {/* LEFT SIDE IMAGE */}

                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage:
                            "url(https://source.unsplash.com/random?wallpapers)",

                        backgroundRepeat: "no-repeat",

                        backgroundColor: (t) =>
                            t.palette.mode === "light"
                                ? t.palette.grey[50]
                                : t.palette.grey[900],

                        backgroundSize: "cover",

                        backgroundPosition: "center",
                    }}
                />

                {/* RIGHT SIDE FORM */}

                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={5}
                    component={Paper}
                    elevation={6}
                    square
                >

                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >

                        <Avatar
                            sx={{
                                m: 1,
                                bgcolor: "secondary.main",
                            }}
                        >
                            <LockOutlinedIcon />
                        </Avatar>

                        {/* TOGGLE BUTTONS */}

                        <Box sx={{ mb: 2 }}>

                            <Button
                                variant={
                                    formState === 0
                                        ? "contained"
                                        : "outlined"
                                }
                                onClick={() => setFormState(0)}
                            >
                                Sign In
                            </Button>

                            <Button
                                variant={
                                    formState === 1
                                        ? "contained"
                                        : "outlined"
                                }
                                sx={{ ml: 1 }}
                                onClick={() => setFormState(1)}
                            >
                                Sign Up
                            </Button>

                        </Box>

                        {/* FORM */}

                        <Box
                            component="form"
                            noValidate
                            sx={{ mt: 1, width: "100%" }}
                        >

                            {formState === 1 && (

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                            {/* ERROR */}

                            {
                                error && (
                                    <p style={{ color: "red" }}>
                                        {error}
                                    </p>
                                )
                            }

                            {/* SUBMIT BUTTON */}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {
                                    formState === 0
                                        ? "Login"
                                        : "Register"
                                }
                            </Button>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* SNACKBAR */}

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />

        </ThemeProvider>
    );
}
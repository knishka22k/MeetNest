import React, { useContext, useState } from "react";
import "../App.css";

import user_icon from "../assets/person.png";
import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";

import Snackbar from "@mui/material/Snackbar";

import { AuthContext } from "../contexts/AuthContext";

const Authentication = () => {

    // ================= STATES =================

    const [formState, setFormState] = useState("Login");

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [open, setOpen] = useState(false);

    // ================= CONTEXT =================

    const { handleRegister, handleLogin } = useContext(AuthContext);

    // ================= AUTH FUNCTION =================

    const handleAuth = async () => {

        try {

            // ===== LOGIN =====

            if (formState === "Login") {

                const result = await handleLogin(
                    username,
                    password
                );

                if (result) {
                    setError(result);
                }
            }

            // ===== REGISTER =====

            if (formState === "Sign Up") {

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

                    setFormState("Login");

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

        <div className="container">

            {/* HEADER */}

            <div className="header">

                <div className="text">
                    {formState}
                </div>

                <div className="underline"></div>

            </div>

            {/* INPUTS */}

            <div className="inputs">

                {
                    formState === "Sign Up" && (

                        <div className="input">

                            <img src={user_icon} alt="" />

                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                            />

                        </div>
                    )
                }

                <div className="input">

                    <img src={email_icon} alt="" />

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

                </div>

                <div className="input">

                    <img src={password_icon} alt="" />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                </div>

            </div>

            {/* FORGOT PASSWORD */}

            {
                formState === "Login" && (

                    <div className="forgot-password">

                        Lost Password? <span>Click Here!</span>

                    </div>
                )
            }

            {/* ERROR */}

            {
                error && (
                    <p className="error-message">
                        {error}
                    </p>
                )
            }

            {/* SUBMIT BUTTON */}

            <div className="auth-button">

                <button onClick={handleAuth}>

                    {
                        formState === "Login"
                            ? "Login"
                            : "Register"
                    }

                </button>

            </div>

            {/* TOGGLE BUTTONS */}

            <div className="submit-container">

                <div
                    className={
                        formState === "Login"
                            ? "submit gray"
                            : "submit"
                    }
                    onClick={() => {

                        setFormState("Sign Up");
                        setError("");

                    }}
                >
                    Sign Up
                </div>

                <div
                    className={
                        formState === "Sign Up"
                            ? "submit gray"
                            : "submit"
                    }
                    onClick={() => {

                        setFormState("Login");
                        setError("");

                    }}
                >
                    Login
                </div>

            </div>

            {/* SNACKBAR */}

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />

        </div>
    );
};

export default Authentication;
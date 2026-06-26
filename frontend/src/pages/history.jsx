import React, { useContext, useEffect, useState } from "react";

import {
    Card,
    CardContent,
    IconButton,
    Typography
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";

import { useNavigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";

export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([]);

    const routeTo = useNavigate();


    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const history = await getHistoryOfUser();

                setMeetings(history);

            } catch (err) {

                console.log(err);

                // IMPLEMENT SNACKBAR
            }
        };

        fetchHistory();

    }, [getHistoryOfUser]);

    // ================= FORMAT DATE =================

    const formatDate = (dateString) => {

        const date = new Date(dateString);

        const day = date
            .getDate()
            .toString()
            .padStart(2, "0");

        const month = (date.getMonth() + 1)
            .toString()
            .padStart(2, "0");

        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };
    // ================= UI =================
    return (

        <div style={{ padding: "20px" }}>

            {/* HOME BUTTON */}

            <IconButton
                onClick={() => routeTo("/home")}
            >
                <HomeIcon />
            </IconButton>

            {/* HISTORY LIST */}

            {
                meetings.length > 0 ? (

                    meetings.map((meeting, index) => (

                        <Card
                            key={index}
                            variant="outlined"
                            sx={{
                                mb: 2,
                                borderRadius: 2
                            }}
                        >

                            <CardContent>

                                <Typography
                                    sx={{ fontSize: 14 }}
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Code: {meeting.meetingCode}
                                </Typography>

                                <Typography
                                    sx={{ mb: 1.5 }}
                                    color="text.secondary"
                                >
                                    Date: {formatDate(meeting.date)}
                                </Typography>

                            </CardContent>

                        </Card>
                    ))

                ) : (

                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mt: 3 }}
                    >
                        No meeting history found
                    </Typography>
                )
            }

        </div>
    );
}
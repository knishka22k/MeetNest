import React, { useContext, useState } from 'react';
import withAuth from "../styles/withAuth";
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import Button from '@mui/material/Button';

function HomeComponent(){

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <>
        <div className="navBar">

            <div style={{display: "flex", alignItems: "center"}} className='navBar'>
                <h2>Meet Nest</h2>
            </div>

            <div style={{display: "flex", alignItems: "center"}}>
                
                <IconButton onClick={
                        () => {
                            navigate("/history")
                        }
                    }>
                    <RestoreIcon/>
                </IconButton>

                <p>History</p>

                <Button onClick={() => {
                    localStorage.removeItem("token")
                    navigate("/auth")
                }}>
                    Logout
                </Button>
            </div>
        </div>

        <div className='meetContainer'>
            <div className='leftPanel'>
                <div>
                    <h2>Bringing People Together Virtually</h2>
                    <div className="joinBox">
                        <textarea onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" placeholder='Enter meeting code'></textarea>
                        <Button onClick={handleJoinVideoCall} variant='contained' >Join</Button>
                    </div>
                </div>
            </div>
            <div className='rightPanel'>
                <img srcSet="/logo2.png" alt="" />
            </div>
        </div>
        
        </>
    )
}

export default withAuth(HomeComponent)
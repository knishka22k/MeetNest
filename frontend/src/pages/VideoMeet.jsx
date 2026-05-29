import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import io from "socket.io-client";
// import { input } from '@mui/base';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import Badge from '@mui/material/Badge';
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';


const server_url = server;

var connections = {};
const iceCandidateQueue = {};

const peerConfigConnections = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}


export default function VideoMeetComponent(){

    var socketRef = useRef(); //konsa socket hoga
    let socketIdRef = useRef(); //jase hi server se connect hoga toh ek id milegi merko

    let localVideoRef = useRef(); //friends video arrangment

    let [videoAvailable, setVideoAvailable] = useState(true); //video avilable hai ki ni 

    let [audioAvailable, setAudioAvailable] = useState(true); //audio avilable hai ki ni 

    let [video, setVideo] = useState(false); //video ON or OFF karne 

    let [audio, setAudio] = useState(false); //audio ON or OFF karne

    let [screen, setScreen] = useState(); //screen share krne ke liye

    let [showModal, setModal] = useState(true);

    let [screenAvilable, setScreenAvailable] = useState(); //friends screen sharing

    let [messages, setMessages] = useState([]); //total message during chat

    let [message, setMessage] = useState(""); //new message

    let [newMessages, setNewMessages] = useState(3); //notification se message 

    let [askForUsername, setAskForUsername] = useState(true); //ask to set username

    let [username, setUsername] = useState(""); //enter username

    const videoRef = useRef([]) // a kind of problem

    let [videos  ,setVideos] = useState([])

    // todo
    // if(isChrome() == false){

    // }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video : true});

            if(videoPermission){
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio : true});

            if(audioPermission){
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});

                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch(err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getPermissions();
    }, [])

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].getSenders().forEach(sender => {
    connections[id].removeTrack(sender);
});

window.localStream.getTracks().forEach(track => {
    connections[id].addTrack(track, window.localStream);
});

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch(e) { console.log(e) }

            //TODO BlackSilence
            let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSlience();
            localVideoRef.current.srcObject = window.localStream;

            for(let id in connections){
                connections[id].getSenders().forEach(sender => {
    connections[id].removeTrack(sender);
});

window.localStream.getTracks().forEach(track => {
    connections[id].addTrack(track, window.localStream);
});

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                         .then(() => {
                            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription}))
                         })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {width, height})
        canvas.getContext('2d').fillRect(0,0, width,height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})
            .then(getUserMediaSuccess) //TODO: GetUserMediaSucess
            .then((stream) => { })
            .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    useEffect(() => {
    if (!askForUsername) {
        // Re-attach local stream after UI switches
        setTimeout(() => {
            if (localVideoRef.current && window.localStream) {
                localVideoRef.current.srcObject = window.localStream;
            }
        }, 500);
    }
}, [askForUsername]);

    //TODO
    let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .then(() => {
                // flush queued ICE candidates
                if (iceCandidateQueue[fromId]) {
                    iceCandidateQueue[fromId].forEach(candidate => {
                        connections[fromId].addIceCandidate(new RTCIceCandidate(candidate))
                        .catch(e => console.log(e));
                    });
                    iceCandidateQueue[fromId] = [];
                }
                if (signal.sdp.type === "offer") {
                    connections[fromId].createAnswer()
                    .then((description) => {
                        connections[fromId].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit("signal", fromId,
                                JSON.stringify({ "sdp": connections[fromId].localDescription })
                            );
                        })
                        .catch(e => console.log(e));
                    })
                    .catch(e => console.log(e));
                }
            })
            .catch(e => console.log(e));
        }

        if (signal.ice) {
            if (connections[fromId].remoteDescription && connections[fromId].remoteDescription.type) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e => console.log(e));
            } else {
                if (!iceCandidateQueue[fromId]) iceCandidateQueue[fromId] = [];
                iceCandidateQueue[fromId].push(signal.ice);
            }
        }
    }
}

    //TODO addMessage
    let addMessage = (data, sender, socketIdSender) => {

    setMessages((prevMessages) => [
        ...prevMessages,
        {
            sender: String(sender),
            data: String(data)
        }
    ]);

    if(socketIdSender !== socketIdRef.current){
        setNewMessages((prev) => prev + 1);
    }
}

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

            socketRef.current.on("connect", () => {
            
                socketRef.current.emit("join-call", window.location.href)

                socketIdRef.current = socketRef.current.id

                socketRef.current.on("chat-message", addMessage)

                socketRef.current.on("user-left", (id) => {
    setVideos((videos) =>
        videos.filter((video) => video.socketId !== id)
    )
})

                socketRef.current.on("user-joined", (id, clients) => {
                    clients.forEach((socketListId) => {
                        connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                        iceCandidateQueue[socketListId] = [];

                        connections[socketListId].onicecandidate = (event) => {
                            if(event.candidate !== null){
                                socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
                            }
                        }

                        connections[socketListId].ontrack = (event) => {

    if(socketListId === socketIdRef.current){
        return;
    }

    setVideos(prevVideos => {

        const alreadyExists = prevVideos.find(
            v => v.socketId === socketListId
        );

        if(alreadyExists){
            return prevVideos;
        }

        return [
            ...prevVideos,
            {
                socketId: socketListId,
                stream: event.streams[0]
            }
        ];
    });
};
                        if(window.localStream !== undefined && window.localStream !== null ){
                            window.localStream.getTracks().forEach(track => {
    connections[socketListId].addTrack(track, window.localStream);
});
                        } else {
                            // TODO BLACKSLIENCE
                            // let blackSlience

                            let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
                            window.localStream = blackSlience();
                            window.localStream.getTracks().forEach(track => {
    connections[socketListId].addTrack(track, window.localStream);
});
                        }
                    })

                    if(id === socketIdRef.current){
                        for(let id2 in connections){
                            if(id2 === socketIdRef.current) continue

                            try{ 
                                connections[id2].getSenders().forEach(sender => {
    connections[id2].removeTrack(sender);
});

window.localStream.getTracks().forEach(track => {
    connections[id2].addTrack(track, window.localStream);
});
                            } catch (e) { }

                            connections[id2].createOffer().then((description) => {
                                connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}))
                                })
                                .catch(e => console.log(e))
                            })
                        }
                    }
                })
            })

    }

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);

        connectToSocketServer();
    }

    let routerTo = useNavigate();

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let handleVideo = () => {

    const videoTrack = window.localStream
        ?.getVideoTracks()[0];

    if(videoTrack){

        videoTrack.enabled = !videoTrack.enabled;

        setVideo(videoTrack.enabled);
    }
}

    let handleAudio = () => {

    const audioTrack = window.localStream
        ?.getAudioTracks()[0];

    if(audioTrack){

        audioTrack.enabled = !audioTrack.enabled;

        setAudio(audioTrack.enabled);
    }
}

    let getDisplayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) {console.log(e)}

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => [
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            ])
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let getDisplayMedia = () => {
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    useEffect(() => {
        if(screen != undefined){
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let sendMessage = () => {

        if(message.trim() === ""){
        return;
    }

    socketRef.current.emit(
        "chat-message",
        message,
        username
    );

    setMessage("");
}

let handleEndCall = () => {

    try {

        if(localVideoRef.current?.srcObject){

            let tracks =
                localVideoRef.current.srcObject.getTracks();

            tracks.forEach(track => track.stop());
        }

        if(socketRef.current){
            socketRef.current.disconnect();
        }

    } catch (e) {
        console.log(e);
    }

    routerTo("/home");
}

    return(
        <div>
            {askForUsername === true ?
    <div className={styles.lobbyWrapper}>
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>

        <div className={styles.lobbyCard}>
            <h2 className={styles.lobbyTitle}>Enter into Lobby</h2>
            <video ref={localVideoRef} autoPlay muted className={styles.lobbyPreview}></video>
            <div className={styles.lobbyInputRow}>
                <TextField
                    id="outlined-basic"
                    label="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    variant="outlined"
                    sx={{
                        input: { color: 'white' },
                        label: { color: 'rgba(255,255,255,0.5)' },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={connect}
                    sx={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { background: 'rgba(255,255,255,0.2)' }
                    }}
                >
                    Connect
                </Button>
            </div>
        </div>
    </div> : 


            <div className={styles.meetVideoContainer}>

                {showModal ? <div className={styles.chatRoom}>
                    <div className={styles.chatContainer}>
                        <h1>Chat</h1>

                        <div className={styles.chattingDisplay}>

                            { messages.length > 0 ? messages.map((item, index) => {
                                return (
                                    <div style={{marginBottom:"20px"}}key={index}>
                                        <p style={{fontWeight: "bold"}}>{item.sender}</p>
                                        <p>{item.data}</p>
                                    </div>
                                )
                            }) : 
                            <p>No messages yet</p>
                            }
                        </div>

                        <div className={styles.chattingArea}>                       
                            <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter your chat" variant="outlined" />
                            <button variant='contained' onClick={sendMessage}>SEND</button>
                        </div>
                    </div>
                </div> : <></>}
                
                <div className={styles.buttonContainer}>

                    <IconButton onClick={handleVideo} style={{color: "white"}}>
                        {(video === true) ? <VideocamIcon/> : <VideocamOffIcon/> }
                    </IconButton>

                    <IconButton onClick={handleEndCall} style={{color: "red"}}>
                        <CallEndIcon/>
                    </IconButton>

                    <IconButton onClick={handleAudio} style={{color: "white"}}>
                        {(audio === true) ? <MicIcon/> : <MicOffIcon/> }
                    </IconButton>

                    {screenAvilable === true ?
                    <IconButton onClick={handleScreen} style={{color: "white"}}>
                        {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                    </IconButton> : <></>}

                    <Badge badgeContent={newMessages} max={999} color='secondary'>
                        <IconButton onClick={() => setModal(!showModal)} style={{color: "white"}}>
                            <ChatIcon/>
                        </IconButton>
                    </Badge>
                </div>

            <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted playsInline></video>

            <div className={styles.conferenceView}>
    {videos.map((video) => (
        <video
            key={video.socketId}
            className={styles.remoteVideo}
            playsInline
            autoPlay
            ref={(ref) => {
                if(ref && video.stream){
                    ref.srcObject = video.stream;
                }
            }}
        />
    ))}
</div>
            
            </div>
            }

        </div>
    )
}
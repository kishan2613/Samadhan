import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { Send } from "lucide-react";
import { Mic, MicOff } from "lucide-react";
import { Video, VideoOff } from "lucide-react";
import { PhoneOff } from "lucide-react";
import { Volume2 } from "lucide-react";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [receivedTranscript, setReceivedTranscript] = useState("");

  const recognitionRef = useRef(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const toggleMic = () => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled = !cameraOn;
      setCameraOn(!cameraOn);
    }
  };

  const startRecording = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript.trim()) {
          console.log("🗣️ Transcribed:", finalTranscript.trim());
          socket.emit("send-transcript", {
            to: remoteSocketId,
            transcript: finalTranscript.trim(),
          });
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } else {
      alert("Speech Recognition not supported in your browser");
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  useEffect(() => {
    socket.on("receive-transcript", ({ transcript }) => {
      setReceivedTranscript(transcript);
    });

    return () => {
      socket.off("receive-transcript");
    };
  }, [socket]);

  const endCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
      setRemoteStream(null);
      setRemoteSocketId(null);
    }
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

const handleSpeak = () => {
  const utterance = new SpeechSynthesisUtterance(receivedTranscript);

  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);

  speechSynthesis.speak(utterance);
};

  return (
    <div className="min-h-screen top-20  py-16">
      <div className="max-w mx-auto bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl p-6 space-y-6">
        <p className="text-center text-lg">
          {remoteSocketId ? (
            <span className="text-green-600 font-medium">Connected</span>
          ) : (
            <span className="text-red-500 font-medium">No one in room</span>
          )}
        </p>

      {/* Stream Div */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myStream && (
            <div className="flex flex-col rounded-xl shadow-lg border-4 border-white items-center">
              {/* <h2 className="text-xl text-white font-semibold mb-2">My Stream</h2> */}
              <ReactPlayer
                playing
                muted
                height="350px"
                width="100%"
                url={myStream}
                className="rounded-xl bordershadow"
              />
            </div>
          )}
          {remoteStream && (
            <div className="flex flex-col rounded-xl shadow-lg border-4 border-white items-center">
              {/* <h2 className="text-xl text-white font-semibold mb-2">Remote Stream</h2> */}
              <ReactPlayer
                playing
                muted
                height="350px"
                width="100%"
                url={remoteStream}
                className="rounded-lg shadow"
              />
            </div>
          )}
        </div>
      {/* Stream Div Ends */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          {myStream && (
            <>
            <button
             onClick={sendStreams}
              title="Send Stream"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow"
              >
             <Send className="w-5 h-5" />
              </button>

              <button
                onClick={toggleMic}
                title={micOn ? "Turn off microphone (CTRL + D)" : "Turn on microphone (CTRL + D)"}
                className={`${
                  micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
                } text-white p-2 rounded-full shadow transition`}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleCamera}
                title={cameraOn ? "Turn off camera (CTRL + E)" : "Turn on camera (CTRL + E)"}
                className={`${
                  cameraOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
                } text-white p-2 rounded-full shadow transition`}
              >
                {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>


              
              <button
                onClick={endCall}
                title="End Call (CTRL + Q)"
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow transition"
              >
                <PhoneOff className="w-5 h-5" />
              </button>

              <button
                onClick={isRecording ? pauseRecording : startRecording}
                className={`${
                  isRecording ? "bg-red-500 animate-pulse" : "bg-green-600"
                } hover:bg-opacity-80 text-white px-4 py-2 rounded-lg shadow`}
              >
                {isRecording ? "Pause Recording" : "Start Recording"}
              </button>
            </>
          )}
        


{receivedTranscript && (
  <button
    onClick={handleSpeak}
    title="Play Received Message"
    className={`bg-green-600 text-white p-2 rounded-full shadow transition 
      ${isSpeaking ? "ring-4 ring-green-300 shadow-lg" : "hover:bg-green-700"}`}
  >
    <Volume2 className="w-5 h-5" />
  </button>
)}

          {remoteSocketId && !myStream && (
            <button
              onClick={handleCallUser}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
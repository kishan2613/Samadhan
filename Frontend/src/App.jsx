    // App.jsx
    import {useState,useEffect} from "react";
    import { Box } from '@mui/material';
    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import Home from "./pages/Home";
    import About from "./pages/About";
    import SignUp from "./pages/SignUp";
    import Login from "./pages/Login";
    // import Lobby from "./pages/Lobby";
    // import RoomPage from "./pages/Room";
    import Navbar from "./components/common/Navbar";
    import MediatorDetailsForm from "./pages/UserAdditional";
    import MediatorConnect from "./pages/MediatorConnect/page";
    import MediatorDetails from "./pages/MediatorConnect/details";
    import Notification from "./components/Notification";
    import Proposal from "./components/CreateProposal";
    import ActiveProposal from "./pages/Proposal/activeProposal";
    import ChatRooms from "./pages/ChatRoom/Rooms";
    import Footer from "./components/common/Footer";
    // import VideoCall from "./pages/VideoCall/VideoCall";
    import Assistant from "./pages/Assistant";
    import Community from "./pages/Community/Community";
    import LanguageSelector from "./pages/AskLang/view";
    import Groups from "./pages/ChatRoom/Group";
    import Guide from "./components/common/Guide";
    import EducationMain from "./pages/Education/main";

    // import LanguageSelector from "./pages/AskLang/view";

    // import Smeet from "./service/Smeet";
    import VideoConference from "../src/pages/ChatRoom/VideoConference";


    function App() {
      const [showLangModal, setShowLangModal] = useState(false);
    const [selectedLang, setSelectedLanguage] = useState(
      localStorage.getItem("preferredLanguage") || ''
    );

    // Fixed useEffect: runs only on mount
    useEffect(() => {
      console.log("App mounted");
      const storedLang = localStorage.getItem("preferredLanguage");
      if (storedLang) {
        setSelectedLanguage(storedLang);
      } else {
        setShowLangModal(true);
      }
    }, [selectedLang]); 

    const handleLanguageSelected = (lang) => {
      setSelectedLanguage(lang);
      localStorage.setItem("preferredLanguage", lang);
      setShowLangModal(false);
    };

    const handleLangChange = () => {
      localStorage.removeItem("preferredLanguage");
      setSelectedLanguage('');
      setShowLangModal(true);
    };

    if(showLangModal){
      return (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center">
          <LanguageSelector onLanguageSelected={handleLanguageSelected}/>
        </div>
      );
    }

      return (
        <Router>
          <Navbar handleLangChange={handleLangChange}/>
          <Box sx={{height:"60px"}}/>
          <Box sx={{ minHeight: '100vh',padding: 0 }}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/mediator-details" element={<MediatorDetailsForm />} />
            <Route path="/mediator-connect" element={<MediatorConnect />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/VideoCall" element={<Lobby />} /> */}
            <Route path="/proposal" element={<Proposal />} />
            <Route path="/notify" element={<Notification />} />
            <Route path="/Chat" element={<ChatRooms />} />
            <Route path="/Groups" element={<Groups />} />
            <Route path="/chat/:roomId" element={<Groups />} />
            <Route path="/active-proposal" element={<ActiveProposal />} />
            {/* <Route path="/VideoCall/:roomid" element={<RoomPage />} /> */}
            <Route path="/mediator/:id" element={<MediatorDetails />} />
            <Route path="/Ask-Samadhan" element={<Assistant />} />
             {/* <Route path="/call/:roomId" element={<VideoCall />} /> */}
            <Route path="/samadhan-meet/:roomId" element={<Groups/>} />
            <Route path="/educate" element={<EducationMain/>} />
            <Route path="/samadhan-community" element={<Community/>} />
          </Routes>
          </Box> 
          <Footer />
                <Guide/>

        </Router>
      );
    }

    export default App;
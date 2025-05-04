import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import RoomPage from "./pages/Room";
import Navbar from "./components/common/Navbar";
import MediatorDetailsForm from "./pages/UserAdditional";
import MediatorConnect from "./pages/MediatorConnect/page";
import MediatorDetails from "./pages/MediatorConnect/details";
import Notification from "./components/Notification";
import Proposal from "./components/CreateProposal";
import ActiveProposal from "./pages/Proposal/activeProposal";
import ChatRooms from "./pages/ChatRoom/Rooms";
import Footer from "./components/common/Footer";
import Assistant from "./pages/Assistant";

function App() {
  return (
    <Router>
      <Navbar/> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/mediator-details" element={<MediatorDetailsForm />} />
        <Route path="/mediator-connect" element={<MediatorConnect />} />
        <Route path="/signup" element={< SignUp />} />
        <Route path="/login" element={< Login />} />
        <Route path="/VideoCall" element={< Lobby />} />
        <Route path="/proposal" element={< Proposal />} />
        <Route path="/notify" element={< Notification />} />
        <Route path="/Chat" element={< ChatRooms />} />
        <Route path="/active-proposal" element={< ActiveProposal />} />
        <Route path="/VideoCall/:roomid" element={< RoomPage />} />
        <Route path="/mediator/:id" element={<MediatorDetails />} />
        <Route path="/assistant" element={<Assistant/>} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import RoomPage from "./pages/Room";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={< SignUp />} />
        <Route path="/login" element={< Login />} />
        <Route path="/VideoCall" element={< Lobby />} />
        <Route path="/VideoCall/:roomid" element={< RoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Group from "./pages/Group";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router basename="/spliteasy">
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/group/:id" element={<Group />} />
      </Routes>
    </Router>
  );
}

import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PresaleInterface from "@/components/PresaleInterface";
import AdminPage from "@/components/AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PresaleInterface />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;

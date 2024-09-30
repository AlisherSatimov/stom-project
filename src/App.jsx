import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ManagerLayout from "./layout/managerLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ManagerLayout />} />
      <Route path="*" element={<div>NOT FOUND</div>} />
    </Routes>
  );
}

export default App;

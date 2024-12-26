import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ManagerLayout from "./layout/managerLayout";
import Patients from "./pages/Patients";
import Clients from "./pages/Clients";
import CreateClient from "./pages/CreateClient";
import ClientID from "./pages/ClientID";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ManagerLayout />}>
        <Route index element={<Patients />} />
        <Route path="clients" element={<Clients />} />
        <Route path="createClient" element={<CreateClient />} />
        <Route path="clientID" element={<ClientID />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<div>NOT FOUND</div>} />
    </Routes>
  );
}

export default App;

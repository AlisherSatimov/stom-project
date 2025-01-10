import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ManagerLayout from "./layout/managerLayout";
import Patients from "./pages/Patients";
import Clients from "./pages/Clients";
import CreateClient from "./pages/CreateClient";
import ClientID from "./pages/ClientID";
import Notifications from "./pages/Notifications";
import { ClientProvider } from "./context/ClientContext";
import Admin from "./pages/admin";

function App() {
  return (
    <ClientProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ManagerLayout />}>
          <Route index element={<Patients />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/createClient" element={<CreateClient />} />
          <Route path="/clientID/:clientId" element={<ClientID />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<div>NOT FOUND</div>} />
      </Routes>
    </ClientProvider>
  );
}

export default App;

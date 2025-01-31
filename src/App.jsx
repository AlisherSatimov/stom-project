import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ManagerLayout from "./layout/managerLayout";
import Patients from "./pages/Patients";
import Clients from "./pages/Clients";
import CreateClient from "./pages/CreateClient";
import ClientID from "./pages/ClientID";
import Notifications from "./pages/Notifications";
import { ClientProvider } from "./context/ClientContext";
import AdminLayout from "./layout/adminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import Employees from "./pages/Employees";
import ServiceController from "./pages/ServiceController";
import CreateEmployee from "./pages/CreateEmployee";

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
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/createEmployee" element={<CreateEmployee />} />
          {/* <Route path="/clientID/:clientId" element={<ClientID />} /> */}
          <Route
            path="/admin/serviceController"
            element={<ServiceController />}
          />
        </Route>
        <Route path="*" element={<div>NOT FOUND</div>} />
      </Routes>
    </ClientProvider>
  );
}

export default App;

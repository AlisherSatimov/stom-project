import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Axios
import axios from "axios";
axios.defaults.baseURL = "https://3dclinic.uz:8085";

// SiderProvider import qilish
import { SiderProvider } from "./context/SiderContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SiderProvider>
      <App />
    </SiderProvider>
  </BrowserRouter>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "remixicon/fonts/remixicon.css";

import "./assets/plugins/fontawesome/css/all.min.css";
import "./assets/plugins/tabler-icons/tabler-icons.min.css";
import "./assets/plugins/icons/feather/feather.css";

import "./assets/css/style.min.css";
import "./assets/css/style.css";
// import "./index.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
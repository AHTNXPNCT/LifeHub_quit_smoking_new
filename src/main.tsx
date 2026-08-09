import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LifeHubClient from "@/src/app/LifeHubClient";
import "../app/globals.css";
import "../app/responsive.css";
import "../app/enhancements.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LifeHubClient />
  </StrictMode>,
);

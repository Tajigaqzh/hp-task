import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import WindowRoot from "./windows/WindowRoot.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WindowRoot />
  </React.StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div className="relative h-full">
      <App />
      <footer className="text-center lg:text-left">
        <div className="p-4 text-center text-surface dark:text-black">
          © 2024 Copyright:&nbsp;
          <a href="https://lennoaubert.blog/" className="underline">
            Lenno Aubert Hartono
          </a>
          &nbsp;-&nbsp;2602116983
        </div>
      </footer>
    </div>
  </React.StrictMode>
);

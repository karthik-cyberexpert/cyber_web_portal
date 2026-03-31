import { createRoot } from 'react-dom/client';
import App from "./App.tsx";
import "./index.css";

if (typeof window !== "undefined") {
  const sendToParent = (data: any) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(data, "*");
      }
    } catch {}
  };

  window.addEventListener("error", (event) => {
    // Send structured payload to parent iframe
    sendToParent({
      type: "ERROR_CAPTURED",
      error: {
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: "window.onerror",
      },
      timestamp: Date.now(),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: any = event.reason;
    const message =
      typeof reason === "object" && reason?.message
        ? String(reason.message)
        : String(reason);
    const stack = typeof reason === "object" ? reason?.stack : undefined;

    // Mirror to parent iframe as well
    sendToParent({
      type: "ERROR_CAPTURED",
      error: {
        message,
        stack,
        filename: undefined,
        lineno: undefined,
        colno: undefined,
        source: "unhandledrejection",
      },
      timestamp: Date.now(),
    });
  });
}

// --- Security & Console Protection ---
if (import.meta.env.PROD || true) {
  const warningTitle = 'STOP!';
  const warningMessage = 'This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your account.';
  
  console.log(`%c${warningTitle}`, 'color: red; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black;');
  console.log(`%c${warningMessage}`, 'color: #333; font-size: 18px;');
  
  // Anti-debugging check
  setInterval(() => {
    const startTime = Date.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if (Date.now() - startTime > 100) {
      console.warn('[SECURITY] Debugger detected! Session integrity check initiated.');
    }
  }, 5000);
}
// -------------------------------------

import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
);
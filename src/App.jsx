// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import "./App.css";
import router from "./router";
import store from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChatButton from "./components/FloatingChatButton";
import VendorChatModal from "./components/VendorChatModal";
import { ChatProvider } from "./context/ChatContext";
import ComingSoon from "./pages/ComingSoon";

const LIVE_DOMAINS = ["tendr.co.in", "www.tendr.co.in"];
const isLiveDomain = LIVE_DOMAINS.includes(window.location.hostname);

// Scroll to top on every navigation
router.subscribe(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
});

function App() {
  // On tendr.co.in — lock entire app to Coming Soon, no routing possible
  if (isLiveDomain) {
    return (
      <HelmetProvider>
        <ComingSoon />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ChatProvider>
          <RouterProvider router={router} />
          <FloatingChatButton />
          <VendorChatModal />
        </ChatProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
export default App;

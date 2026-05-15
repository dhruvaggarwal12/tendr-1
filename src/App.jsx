// src/App.jsx
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import "./App.css";
import router from "./router";
import store from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChatButton from "./components/FloatingChatButton";

// Scroll to top on every navigation
router.subscribe(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
});

function App() {
  return (
    <ErrorBoundary>
        <RouterProvider router={router} />
        <FloatingChatButton />
    </ErrorBoundary>
  );
}
export default App;

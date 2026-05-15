import React from "react";
import { useNavigate } from "react-router-dom";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";
import Navbar from "./Navbar";

export default function ToolNav({ title }) {
  const navigate = useNavigate();
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,252,245,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(139,69,19,0.1)", boxShadow: "0 2px 16px rgba(139,69,19,0.06)" }}>
      <Navbar tendrLogo={tendrLogo} handleLogoClick={() => navigate("/")} />
    </nav>
  );
}

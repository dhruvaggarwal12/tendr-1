import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import router from "../router";

const font = "'Outfit', sans-serif";

export default function FloatingChatButton({ hideOnRoutes = ["/chat", "/chats"] }) {
  const { user } = useSelector((s) => s.auth);
  const formData = useSelector((s) => s.eventPlanning.formData);
  const bookingType = useSelector((s) => s.eventPlanning.bookingType);
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState(() => router.state.location.pathname);

  // Track route changes in the SPA
  useEffect(() => {
    const unsub = router.subscribe((state) => {
      setPath(state.location.pathname);
      setOpen(false);
    });
    return unsub;
  }, []);

  if (hideOnRoutes.some((r) => path === r || path.startsWith(r + "/"))) return null;

  const handleSupport = () => {
    setOpen(false);
    // Navigate to chat as concierge (let-us-do-it style)
    router.navigate("/chat", {
      state: {
        vendor: { _id: "concierge", name: "Tendr Support", approved: true },
        bookingType: "let-us-do-it",
        from: "support",
        formData,
      },
    });
  };

  const handleVendorChat = () => {
    setOpen(false);
    router.navigate("/listings");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 20px",
          borderRadius: 100,
          border: "none",
          background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: font,
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(196,122,46,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(196,122,46,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 18px rgba(196,122,46,0.45)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12c0 4.418-4.03 8-9 8-1.071 0-2.097-.162-3.05-.464L3 21l1.55-4.05C4.2 15.97 4 14.999 4 14c0-4.418 4.03-8 9-8s8 3.582 8 6z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Chat
      </button>

      {/* Popup menu */}
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 899 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              bottom: 72,
              right: 20,
              zIndex: 901,
              background: "#FFFCF5",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(139,69,19,0.15)",
              border: "1px solid rgba(196,122,46,0.15)",
              padding: 8,
              minWidth: 220,
              fontFamily: font,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px 4px" }}>
              Start a Chat
            </p>

            {[
              {
                icon: "🤝",
                title: "Chat with Tendr",
                desc: "Concierge planning support",
                onClick: handleSupport,
              },
              {
                icon: "🔍",
                title: "Browse Vendors",
                desc: "Find & chat with vendors",
                onClick: handleVendorChat,
              },
            ].map(({ icon, title, desc, onClick }) => (
              <button
                key={title}
                onClick={onClick}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: font,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,122,46,0.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#9B7450" }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

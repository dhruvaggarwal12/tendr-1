import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatOverlay } from "../../../context/ChatContext";
import HamburgerNav from "../../../components/HamburgerNav";

/**
 * Simple chat list for "you-do-it" flow.
 * Theme updated via CSS only to resemble the provided landing page:
 * - Warm cream backdrop
 * - Soft rounded cards with subtle shadows
 * - Golden accents for CTAs/badges
 * - Friendly modern typography
 */
export default function CustomerChatList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // TODO: swap with real API
        const mock = [
          {
            _id: "688ca5a56c15763d773a8d2d",
            name: "Chopra Decors",
            lastMessage: "We can do floral + lighting within your budget.",
            unreadCount: 2,
            approved: true,
          },
          {
            _id: "5a5b5c5d5e",
            name: "Zest Caterers",
            lastMessage: "Sharing a sample menu for 250 pax.",
            unreadCount: 0,
            approved: true,
          },
        ];
        if (mounted) setThreads(mock);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const { openVendorChat } = useChatOverlay();

  return (
    <div>
    <HamburgerNav active="Chats" />
    <div className="max-w-3xl mx-auto p-4 mt-6">
      {/* THEME CSS (only CSS changes, no JSX structure changes) */}
      <style>{`
        /* Import a friendly geometric font similar to the site's feel */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        :root{
          --cream-50:#FFF9EF;
          --cream-100:#FFF4E2;
          --cream-200:#FDEFD2;
          --gold-500:#E6A800;
          --gold-600:#D99600;
          --ink-700:#4C4336;
          --ink-600:#5E5344;
          --ink-500:#6F6454;
          --card-border:#F2E6C9;
        }

        /* Page background + base typography */
        body {
          background: var(--cream-50) !important;
          font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif !important;
          color: var(--ink-700) !important;
        }

        /* Section container soft card feel */
        .max-w-3xl.mx-auto.p-4{
          background: linear-gradient(180deg, var(--cream-50), var(--cream-100));
          border: 1px solid var(--card-border);
          border-radius: 18px;
          box-shadow:
            0 10px 30px rgba(210, 180, 140, 0.18),
            0 2px 6px rgba(0,0,0,0.04);
        }

        /* Heading styling to echo hero text vibe */
        .text-2xl.font-bold.mb-4{
          font-size: 1.75rem !important;
          letter-spacing: 0.2px;
          color: var(--ink-700) !important;
          text-shadow: 0 1px 0 rgba(255,255,255,0.6);
        }

        /* Card list spacing (keep Tailwind spacing but refine) */
        .space-y-3 > * + *{ margin-top: 0.85rem !important; }

        /* List items: soften borders, add creamy background & hover lift */
        .bg-white.border.rounded-xl.p-3{
          background: #FFFFFFCC; /* translucent white over cream */
          backdrop-filter: blur(2px);
          border-color: var(--card-border) !important;
          border-width: 1px !important;
          border-style: solid !important;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .bg-white.border.rounded-xl.p-3:hover{
          transform: translateY(-1px);
          background: #FFFFFFEE;
          box-shadow:
            0 12px 28px rgba(210, 180, 140, 0.22),
            0 4px 8px rgba(0,0,0,0.06);
        }

        /* Avatar placeholder to match palette */
        .w-12.h-12.rounded-full.bg-gray-200{
          background: linear-gradient(145deg, var(--cream-200), var(--cream-100)) !important;
          border: 1px solid var(--card-border);
        }

        /* Text subtlety */
        .text-sm.text-gray-600{
          color: var(--ink-500) !important;
        }
        .text-gray-600{ color: var(--ink-600) !important; }

        /* Skeleton loaders in warm tones */
        .bg-gray-100{ background: var(--cream-100) !important; }
        .animate-pulse > *{
          position: relative;
          overflow: hidden;
        }
        .animate-pulse > *::after{
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          transform: translateX(-100%);
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer{
          100%{ transform: translateX(100%); }
        }

        /* "New" badge with golden accent */
        .bg-yellow-100{
          background: linear-gradient(180deg, #FFE7A3, #FFD66B) !important;
          border: 1px solid #F1C24C;
        }
        .text-yellow-700{ color: #6B4E00 !important; }

        /* Subtle link/interactive cursor refinements already present */

        /* Make list items feel roomy on small screens */
        @media (max-width: 480px){
          .bg-white.border.rounded-xl.p-3{ padding: 0.9rem !important; }
          .w-12.h-12.rounded-full.bg-gray-200{ width: 2.5rem !important; height: 2.5rem !important; }
        }
      `}</style>

      <h1 className="text-2xl font-bold mb-4">Chats</h1>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-gray-600">No conversations yet.</div>
      ) : (
        <ul className="space-y-3">
          {threads.map((v) => (
            <li
              key={v._id}
              className="bg-white border rounded-xl p-3 hover:shadow transition cursor-pointer"
              onClick={() => openVendorChat(v)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold truncate">{v.name}</h2>
                    {v.unreadCount > 0 && (
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                        {v.unreadCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {v.lastMessage || "—"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
}

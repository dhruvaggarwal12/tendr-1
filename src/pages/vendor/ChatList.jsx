import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from "../../assets/logos/tendr-logo-secondary.png";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function relativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// ── Tendr Bookings tab (platform chats via admin-approved flow) ──────────────
function TendrBookingsTab({ token }) {
  const [chats, setChats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/vendor/chats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : Promise.resolve({ data: [] }))
      .then(d => setChats(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Empty text="Loading…" />;
  if (!chats.length) return <Empty icon="💬" text="No Tendr bookings yet" sub="When a customer's chat request is approved, it appears here." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {chats.map((chat) => (
        <ChatRow
          key={chat.id || chat._id}
          name={chat.customerName || 'Customer'}
          sub={chat.eventType || chat.serviceType || ''}
          time={relativeTime(chat.updatedAt || chat.timestamp)}
          badge={chat.status === 'active' ? '●' : null}
          badgeColor="#4caf80"
          onClick={() => navigate('/vendor/chat', {
            state: {
              chatId:        chat.id || chat._id,
              customerName:  chat.customerName,
              customerImage: chat.customerImage,
              eventType:     chat.eventType,
              eventDate:     chat.eventDate,
              guestCount:    chat.guestCount,
              customerPhone: chat.customerPhone,
            }
          })}
        />
      ))}
    </div>
  );
}

// ── Direct Messages tab (vendor-direct / profile-share chats) ─────────────
function DirectMessagesTab({ token }) {
  const [chats, setChats]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/vendors/me/direct-chats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : Promise.resolve({ conversations: [] }))
      .then(d => setChats(d.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Empty text="Loading…" />;
  if (!chats.length) return (
    <Empty
      icon="🔗"
      text="No direct messages yet"
      sub="When someone chats via your shared profile link, it appears here. Tendr is not involved in these chats."
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {chats.map((convo) => (
        <ChatRow
          key={convo._id}
          name={convo.visitorName || 'Guest'}
          sub={convo.serviceType || 'Direct enquiry'}
          time={relativeTime(convo.updatedAt)}
          preview={convo.lastMessage?.content || ''}
          badge={null}
          pill="Direct"
          onClick={() => navigate(`/chat/direct/${convo._id}`)}
        />
      ))}
    </div>
  );
}

// ── Shared presentational bits ────────────────────────────────────────────────
function ChatRow({ name, sub, time, preview, badge, badgeColor, pill, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
        background: '#fff', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#fdf6ee'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: '#fef3e2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700, color: '#c49b30', flexShrink: 0,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1207', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pill && (
              <span style={{ fontSize: 10, fontWeight: 600, background: '#fff8e7', color: '#c49b30', border: '1px solid rgba(196,155,48,0.3)', borderRadius: 4, padding: '1px 6px', letterSpacing: '0.05em' }}>
                {pill}
              </span>
            )}
            <span style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>{time}</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {badge && <span style={{ color: badgeColor, marginRight: 5, fontSize: 10 }}>{badge}</span>}
          {preview || sub}
        </div>
      </div>
    </div>
  );
}

function Empty({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      {icon && <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>}
      <div style={{ fontWeight: 700, fontSize: 16, color: '#333', marginBottom: 8 }}>{text}</div>
      {sub && <div style={{ fontSize: 13, color: '#999', maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>{sub}</div>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const VendorChatList = () => {
  const navigate      = useNavigate();
  const { token }     = useSelector(s => s.auth);
  const [tab, setTab] = useState('tendr'); // 'tendr' | 'direct'

  const TABS = [
    { key: 'tendr',  label: 'Tendr Bookings' },
    { key: 'direct', label: 'Direct Messages' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: '#f8f3ed', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e0d5', padding: '0 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '14px 0', gap: 12 }}>
          <button onClick={() => navigate('/vendor/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: '50%', display: 'flex' }}>
            <ArrowBackIcon style={{ color: '#555', fontSize: 22 }} />
          </button>
          <img src={logo} alt="Tendr" style={{ height: 32, cursor: 'pointer' }} onClick={() => navigate('/')} />
          <span style={{ fontWeight: 800, fontSize: 18, color: '#1a1207' }}>Chats</span>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 0 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: tab === t.key ? 700 : 500,
                fontSize: 13, color: tab === t.key ? '#c49b30' : '#888',
                borderBottom: `2.5px solid ${tab === t.key ? '#c49b30' : 'transparent'}`,
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', minHeight: 'calc(100dvh - 110px)' }}>
        {tab === 'tendr'  && <TendrBookingsTab  token={token} />}
        {tab === 'direct' && <DirectMessagesTab token={token} />}
      </div>
    </div>
  );
};

export default VendorChatList;

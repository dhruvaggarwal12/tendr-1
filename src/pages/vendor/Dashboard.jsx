import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import VendorAvailabilityCalendar from '../../components/VendorAvailabilityCalendar';
import logo from '../../assets/logos/tendr-logo-secondary.png';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const BASE = BASE_URL; // alias
const font = "'Outfit', sans-serif";
const gold = '#C47A2E';
const goldLt = '#CCAB4A';
const ink = '#2C1A0E';
const cream = '#FFFCF5';

// Decode vendorId from JWT without library
const parseJwt = (t) => { try { return JSON.parse(atob(t.split('.')[1])); } catch { return {}; } };

const authHeaders = (token) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

// ── Color helpers ──────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  Pending:   { bg: '#FEF9C3', color: '#92400E', dot: '#F59E0B' },
  Confirmed: { bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  Completed: { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  Cancelled: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};
const PAY_COLOR = {
  Pending: '#D97706',
  Partial: '#7C3AED',
  Paid:    '#16A34A',
};
const dsic = (d) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const SOURCE_ICON = {
  WhatsApp:  dsic(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>),
  Instagram: dsic(<><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>),
  Facebook:  dsic(<><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></>),
  Referral:  dsic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  'Walk-in': dsic(<><circle cx="12" cy="5" r="1"/><path d="m9 20 3-3 1.5 3"/><path d="m6 8 3 1.5L12 8l1.5 4-3 3"/><path d="M18 14v-4"/></>),
  Phone:     dsic(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>),
  Other:     dsic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
};

// ── Stat tile ──────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, icon, accent }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(196,122,46,0.08)', border: '1px solid rgba(196,122,46,0.12)', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: ink, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#9B7450', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent || 'rgba(196,122,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      </div>
    </div>
  );
}

// ── Outside Order Form Modal ───────────────────────────────────────────────────
const EVENT_TYPES = ['Birthday', '1st Birthday', 'Baby Shower', 'Anniversary', 'Wedding', 'Engagement', 'Housewarming', 'Graduation', 'Puja/Religious', 'Corporate', 'Office Party', 'Get-together', 'Other'];
const SOURCES = ['WhatsApp', 'Instagram', 'Facebook', 'Referral', 'Walk-in', 'Phone', 'Other'];
const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const BLANK_FORM = { clientName: '', clientPhone: '', clientEmail: '', eventType: '', eventDate: '', startTime: '', endTime: '', equipment: [], amount: '', paidAmount: '', source: 'WhatsApp', status: 'Pending', notes: '', milestones: [], expenses: [], reminders: [] };
const REMINDER_PRESETS = [
  { label: 'Day of event', days: 0 },
  { label: '1 day before', days: 1 },
  { label: '3 days before', days: 3 },
  { label: '1 week before', days: 7 },
  { label: '2 weeks before', days: 14 },
];
const ENTERTAINMENT_TYPES = ['DJ', 'Emcee/Host', 'Anchor', 'AV Setup', 'Band', 'Singer', 'Musician', 'Performer', 'Stand-up Comedian', 'Magician'];

// Per-type dashboard config
const TYPE_CONFIG = {
  'DJ': {
    isArtist:true, emoji:'🎧', term:'Gig', terms:'Gigs', invLabel:'Equipment', invEmoji:'🎛️',
    invCats:['DJ Console','Mixer','Speaker','Subwoofer','Amplifier','Microphone','Lighting','Effect Lights','Cables','Stand','Generator','Other'],
    invPlaceholder:'e.g. Pioneer CDJ-3000',
    profileTools:[
      { label:'Demo Mix / SoundCloud', sub:'Link to your best mix',      icon:<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></> },
      { label:'Genres',                sub:'EDM, Bollywood, Sufi, Hip-hop…', icon:<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube, SoundCloud', icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
      { label:'Technical Rider',       sub:'PA, power & stage requirements', icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
    ],
    quickTips:['Log your gig before the event so you don\'t forget','Add equipment to know what goes to each gig','Share your page link in your Instagram bio'],
    emptyGigMsg:'No gigs yet — start logging outside bookings to track your income.',
  },
  'Emcee/Host': {
    isArtist:true, emoji:'🎙️', term:'Show', terms:'Shows', invLabel:'Kit', invEmoji:'🎤',
    invCats:['Wireless Mic','Lavalier Mic','Earpiece / IEM','Portable Speaker','Prompter Script Stand','Formal Outfit','Blazer / Sherwani','Other'],
    invPlaceholder:'e.g. Sennheiser Wireless Mic',
    profileTools:[
      { label:'Demo Reel',             sub:'Video from past shows',          icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Languages',             sub:'Hindi, English, Punjabi, Marwari…', icon:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
      { label:'Event Types Hosted',    sub:'Wedding, Corporate, Award Night…', icon:<><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube',              icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['Add a demo reel to get 3× more enquiries','List the languages you host in — clients filter by this','Keep your event types up to date'],
    emptyGigMsg:'No shows yet — log your first hosting gig to start tracking income.',
  },
  'Anchor': {
    isArtist:true, emoji:'🎙️', term:'Show', terms:'Shows', invLabel:'Kit', invEmoji:'🎤',
    invCats:['Wireless Mic','Lavalier Mic','Earpiece / IEM','Portable Speaker','Prompter Script Stand','Formal Outfit','Blazer / Sherwani','Other'],
    invPlaceholder:'e.g. Sennheiser Wireless Mic',
    profileTools:[
      { label:'Demo Reel',             sub:'Video from past shows',          icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Languages',             sub:'Hindi, English, Punjabi, Marwari…', icon:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
      { label:'Event Types Hosted',    sub:'Wedding, Corporate, Award Night…', icon:<><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube',              icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['Add a demo reel to get 3× more enquiries','List the languages you anchor in — clients filter by this','Mention event types you specialise in'],
    emptyGigMsg:'No shows yet — log your first anchoring gig to start tracking income.',
  },
  'Band': {
    isArtist:true, emoji:'🎸', term:'Gig', terms:'Gigs', invLabel:'Equipment', invEmoji:'🎸',
    invCats:['Guitar','Drum Kit','Keyboard / Piano','Bass Guitar','Violin','Trumpet','Saxophone','PA System','Microphone','Cables & Snakes','Stand','Other'],
    invPlaceholder:'e.g. Yamaha Stage Custom Drum Kit',
    profileTools:[
      { label:'Band Members',          sub:'Vocalist, guitarist, drummer…',  icon:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
      { label:'Live Performance Video',sub:'Clip from a recent gig',         icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Setlist & Genres',      sub:'Bollywood, Jazz, Rock, Sufi…',   icon:<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></> },
      { label:'Technical Rider',       sub:'PA, backline, stage & power needs', icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
    ],
    quickTips:['Upload a live video — it converts enquiries fastest','Add all band members so clients know the full lineup','Your rider saves back-and-forth with every new client'],
    emptyGigMsg:'No gigs yet — start logging band bookings to track your collective income.',
  },
  'Singer': {
    isArtist:true, emoji:'🎤', term:'Performance', terms:'Performances', invLabel:'Equipment', invEmoji:'🎵',
    invCats:['Microphone','Wireless Mic','IEM / In-Ear Monitor','Speaker','Karaoke / Backing Track Player','Cables','Mic Stand','Other'],
    invPlaceholder:'e.g. Shure SM58 Wireless Mic',
    profileTools:[
      { label:'Voice Sample / Demo',   sub:'Audio or video clip of your voice', icon:<><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></> },
      { label:'Languages & Genres',    sub:'Hindi, English, Punjabi, ghazal…', icon:<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></> },
      { label:'Song Repertoire',       sub:'Top tracks, categories & mood',    icon:<><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube, Spotify',      icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['A 60-second voice clip doubles your booking rate','Add languages — clients always search by this','List your top 20 songs to save time on enquiries'],
    emptyGigMsg:'No performances yet — log your first singing gig to start tracking income.',
  },
  'Musician': {
    isArtist:true, emoji:'🎻', term:'Performance', terms:'Performances', invLabel:'Equipment', invEmoji:'🎼',
    invCats:['Primary Instrument','Secondary Instrument','Amp / Amplifier','Effects Pedal','Cables','Mic / DI Box','Stand','Case / Bag','Other'],
    invPlaceholder:'e.g. Yamaha P-125 Digital Piano',
    profileTools:[
      { label:'Instrument & Style',    sub:'Piano, guitar, tabla, violin…',   icon:<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></> },
      { label:'Demo Recording',        sub:'Audio or video sample',            icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Genres & Occasions',    sub:'Classical, fusion, wedding, jazz…', icon:<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube, SoundCloud',   icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['Upload a demo to showcase your style','Specify your instrument clearly — clients search by it','List genres: classical, fusion, folk, jazz — all help'],
    emptyGigMsg:'No performances logged yet — start tracking your gigs here.',
  },
  'Performer': {
    isArtist:true, emoji:'🎭', term:'Show', terms:'Shows', invLabel:'Kit', invEmoji:'🎭',
    invCats:['Costume / Outfit','Props','Lighting','Sound System','Backdrop','Makeup Kit','Other'],
    invPlaceholder:'e.g. LED costume or prop',
    profileTools:[
      { label:'Performance Video',     sub:'Best clip of your act',           icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Act Type',              sub:'Dance, magic, acrobatics…',       icon:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube',              icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
      { label:'Show Duration Options', sub:'30 min / 45 min / 1 hour',       icon:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
    ],
    quickTips:['A 30-second video clip sells your act better than any description','Mention event types you perform at','Set clear duration options so clients know what to expect'],
    emptyGigMsg:'No shows logged yet — start tracking your performance bookings.',
  },
  'Stand-up Comedian': {
    isArtist:true, emoji:'😄', term:'Show', terms:'Shows', invLabel:'Kit', invEmoji:'😄',
    invCats:['Wireless Mic','Lavalier Mic','Speaker','Backdrop / Banner','Outfit','Other'],
    invPlaceholder:'e.g. Shure handheld mic',
    profileTools:[
      { label:'Promo Video / Clip',    sub:'Your best bit or reel',           icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Languages',             sub:'Hindi, English, Hinglish…',       icon:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
      { label:'Set Duration',          sub:'20 min / 45 min / 1 hour options', icon:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube',              icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['A 1-min clip from a show is your best business card','Mention whether you do clean / crowd-safe sets','List the languages you perform in'],
    emptyGigMsg:'No shows logged yet — start tracking your comedy bookings.',
  },
  'Magician': {
    isArtist:true, emoji:'🪄', term:'Show', terms:'Shows', invLabel:'Kit', invEmoji:'🪄',
    invCats:['Close-up Props','Stage Props','Costume','Sound System','Backdrop','Other'],
    invPlaceholder:'e.g. levitation platform',
    profileTools:[
      { label:'Show Video',            sub:'Stage or close-up performance clip', icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Act Types',             sub:'Close-up, stage, mentalism…',    icon:<><circle cx="12" cy="12" r="10"/></> },
      { label:'Show Duration',         sub:'15 min / 30 min / 1 hour',       icon:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube',              icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['Close-up magic photos work better than text descriptions','Mention whether you work with kids, adults or corporate groups'],
    emptyGigMsg:'No shows logged yet — start tracking your magic bookings.',
  },
  'AV Setup': {
    isArtist:true, emoji:'📽️', term:'Job', terms:'Jobs', invLabel:'Equipment', invEmoji:'📽️',
    invCats:['Projector','LED Screen','PA Speaker','Amplifier','Mixer','Microphone','Laptop','HDMI / Cables','Truss / Stand','Generator','Other'],
    invPlaceholder:'e.g. Christie 12000L Projector',
    profileTools:[
      { label:'Setup Photos',          sub:'Past installations & setups',     icon:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
      { label:'Service List',          sub:'AV, LED wall, live streaming…',   icon:<><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/></> },
      { label:'Technical Specs',       sub:'Equipment brands & capacity',     icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
      { label:'Social Links',          sub:'Instagram, LinkedIn',             icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['Setup photos with crowd reaction build the most trust','List your PA wattage & screen sizes — clients ask every time'],
    emptyGigMsg:'No jobs logged yet — start tracking your AV installation bookings.',
  },
  // ── Vendors ──
  'Decorator': {
    isArtist:false, emoji:'🌸', term:'Order', terms:'Orders', invLabel:'Inventory', invEmoji:'🌺',
    invCats:['Flowers / Floral','Draping / Fabric','Balloons','LED Panels / Lights','Fairy Lights','Centrepieces','Furniture / Prop','Tools','Packaging','Other'],
    invPlaceholder:'e.g. Fairy light string (100m)',
    profileTools:[
      { label:'Portfolio / Theme Photos', sub:'Floral, balloon, luxury draping…', icon:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
      { label:'Style Tags',            sub:'Minimal, grand, traditional, fusion', icon:<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
      { label:'Occasion Specialties',  sub:'Wedding, corporate, birthdays…',  icon:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
      { label:'Social Links',          sub:'Instagram, Pinterest',             icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['Instagram photos drive 80% of decoration enquiries','Tag your themes (floral/balloon/draping) — clients search by style','Show a before/after setup to build trust'],
    emptyGigMsg:'No decoration orders yet — log your first setup to start tracking.',
  },
  'Caterer': {
    isArtist:false, emoji:'🍽️', term:'Order', terms:'Orders', invLabel:'Inventory', invEmoji:'🍲',
    invCats:['Utensils / Crockery','Chafing Dishes','Serving Equipment','Gas Cylinders','Disposable Packaging','Ingredients (Bulk)','Chilling Equipment','Other'],
    invPlaceholder:'e.g. Chafing dish set (10 pcs)',
    profileTools:[
      { label:'Menu / Food Photos',    sub:'Your signature dishes & spreads',  icon:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
      { label:'Cuisine Types',         sub:'North Indian, South Indian, Chinese, Continental…', icon:<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
      { label:'Dietary Options',       sub:'Veg, Non-Veg, Jain, Gluten-Free…', icon:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
      { label:'Serving Style',         sub:'Buffet, plated, live counters, home delivery', icon:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></> },
    ],
    quickTips:['Food photos get the most saves on WhatsApp — keep your best ones ready','Mention Jain / vegan options — it removes the biggest booking hesitation','Add your per-plate price range so clients don\'t need to call just to check'],
    emptyGigMsg:'No catering orders yet — log your first event to start tracking.',
  },
  'Photographer': {
    isArtist:false, emoji:'📷', term:'Shoot', terms:'Shoots', invLabel:'Gear', invEmoji:'📷',
    invCats:['Camera Body','Lens','Flash / Strobe','Tripod / Monopod','Gimbal','Backdrop','Editing PC / Laptop','Hard Drive','Bag / Case','Other'],
    invPlaceholder:'e.g. Sony A7 IV Camera Body',
    profileTools:[
      { label:'Portfolio / Gallery',   sub:'Best shots from recent events',   icon:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
      { label:'Shooting Style',        sub:'Candid, traditional, fine-art, photojournalism', icon:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></> },
      { label:'Package Options',       sub:'2hr / 4hr / Full-day / Album deals', icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
      { label:'Social Links',          sub:'Instagram, Facebook, website',     icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['Your portfolio is your business — keep it updated with recent work','Candid vs traditional is the #1 client question — state it clearly','Add your turnaround time for edited photos in your profile'],
    emptyGigMsg:'No shoots logged yet — start tracking your photography bookings.',
  },
  'Videographer': {
    isArtist:false, emoji:'🎬', term:'Shoot', terms:'Shoots', invLabel:'Gear', invEmoji:'🎬',
    invCats:['Camera Body','Cinema Lens','Gimbal / Stabilizer','Drone','Tripod','LED Light Panel','Hard Drive','Editing PC','Microphone','Other'],
    invPlaceholder:'e.g. DJI Mavic 3 Pro Drone',
    profileTools:[
      { label:'Highlight Reel',        sub:'1-2 min video of your best work',  icon:<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> },
      { label:'Editing Style',         sub:'Cinematic, documentary, highlight', icon:<><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.899L15 14M3 8h12v8H3z"/></> },
      { label:'Package Options',       sub:'Highlight video, full-day, drone add-on', icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
      { label:'Social Links',          sub:'Instagram, YouTube, Vimeo',        icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
    ],
    quickTips:['A 2-minute highlight reel is worth 100 photos — keep it current','State clearly if you offer drone — it\'s the most-asked question','Add your delivery timeline — clients want to know when they get the video'],
    emptyGigMsg:'No shoots logged yet — start tracking your videography bookings.',
  },
  // Default fallback for any unlisted type
  'default': {
    isArtist:false, emoji:'💼', term:'Order', terms:'Orders', invLabel:'Inventory', invEmoji:'📦',
    invCats:['Equipment','Materials','Tools','Supplies','Furniture','Other'],
    invPlaceholder:'e.g. item name',
    profileTools:[
      { label:'Portfolio / Photos',    sub:'Show your best work',             icon:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
      { label:'Services Offered',      sub:'What you do & specialise in',     icon:<><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/></> },
      { label:'Social Links',          sub:'Instagram, Facebook, website',    icon:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></> },
      { label:'Pricing Info',          sub:'Starting rates or package info',  icon:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
    ],
    quickTips:['Keep your profile photo updated — it builds trust fast','Add a portfolio link to show your work','Reply to enquiries within 1 hour for best conversion'],
    emptyGigMsg:'No orders yet — log your first booking to start tracking.',
  },
};

const BLANK_MILESTONE = { label: 'Advance', amount: '', dueDate: '', paid: false, paidDate: '' };
const MILESTONE_LABELS = ['Advance', '50% Pre-event', 'Final Payment', 'Custom'];
const EXPENSE_CATS = ['Materials', 'Labour', 'Transport', 'Equipment', 'Food', 'Other'];

// ── Invoice generator ──────────────────────────────────────────────────────────
function generateInvoice(order, vendorName) {
  const totalExpenses = (order.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalCollected = order.milestones?.length
    ? order.milestones.filter(m => m.paid).reduce((s, m) => s + (Number(m.amount) || 0), 0)
    : (Number(order.paidAmount) || 0);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice — ${order.clientName}</title>
<style>
  body{font-family:'Outfit',Arial,sans-serif;max-width:680px;margin:40px auto;padding:0 24px;color:#2C1A0E;background:#fff}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #C47A2E;margin-bottom:24px}
  .brand{font-size:22px;font-weight:800;color:#C47A2E}
  .brand-sub{font-size:12px;color:#9B7450;margin-top:2px}
  .inv-meta{text-align:right;font-size:13px;color:#6B4A2A}
  h3{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9B7450;margin:20px 0 8px;border-bottom:1px solid #f0e8dc;padding-bottom:4px}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f8f2ea;font-size:13px}
  .row.bold{font-weight:700;font-size:15px;border-bottom:2px solid #C47A2E;margin-top:4px}
  .pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
  .paid{background:#DCFCE7;color:#166534}.partial{background:#EDE9FE;color:#4C1D95}.pending{background:#FEF9C3;color:#92400E}
  .profit-box{background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:14px 18px;margin-top:16px;display:flex;justify-content:space-between;align-items:center}
  footer{margin-top:40px;font-size:11px;color:#c0a880;text-align:center;border-top:1px solid #f0e8dc;padding-top:16px}
  @media print{body{margin:20px}}
</style></head><body>
<div class="hdr">
  <div><div class="brand">Tendr</div><div class="brand-sub">${vendorName}</div></div>
  <div class="inv-meta">
    <div style="font-size:18px;font-weight:800;color:#2C1A0E">INVOICE</div>
    <div>Date: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
    <div style="margin-top:4px">
      <span class="pill ${totalCollected >= Number(order.amount) ? 'paid' : totalCollected > 0 ? 'partial' : 'pending'}">${totalCollected >= Number(order.amount) ? 'PAID' : totalCollected > 0 ? 'PARTIAL' : 'PENDING'}</span>
    </div>
  </div>
</div>

<h3>Bill To</h3>
<div style="font-size:14px;font-weight:700">${order.clientName}</div>
${order.clientPhone ? `<div style="font-size:13px;color:#9B7450">📞 ${order.clientPhone}</div>` : ''}
${order.clientEmail ? `<div style="font-size:13px;color:#9B7450">✉ ${order.clientEmail}</div>` : ''}

<h3>Event Details</h3>
<div class="row"><span>Event Type</span><span>${order.eventType || '—'}</span></div>
${order.eventDate ? `<div class="row"><span>Event Date</span><span>${new Date(order.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></div>` : ''}
${order.startTime ? `<div class="row"><span>Performance Time</span><span>${order.startTime}${order.endTime ? ` – ${order.endTime}` : ''}</span></div>` : ''}
${order.equipment?.length ? `<div class="row"><span>Equipment</span><span style="max-width:60%;text-align:right">${order.equipment.filter(Boolean).join(', ')}</span></div>` : ''}
${order.notes ? `<div class="row"><span>Notes</span><span style="max-width:60%;text-align:right">${order.notes}</span></div>` : ''}

<h3>Payment Schedule</h3>
${order.milestones?.length ? order.milestones.map(m => `
<div class="row">
  <span>${m.label}${m.dueDate ? ` <span style="font-size:11px;color:#9B7450">(due ${new Date(m.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})})</span>` : ''}</span>
  <span style="display:flex;align-items:center;gap:8px">₹${Number(m.amount).toLocaleString('en-IN')} <span class="pill ${m.paid ? 'paid' : 'pending'}">${m.paid ? '✓ Paid' : 'Pending'}</span></span>
</div>`).join('') : `
<div class="row"><span>Total Amount</span><span>₹${Number(order.amount||0).toLocaleString('en-IN')}</span></div>
<div class="row"><span>Amount Paid</span><span>₹${Number(order.paidAmount||0).toLocaleString('en-IN')}</span></div>`}
<div class="row bold"><span>Total</span><span>₹${Number(order.amount||0).toLocaleString('en-IN')}</span></div>
<div class="row bold" style="color:#16A34A"><span>Collected</span><span>₹${totalCollected.toLocaleString('en-IN')}</span></div>

${order.expenses?.length ? `
<h3>Expenses (internal)</h3>
${order.expenses.map(e => `<div class="row"><span>${e.category} — ${e.description||''}</span><span>₹${Number(e.amount).toLocaleString('en-IN')}</span></div>`).join('')}
<div class="row bold"><span>Total Expenses</span><span>₹${totalExpenses.toLocaleString('en-IN')}</span></div>
<div class="profit-box"><span style="font-weight:700;color:#166534">Net Profit on this event</span><span style="font-size:20px;font-weight:800;color:#16A34A">₹${(totalCollected - totalExpenses).toLocaleString('en-IN')}</span></div>
` : ''}

<footer>Generated by Tendr · tendr.in · Event Planning Platform · Delhi NCR</footer>
</body></html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

// ── Quote / Estimate generator ─────────────────────────────────────────────────
function generateQuote(quote, vendorName) {
  const items = (quote.items || []).filter(i => i.desc || Number(i.rate));
  const subtotal = items.reduce((s, i) => s + (Number(i.qty)||1) * (Number(i.rate)||0), 0);
  const discount = Number(quote.discount) || 0;
  const total = subtotal - discount;
  const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + 7);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Quote — ${quote.clientName}</title>
<style>
  body{font-family:'Outfit',Arial,sans-serif;max-width:680px;margin:40px auto;padding:0 24px;color:#2C1A0E;background:#fff}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid #C47A2E;margin-bottom:24px}
  .brand{font-size:22px;font-weight:800;color:#C47A2E}.brand-sub{font-size:12px;color:#9B7450;margin-top:2px}
  .inv-meta{text-align:right;font-size:13px;color:#6B4A2A}
  h3{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9B7450;margin:20px 0 8px;border-bottom:1px solid #f0e8dc;padding-bottom:4px}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f8f2ea;font-size:13px}
  .row.bold{font-weight:700;font-size:15px;border-bottom:2px solid #C47A2E}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;font-size:11px;font-weight:700;color:#9B7450;text-transform:uppercase;letter-spacing:.08em;padding:6px 0;border-bottom:1.5px solid #e8ddd0}
  td{padding:9px 0;border-bottom:1px solid #f8f2ea;vertical-align:top}
  .total-box{background:#FFFCF5;border:1.5px solid #C47A2E;border-radius:10px;padding:14px 18px;margin-top:16px}
  footer{margin-top:40px;font-size:11px;color:#c0a880;text-align:center;border-top:1px solid #f0e8dc;padding-top:16px}
  @media print{body{margin:20px}}
</style></head><body>
<div class="hdr">
  <div><div class="brand">Tendr</div><div class="brand-sub">${vendorName}</div></div>
  <div class="inv-meta">
    <div style="font-size:18px;font-weight:800;color:#2C1A0E">ESTIMATE</div>
    <div>Date: ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
    <div style="margin-top:4px"><span style="padding:3px 10px;border-radius:20px;background:#FEF9C3;color:#92400E;font-size:11px;font-weight:700">QUOTE</span></div>
  </div>
</div>
<h3>Prepared For</h3>
<div style="font-size:14px;font-weight:700">${quote.clientName}</div>
${quote.clientPhone ? `<div style="font-size:13px;color:#9B7450">📞 ${quote.clientPhone}</div>` : ''}
${(quote.eventType||quote.eventDate) ? `<h3>Event Details</h3>${quote.eventType?`<div class="row"><span>Event Type</span><span>${quote.eventType}</span></div>`:''}${quote.eventDate?`<div class="row"><span>Event Date</span><span>${new Date(quote.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></div>`:''}` : ''}
<h3>Services & Pricing</h3>
<table><thead><tr><th>Description</th><th style="text-align:center;width:60px">Qty</th><th style="text-align:right;width:100px">Rate (₹)</th><th style="text-align:right;width:110px">Amount (₹)</th></tr></thead><tbody>
${items.map(i=>`<tr><td>${i.desc||'—'}</td><td style="text-align:center">${Number(i.qty)||1}</td><td style="text-align:right">${(Number(i.rate)||0).toLocaleString('en-IN')}</td><td style="text-align:right;font-weight:700">${((Number(i.qty)||1)*(Number(i.rate)||0)).toLocaleString('en-IN')}</td></tr>`).join('')}
</tbody></table>
<div class="total-box">
  <div class="row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
  ${discount>0?`<div class="row" style="color:#16A34A"><span>Discount</span><span>−₹${discount.toLocaleString('en-IN')}</span></div>`:''}
  <div class="row bold"><span>Total Estimate</span><span style="color:#C47A2E">₹${total.toLocaleString('en-IN')}</span></div>
</div>
<div style="font-size:12px;color:#9B7450;text-align:right;margin-top:6px">Valid until: ${validUntil.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
${quote.notes?`<h3>Notes</h3><div style="font-size:13px;color:#6B4A2A;line-height:1.6">${quote.notes}</div>`:''}
<footer>This is an estimate only · Final pricing may vary · Generated by Tendr · tendr.in</footer>
</body></html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

function OrderModal({ initial, onSave, onClose, saving, existingClients = [], serviceType = '' }) {
  const [form, setForm] = useState(() => ({ ...BLANK_FORM, ...(initial || {}), milestones: initial?.milestones || [], expenses: initial?.expenses || [], equipment: initial?.equipment || [], reminders: initial?.reminders || [] }));
  const isEntertainment = ENTERTAINMENT_TYPES.includes(serviceType);
  const [modalTab, setModalTab] = useState('details');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const phoneDigits = (form.clientPhone || '').replace(/\D/g, '');
  const matchedClient = !initial && phoneDigits.length >= 10
    ? existingClients.find(c => c.clientPhone?.replace(/\D/g, '') === phoneDigits)
    : null;

  // Auto-compute paidAmount from milestones
  const milestonePaid = form.milestones.filter(m => m.paid).reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const milestoneTotal = form.milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const useMilestones = form.milestones.length > 0;
  const effectivePaid = useMilestones ? milestonePaid : (Number(form.paidAmount) || 0);
  const effectiveTotal = useMilestones ? milestoneTotal : (Number(form.amount) || 0);
  const payStatus = effectiveTotal > 0 && effectivePaid >= effectiveTotal ? 'Paid' : effectivePaid > 0 ? 'Partial' : 'Pending';

  const totalExpenses = form.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const profit = effectivePaid - totalExpenses;

  const addMilestone = () => set('milestones', [...form.milestones, { ...BLANK_MILESTONE, label: MILESTONE_LABELS[Math.min(form.milestones.length, 2)] }]);
  const updateMilestone = (i, k, v) => set('milestones', form.milestones.map((m, idx) => idx === i ? { ...m, [k]: v } : m));
  const removeMilestone = (i) => set('milestones', form.milestones.filter((_, idx) => idx !== i));

  const addExpense = () => set('expenses', [...form.expenses, { category: 'Materials', description: '', amount: '' }]);
  const updateExpense = (i, k, v) => set('expenses', form.expenses.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const removeExpense = (i) => set('expenses', form.expenses.filter((_, idx) => idx !== i));

  const addEquipItem    = () => set('equipment', [...(form.equipment || []), '']);
  const updateEquipItem = (i, v) => set('equipment', (form.equipment || []).map((it, idx) => idx === i ? v : it));
  const removeEquipItem = (i)   => set('equipment', (form.equipment || []).filter((_, idx) => idx !== i));

  const inp = (style) => ({ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid rgba(196,122,46,0.25)', fontFamily: font, fontSize: 13.5, color: ink, outline: 'none', background: '#FFFCF5', boxSizing: 'border-box', ...style });
  const lbl = { display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B3A1F', marginBottom: 4 };
  const row = { display: 'flex', gap: 12 };
  const half = { flex: 1, minWidth: 0 };

  // Sync milestoneTotal → form.amount and milestonePaid → form.paidAmount for backend
  const formToSave = useMilestones
    ? { ...form, amount: milestoneTotal || form.amount, paidAmount: milestonePaid }
    : form;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(28,9,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 540, background: cream, borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.22)', fontFamily: font, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '16px 22px 0', borderBottom: '1px solid rgba(196,122,46,0.12)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: ink }}>{initial ? 'Edit Order' : 'Add Outside Order'}</div>
              <div style={{ fontSize: 12, color: '#9B7450', marginTop: 1 }}>Log a booking received outside Tendr</div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(196,122,46,0.1)', border: 'none', cursor: 'pointer', fontSize: 17, color: '#9B7450', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          {/* Modal tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {[['details','Details'], ['payments','Payments'], ['expenses','Expenses'], ['reminders','Reminders']].map(([key, label]) => (
              <button key={key} onClick={() => setModalTab(key)}
                style={{ padding: '7px 14px', border: 'none', background: 'transparent', fontFamily: font, fontSize: 12.5, fontWeight: modalTab === key ? 700 : 500, color: modalTab === key ? gold : '#9B7450', cursor: 'pointer', borderBottom: modalTab === key ? `2.5px solid ${gold}` : '2.5px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {label}
                {key === 'payments' && form.milestones.length > 0 && <span style={{ marginLeft: 5, fontSize: 11, background: 'rgba(196,122,46,0.12)', color: gold, borderRadius: 10, padding: '1px 6px' }}>{form.milestones.length}</span>}
                {key === 'expenses' && form.expenses.length > 0 && <span style={{ marginLeft: 5, fontSize: 11, background: 'rgba(220,38,38,0.1)', color: '#DC2626', borderRadius: 10, padding: '1px 6px' }}>{form.expenses.length}</span>}
                {key === 'reminders' && (form.reminders||[]).length > 0 && <span style={{ marginLeft: 5, fontSize: 11, background: 'rgba(59,130,246,0.12)', color: '#2563EB', borderRadius: 10, padding: '1px 6px' }}>{(form.reminders||[]).length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div style={{ overflowY: 'auto', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>

          {/* ── Details tab ── */}
          {modalTab === 'details' && <>
            <div>
              <label style={lbl}>Where did this booking come from?</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SOURCES.map(s => (
                  <button key={s} onClick={() => set('source', s)}
                    style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 600, fontFamily: font, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                      borderColor: form.source === s ? gold : 'rgba(196,122,46,0.22)',
                      background: form.source === s ? gold : 'transparent',
                      color: form.source === s ? '#fff' : '#9B7450' }}>
                    {SOURCE_EMOJI[s]} {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={row}>
              <div style={half}>
                <label style={lbl}>Client Name *</label>
                <input style={inp()} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Priya Sharma" />
              </div>
              <div style={half}>
                <label style={lbl}>Phone / WhatsApp</label>
                <input style={inp()} value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="10-digit number" type="tel" />
              </div>
            </div>

            {matchedClient && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'rgba(196,122,46,0.07)', border: '1.5px solid rgba(196,122,46,0.25)' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: ink }}>Existing client: {matchedClient.clientName}</div>
                  <div style={{ fontSize: 11, color: '#9B7450' }}>Fill their name automatically?</div>
                </div>
                <button onClick={() => { set('clientName', matchedClient.clientName); if (matchedClient.clientEmail) set('clientEmail', matchedClient.clientEmail); }}
                  style={{ padding: '5px 14px', borderRadius: 8, border: 'none', background: gold, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Use
                </button>
              </div>
            )}

            <div style={row}>
              <div style={half}>
                <label style={lbl}>Event Type</label>
                <select style={inp()} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                  <option value="">Select event</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={half}>
                <label style={lbl}>Event Date</label>
                <input style={inp()} type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
              </div>
            </div>

            {isEntertainment && (
              <div style={row}>
                <div style={half}>
                  <label style={lbl}>Performance Start</label>
                  <input style={inp()} type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
                </div>
                <div style={half}>
                  <label style={lbl}>Performance End</label>
                  <input style={inp()} type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
                </div>
              </div>
            )}

            {isEntertainment && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={lbl}>Equipment for this Gig</label>
                  <button onClick={addEquipItem}
                    style={{ padding: '3px 10px', borderRadius: 7, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                    + Add
                  </button>
                </div>
                {(form.equipment || []).length === 0 ? (
                  <div style={{ fontSize: 12, color: '#9B7450', fontStyle: 'italic', padding: '4px 0' }}>e.g. main speaker, lighting rig, DJ console, wireless mic</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(form.equipment || []).map((it, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6 }}>
                        <input value={it} onChange={e => updateEquipItem(i, e.target.value)}
                          placeholder={`Item ${i + 1} — e.g. Speaker`}
                          style={{ flex: 1, ...inp(), padding: '7px 10px', fontSize: 12.5 }} />
                        <button onClick={() => removeEquipItem(i)}
                          style={{ width: 28, height: 34, borderRadius: 7, border: '1px solid rgba(220,38,38,0.3)', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!useMilestones && (
              <div style={row}>
                <div style={half}>
                  <label style={lbl}>Total Amount (₹)</label>
                  <input style={inp()} type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
                </div>
                <div style={half}>
                  <label style={lbl}>Paid So Far (₹)</label>
                  <input style={inp()} type="number" min="0" value={form.paidAmount} onChange={e => set('paidAmount', e.target.value)} placeholder="0" />
                </div>
              </div>
            )}
            {useMilestones && (
              <div style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(196,122,46,0.06)', border: '1px solid rgba(196,122,46,0.15)', fontSize: 12.5, color: '#9B7450' }}>
                Payment split across {form.milestones.length} milestone{form.milestones.length > 1 ? 's' : ''} · ₹{milestonePaid.toLocaleString('en-IN')} of ₹{milestoneTotal.toLocaleString('en-IN')} collected → <button onClick={() => setModalTab('payments')} style={{ background: 'none', border: 'none', color: gold, fontWeight: 700, cursor: 'pointer', fontFamily: font, padding: 0 }}>Edit →</button>
              </div>
            )}

            {(effectiveTotal > 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: 'rgba(196,122,46,0.06)', border: '1px solid rgba(196,122,46,0.15)' }}>
                <span style={{ fontSize: 12, color: '#9B7450' }}>Payment:</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: PAY_COLOR[payStatus] }}>{payStatus}</span>
                <span style={{ fontSize: 11, color: '#9B7450' }}>(₹{effectivePaid.toLocaleString('en-IN')} / ₹{effectiveTotal.toLocaleString('en-IN')})</span>
              </div>
            )}

            <div>
              <label style={lbl}>Status</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {STATUSES.map(s => {
                  const c = STATUS_COLOR[s];
                  const active = form.status === s;
                  return (
                    <button key={s} onClick={() => set('status', s)}
                      style={{ flex: 1, padding: '7px 4px', borderRadius: 9, fontSize: 12, fontWeight: 700, fontFamily: font, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                        borderColor: active ? c.dot : 'rgba(196,122,46,0.15)',
                        background: active ? c.bg : 'transparent',
                        color: active ? c.color : '#9B7450' }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={lbl}>Notes (optional)</label>
              <textarea style={{ ...inp(), height: 72, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Theme preference, venue, special requests…" />
            </div>
          </>}

          {/* ── Payments tab ── */}
          {modalTab === 'payments' && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>Payment Milestones</div>
              <button onClick={addMilestone}
                style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                + Add Milestone
              </button>
            </div>

            {form.milestones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9B7450', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>💳</div>
                <div style={{ marginBottom: 4 }}>No milestones yet</div>
                <div style={{ fontSize: 12 }}>Split your payment into advance, pre-event, and final installments</div>
                <button onClick={addMilestone} style={{ marginTop: 12, padding: '7px 18px', borderRadius: 9, border: `1.5px solid ${gold}`, background: 'transparent', color: gold, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                  + Add First Milestone
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {form.milestones.map((m, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${m.paid ? 'rgba(22,163,74,0.3)' : 'rgba(196,122,46,0.2)'}`, background: m.paid ? 'rgba(22,163,74,0.04)' : '#FFFCF5', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <select value={m.label} onChange={e => updateMilestone(i, 'label', e.target.value)}
                        style={{ flex: 1, ...inp(), padding: '7px 10px', fontSize: 12.5 }}>
                        {MILESTONE_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <input type="number" min="0" placeholder="Amount ₹" value={m.amount} onChange={e => updateMilestone(i, 'amount', e.target.value)}
                        style={{ width: 110, ...inp(), padding: '7px 10px', fontSize: 12.5 }} />
                      <button onClick={() => removeMilestone(i)}
                        style={{ width: 28, height: 32, borderRadius: 7, border: '1px solid rgba(220,38,38,0.3)', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontSize: 10.5, color: '#9B7450', marginBottom: 3 }}>Due date</div>
                        <input type="date" value={m.dueDate} onChange={e => updateMilestone(i, 'dueDate', e.target.value)} style={{ width: '100%', ...inp(), padding: '6px 10px', fontSize: 12 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16 }}>
                        <button onClick={() => updateMilestone(i, 'paid', !m.paid)}
                          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${m.paid ? '#16A34A' : 'rgba(196,122,46,0.3)'}`, background: m.paid ? 'rgba(22,163,74,0.1)' : 'transparent', color: m.paid ? '#16A34A' : '#9B7450', fontFamily: font, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: m.paid ? '#16A34A' : 'transparent', border: `2px solid ${m.paid ? '#16A34A' : '#9B7450'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {m.paid && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          {m.paid ? 'Received' : 'Mark Received'}
                        </button>
                        {m.paid && m.amount && (
                          <a href={`https://wa.me/91${(form.clientPhone||'').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${form.clientName}, thank you for the ${m.label} payment of ₹${Number(m.amount).toLocaleString('en-IN')}! 🙏`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11.5, color: '#25D366', fontWeight: 700, textDecoration: 'none' }}>
                            WhatsApp ✓
                          </a>
                        )}
                        {!m.paid && m.amount && form.clientPhone && (
                          <a href={`https://wa.me/91${(form.clientPhone||'').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${form.clientName}, gentle reminder — ${m.label} of ₹${Number(m.amount).toLocaleString('en-IN')} is due${m.dueDate ? ` on ${new Date(m.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}` : ''}. Please arrange at your earliest. Thank you! 🙏`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11.5, color: '#D97706', fontWeight: 700, textDecoration: 'none' }}>
                            Remind
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(196,122,46,0.06)', border: '1px solid rgba(196,122,46,0.12)', fontSize: 13 }}>
                  <div><span style={{ color: '#9B7450' }}>Total: </span><strong>₹{milestoneTotal.toLocaleString('en-IN')}</strong></div>
                  <div><span style={{ color: '#9B7450' }}>Collected: </span><strong style={{ color: '#16A34A' }}>₹{milestonePaid.toLocaleString('en-IN')}</strong></div>
                  <div><span style={{ color: '#9B7450' }}>Pending: </span><strong style={{ color: '#D97706' }}>₹{(milestoneTotal - milestonePaid).toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
            )}
          </>}

          {/* ── Expenses tab ── */}
          {modalTab === 'expenses' && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>Event Expenses</div>
              <button onClick={addExpense}
                style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                + Add Expense
              </button>
            </div>

            {form.expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9B7450', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
                <div style={{ marginBottom: 4 }}>No expenses yet</div>
                <div style={{ fontSize: 12 }}>Track materials, labour, transport and other costs to see your actual profit</div>
                <button onClick={addExpense} style={{ marginTop: 12, padding: '7px 18px', borderRadius: 9, border: '1.5px solid #DC2626', background: 'transparent', color: '#DC2626', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                  + Add First Expense
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.expenses.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={e.category} onChange={ev => updateExpense(i, 'category', ev.target.value)}
                      style={{ width: 110, ...inp(), padding: '7px 8px', fontSize: 12, flexShrink: 0 }}>
                      {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={e.description} onChange={ev => updateExpense(i, 'description', ev.target.value)}
                      placeholder="Description" style={{ flex: 1, ...inp(), padding: '7px 10px', fontSize: 12.5 }} />
                    <input type="number" min="0" value={e.amount} onChange={ev => updateExpense(i, 'amount', ev.target.value)}
                      placeholder="₹" style={{ width: 90, ...inp(), padding: '7px 8px', fontSize: 12.5, flexShrink: 0 }} />
                    <button onClick={() => removeExpense(i)}
                      style={{ width: 28, height: 32, borderRadius: 7, border: '1px solid rgba(220,38,38,0.3)', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12, background: profit >= 0 ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)', border: `1.5px solid ${profit >= 0 ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`, marginTop: 4 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Revenue</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>₹{effectivePaid.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: 20, color: '#9B7450', alignSelf: 'center' }}>−</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expenses</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#DC2626' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: 20, color: '#9B7450', alignSelf: 'center' }}>=</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Net Profit</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: profit >= 0 ? '#16A34A' : '#DC2626' }}>₹{profit.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            )}
          </>}

          {/* ── Reminders tab ── */}
          {modalTab === 'reminders' && <>
            <div style={{ fontSize: 13, color: '#9B7450', marginBottom: 6, lineHeight: 1.5 }}>
              Choose when you want to be reminded about this {isEntertainment ? 'gig' : 'booking'}. Reminders appear on your dashboard home screen.
            </div>

            {!form.eventDate && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(217,119,6,0.07)', border: '1.5px solid rgba(217,119,6,0.2)', fontSize: 12.5, color: '#92400E' }}>
                Set an event date in the Details tab first — reminders are calculated from the event date.
              </div>
            )}

            {form.eventDate && (
              <>
                {/* Preset options */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#6B3A1F', marginBottom: 8 }}>Quick options</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {REMINDER_PRESETS.map(preset => {
                      const reminderDate = new Date(form.eventDate);
                      reminderDate.setDate(reminderDate.getDate() - preset.days);
                      const alreadySet = (form.reminders||[]).some(r => r.days === preset.days);
                      const isPast = reminderDate < new Date() && preset.days > 0;
                      return (
                        <button key={preset.days} onClick={() => {
                          const current = form.reminders || [];
                          if (alreadySet) {
                            set('reminders', current.filter(r => r.days !== preset.days));
                          } else if (!isPast) {
                            set('reminders', [...current, { days: preset.days, label: preset.label, reminderDate: reminderDate.toISOString().split('T')[0] }]);
                          }
                        }}
                          disabled={isPast && !alreadySet}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 11, border: `1.5px solid ${alreadySet ? '#2563EB' : 'rgba(196,122,46,0.2)'}`, background: alreadySet ? 'rgba(59,130,246,0.07)' : '#FFFCF5', cursor: isPast && !alreadySet ? 'default' : 'pointer', opacity: isPast && !alreadySet ? 0.45 : 1, fontFamily: font, transition: 'all 0.15s' }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: alreadySet ? '#2563EB' : ink }}>{preset.label}</div>
                            <div style={{ fontSize: 11, color: '#9B7450', marginTop: 2 }}>
                              {isPast ? 'Date already passed' : reminderDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${alreadySet ? '#2563EB' : 'rgba(196,122,46,0.3)'}`, background: alreadySet ? '#2563EB' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {alreadySet && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom days input */}
                <div style={{ paddingTop: 14, borderTop: '1px solid rgba(196,122,46,0.1)' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#6B3A1F', marginBottom: 8 }}>Custom reminder</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="number" min="0" max="365" id="customReminderDays" placeholder="e.g. 10"
                      style={{ width: 90, padding: '9px 12px', borderRadius: 9, border: '1.5px solid rgba(196,122,46,0.25)', fontFamily: font, fontSize: 13.5, color: ink, outline: 'none', background: '#FFFCF5', boxSizing: 'border-box' }} />
                    <span style={{ fontSize: 13, color: '#9B7450' }}>days before the event</span>
                    <button onClick={() => {
                      const input = document.getElementById('customReminderDays');
                      const d = parseInt(input?.value, 10);
                      if (isNaN(d) || d < 0) return;
                      const reminderDate = new Date(form.eventDate);
                      reminderDate.setDate(reminderDate.getDate() - d);
                      const alreadySet = (form.reminders||[]).some(r => r.days === d);
                      if (!alreadySet) {
                        set('reminders', [...(form.reminders||[]), { days: d, label: `${d === 0 ? 'Day of event' : `${d} day${d===1?'':'s'} before`}`, reminderDate: reminderDate.toISOString().split('T')[0] }]);
                        if (input) input.value = '';
                      }
                    }} style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontFamily: font, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Add
                    </button>
                  </div>
                </div>

                {/* Active reminders summary */}
                {(form.reminders||[]).length > 0 && (
                  <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 11, background: 'rgba(59,130,246,0.06)', border: '1.5px solid rgba(59,130,246,0.15)' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2563EB', marginBottom: 8 }}>{(form.reminders||[]).length} reminder{(form.reminders||[]).length===1?'':'s'} set</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {[...(form.reminders||[])].sort((a,b) => b.days-a.days).map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: ink }}>
                          <span>🔔 {r.label} — {new Date(r.reminderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <button onClick={() => set('reminders', (form.reminders||[]).filter((_,idx) => idx !== i))}
                            style={{ background: 'none', border: 'none', color: '#9B7450', cursor: 'pointer', fontSize: 15, padding: '0 4px', lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 22px 18px', borderTop: '1px solid rgba(196,122,46,0.1)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.25)', background: 'transparent', color: '#9B7450', fontFamily: font, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave(formToSave)} disabled={saving || !form.clientName.trim()}
            style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontFamily: font, fontSize: 13.5, fontWeight: 800, cursor: saving || !form.clientName.trim() ? 'default' : 'pointer', opacity: saving || !form.clientName.trim() ? 0.6 : 1, boxShadow: '0 3px 12px rgba(196,122,46,0.35)' }}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : '+ Add Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quote Modal ───────────────────────────────────────────────────────────────
function QuoteModal({ initial, onSave, onClose }) {
  const BLANK = { clientName:'', clientPhone:'', eventType:'', eventDate:'', items:[{ desc:'', qty:1, rate:'' }], discount:'', notes:'', status:'Draft' };
  const [form, setForm] = useState(() => ({ ...BLANK, ...(initial||{}) }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { desc:'', qty:1, rate:'' }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const subtotal = form.items.reduce((s, i) => s + (Number(i.qty)||1) * (Number(i.rate)||0), 0);
  const discount = Number(form.discount) || 0;
  const total = subtotal - discount;
  const inp = { width:'100%', padding:'8px 11px', borderRadius:9, border:'1.5px solid rgba(196,122,46,0.25)', fontFamily:font, fontSize:13, color:ink, outline:'none', background:'#FFFCF5', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#6B3A1F', marginBottom:3 };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(28,9,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div style={{ width:'100%', maxWidth:520, background:cream, borderRadius:20, boxShadow:'0 24px 60px rgba(0,0,0,0.22)', fontFamily:font, maxHeight:'92vh', display:'flex', flexDirection:'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:'16px 20px 14px', borderBottom:'1px solid rgba(196,122,46,0.12)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:ink }}>New Quote / Estimate</div>
            <div style={{ fontSize:11.5, color:'#9B7450', marginTop:1 }}>Share a price estimate with your client before booking</div>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(196,122,46,0.1)', border:'none', cursor:'pointer', fontSize:16, color:'#9B7450' }}>×</button>
        </div>
        <div style={{ overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:11, flex:1 }}>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}><label style={lbl}>Client Name *</label><input style={inp} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Rahul Gupta" autoFocus /></div>
            <div style={{ flex:1 }}><label style={lbl}>Phone</label><input style={inp} type="tel" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="10-digit" /></div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={lbl}>Event Type</label>
              <select style={inp} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                <option value="">Select</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}><label style={lbl}>Event Date</label><input style={inp} type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} /></div>
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <label style={{ ...lbl, marginBottom:0 }}>Services / Line Items</label>
              <button onClick={addItem} style={{ padding:'4px 11px', borderRadius:7, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>+ Add Item</button>
            </div>
            <div style={{ border:'1.5px solid rgba(196,122,46,0.15)', borderRadius:10, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 52px 90px 26px', padding:'7px 10px', background:'rgba(196,122,46,0.05)', fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                <span>Description</span><span style={{ textAlign:'center' }}>Qty</span><span style={{ textAlign:'right' }}>Rate (₹)</span><span />
              </div>
              {form.items.map((it, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 52px 90px 26px', gap:4, padding:'7px 10px', borderTop:'1px solid rgba(196,122,46,0.08)', alignItems:'center' }}>
                  <input value={it.desc} onChange={e => setItem(i,'desc',e.target.value)} placeholder={`Item ${i+1}`}
                    style={{ padding:'6px 8px', borderRadius:7, border:'1.5px solid rgba(196,122,46,0.2)', fontFamily:font, fontSize:12.5, color:ink, outline:'none', background:'#FFFCF5', width:'100%', boxSizing:'border-box' }} />
                  <input type="number" min="1" value={it.qty} onChange={e => setItem(i,'qty',e.target.value)}
                    style={{ padding:'6px 4px', borderRadius:7, border:'1.5px solid rgba(196,122,46,0.2)', fontFamily:font, fontSize:12.5, color:ink, outline:'none', background:'#FFFCF5', width:'100%', boxSizing:'border-box', textAlign:'center' }} />
                  <input type="number" min="0" value={it.rate} onChange={e => setItem(i,'rate',e.target.value)} placeholder="0"
                    style={{ padding:'6px 8px', borderRadius:7, border:'1.5px solid rgba(196,122,46,0.2)', fontFamily:font, fontSize:12.5, color:ink, outline:'none', background:'#FFFCF5', width:'100%', boxSizing:'border-box', textAlign:'right' }} />
                  <button onClick={() => removeItem(i)} disabled={form.items.length === 1}
                    style={{ width:22, height:22, borderRadius:5, border:'1px solid rgba(220,38,38,0.2)', background:'transparent', color:'#DC2626', cursor:form.items.length===1?'default':'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', opacity:form.items.length===1?0.3:1 }}>×</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <div style={{ flex:1 }}><label style={lbl}>Discount (₹)</label><input style={inp} type="number" min="0" value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="0" /></div>
            <div style={{ flex:1, padding:'9px 14px', borderRadius:9, background:'rgba(196,122,46,0.07)', border:'1px solid rgba(196,122,46,0.15)', textAlign:'right' }}>
              <div style={{ fontSize:10, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>Total Estimate</div>
              <div style={{ fontSize:20, fontWeight:800, color:gold }}>₹{total.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div><label style={lbl}>Notes (optional)</label><textarea style={{ ...inp, height:60, resize:'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Payment terms, inclusions, validity, advance required…" /></div>
        </div>
        <div style={{ padding:'12px 20px 16px', borderTop:'1px solid rgba(196,122,46,0.1)', display:'flex', gap:10, flexShrink:0 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:10, border:'1.5px solid rgba(196,122,46,0.25)', background:'transparent', color:'#9B7450', fontFamily:font, fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.clientName.trim()}
            style={{ flex:2, padding:'10px', borderRadius:10, border:'none', background:form.clientName.trim()?`linear-gradient(135deg,${gold},${goldLt})`:'rgba(196,122,46,0.2)', color:'#fff', fontFamily:font, fontSize:13.5, fontWeight:800, cursor:form.clientName.trim()?'pointer':'default', boxShadow:form.clientName.trim()?'0 3px 12px rgba(196,122,46,0.3)':'none' }}>
            Save Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking card (Tendr) ───────────────────────────────────────────────────────
function BookingCard({ b }) {
  const sc = STATUS_COLOR[b.status] || STATUS_COLOR.Pending;
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(196,122,46,0.12)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${gold},${goldLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
        {b.customerName?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: ink, fontSize: 14 }}>{b.customerName || 'Customer'}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: sc.bg, color: sc.color }}>{b.status}</span>
        </div>
        <div style={{ fontSize: 12, color: '#9B7450', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
          {b.eventType && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>)}{b.eventType}</span>}
          {b.eventDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)}{new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
          {b.guestCount && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>)}{b.guestCount}</span>}
        </div>
      </div>
      {b.amount != null && <div style={{ fontWeight: 800, color: ink, fontSize: 15, flexShrink: 0 }}>₹{b.amount.toLocaleString('en-IN')}</div>}
    </div>
  );
}

// ── Outside order card ─────────────────────────────────────────────────────────
function OutsideOrderCard({ order, onEdit, onDelete, onStatus, onRequestPayment, vendorName, profileUrl }) {
  const sc = STATUS_COLOR[order.status] || STATUS_COLOR.Pending;
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const milestones = order.milestones || [];
  const expenses = order.expenses || [];
  const milestonePaid = milestones.filter(m => m.paid).reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const milestoneTotal = milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const useMilestones = milestones.length > 0;
  const effectivePaid = useMilestones ? milestonePaid : (Number(order.paidAmount) || 0);
  const effectiveTotal = useMilestones ? milestoneTotal : (Number(order.amount) || 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const cardProfit = effectivePaid - totalExpenses;
  const hasPerformanceDetails = !!(order.startTime || order.endTime || (order.equipment?.filter(Boolean).length > 0));
  const hasDetails = milestones.length > 0 || expenses.length > 0 || hasPerformanceDetails;

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(196,122,46,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Source badge */}
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(196,122,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7450', flexShrink: 0 }}>
            {SOURCE_ICON[order.source] || dsic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>)}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: ink, fontSize: 14 }}>{order.clientName}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: sc.bg, color: sc.color }}>{order.status}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(196,122,46,0.08)', color: '#9B7450' }}>{order.source}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9B7450', marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
              {order.clientPhone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>)}{order.clientPhone}</span>}
              {order.eventType   && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>)}{order.eventType}</span>}
              {order.eventDate   && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)}{new Date(order.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
            {order.notes && <div style={{ fontSize: 12, color: '#9B7450', marginTop: 4, fontStyle: 'italic' }}>"{order.notes}"</div>}
          </div>

          {/* Amount + menu */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            {effectiveTotal > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: ink, fontSize: 15 }}>₹{effectiveTotal.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: effectivePaid >= effectiveTotal ? '#16A34A' : effectivePaid > 0 ? '#D97706' : '#9B7450' }}>
                  {effectivePaid >= effectiveTotal ? 'Paid' : effectivePaid > 0 ? 'Partial' : 'Pending'}
                </div>
                {effectivePaid > 0 && effectivePaid < effectiveTotal && (
                  <div style={{ fontSize: 10, color: '#9B7450' }}>₹{effectivePaid.toLocaleString('en-IN')} paid</div>
                )}
              </div>
            )}
            {/* Kebab menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(m => !m)}
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(196,122,46,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#9B7450', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋮</button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: 32, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.14)', border: '1px solid rgba(196,122,46,0.15)', zIndex: 50, minWidth: 160, padding: '6px 0', fontFamily: font }}>
                  <button onClick={() => { onEdit(order); setMenuOpen(false); }}
                    style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>
                  {STATUSES.filter(s => s !== order.status).map(s => (
                    <button key={s} onClick={() => { onStatus(order._id, s); setMenuOpen(false); }}
                      style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: STATUS_COLOR[s].color, cursor: 'pointer' }}>
                      → Mark {s}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(196,122,46,0.1)', margin: '4px 0' }} />
                  <button onClick={() => { generateInvoice(order, vendorName || ''); setMenuOpen(false); }}
                    style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: gold, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Invoice
                  </button>
                  {onRequestPayment && (() => {
                    const pendingAmt = effectiveTotal - effectivePaid;
                    return pendingAmt > 0 ? (
                      <button onClick={() => { onRequestPayment({ order, pendingAmt }); setMenuOpen(false); }}
                        style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#7C3AED', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                        Request Payment (₹{pendingAmt.toLocaleString('en-IN')})
                      </button>
                    ) : null;
                  })()}
                  {order.status === 'Completed' && order.clientPhone && profileUrl && (
                    <a href={`https://wa.me/91${order.clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${order.clientName||'there'}, thank you for having me at your ${order.eventType||'event'}! 🎉 If you enjoyed the experience, a quick review on my Tendr profile would mean a lot 🙏\n\n${profileUrl}`)}`}
                      target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                      style={{ width:'100%', padding:'8px 16px', border:'none', background:'none', textAlign:'left', fontSize:13, fontWeight:600, color:'#128C7E', cursor:'pointer', display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Request Review
                    </a>
                  )}
                  <button onClick={() => { onDelete(order._id); setMenuOpen(false); }}
                    style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        {hasDetails && (
          <button onClick={() => setExpanded(e => !e)}
            style={{ marginTop: 10, width: '100%', padding: '6px', borderRadius: 8, border: '1px dashed rgba(196,122,46,0.25)', background: 'transparent', color: '#9B7450', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {expanded ? '▲ Hide details' : `▼ Show ${milestones.length > 0 ? `${milestones.length} payment${milestones.length > 1 ? 's' : ''}` : ''}${milestones.length > 0 && expenses.length > 0 ? ' · ' : ''}${expenses.length > 0 ? `${expenses.length} expense${expenses.length > 1 ? 's' : ''}` : ''}`}
          </button>
        )}

        {/* Request Review — shown only for completed orders with a phone number */}
        {order.status === 'Completed' && order.clientPhone && profileUrl && (
          <a href={`https://wa.me/91${order.clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${order.clientName||'there'}, thank you for having me at your ${order.eventType||'event'}! 🎉 If you enjoyed the experience, a quick review on my Tendr profile would mean a lot to me 🙏\n\n${profileUrl}`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:9, background:'rgba(37,211,102,0.07)', border:'1.5px solid rgba(37,211,102,0.22)', color:'#128C7E', fontSize:12.5, fontWeight:700, textDecoration:'none', fontFamily:font }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Request a Review via WhatsApp
          </a>
        )}
      </div>

      {/* Expanded panel */}
      {expanded && hasDetails && (
        <div style={{ borderTop: '1px solid rgba(196,122,46,0.1)', padding: '14px 16px', background: 'rgba(255,252,245,0.6)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Milestones */}
          {milestones.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Payment Schedule</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {milestones.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 9, background: m.paid ? 'rgba(22,163,74,0.06)' : '#fff', border: `1px solid ${m.paid ? 'rgba(22,163,74,0.2)' : 'rgba(196,122,46,0.12)'}` }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: m.paid ? '#16A34A' : 'transparent', border: `2px solid ${m.paid ? '#16A34A' : '#D97706'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {m.paid && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: ink }}>{m.label}</span>
                    {m.dueDate && <span style={{ fontSize: 11, color: '#9B7450' }}>{new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    <span style={{ fontSize: 13, fontWeight: 700, color: m.paid ? '#16A34A' : ink }}>₹{Number(m.amount || 0).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: m.paid ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)', color: m.paid ? '#16A34A' : '#D97706' }}>{m.paid ? 'Received' : 'Pending'}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: 12, color: '#9B7450' }}>
                  <span>Total ₹{milestoneTotal.toLocaleString('en-IN')}</span>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>₹{milestonePaid.toLocaleString('en-IN')} collected</span>
                  {milestoneTotal > milestonePaid && <span style={{ color: '#D97706', fontWeight: 700 }}>₹{(milestoneTotal - milestonePaid).toLocaleString('en-IN')} pending</span>}
                </div>
              </div>
            </div>
          )}

          {/* Expenses */}
          {expenses.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Expenses</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {expenses.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, background: '#fff', border: '1px solid rgba(220,38,38,0.1)' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>{e.category}</span>
                    <span style={{ flex: 1, fontSize: 12.5, color: ink }}>{e.description || '—'}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>₹{Number(e.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance details */}
          {hasPerformanceDetails && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Performance Details</div>
              {(order.startTime || order.endTime) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 9, background: '#fff', border: '1px solid rgba(196,122,46,0.12)', marginBottom: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ fontSize: 12.5, color: ink, fontWeight: 600 }}>
                    {order.startTime}{order.endTime ? ` – ${order.endTime}` : ''}
                  </span>
                </div>
              )}
              {order.equipment?.filter(Boolean).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {order.equipment.filter(Boolean).map((it, i) => (
                    <span key={i} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 100, background: 'rgba(196,122,46,0.08)', color: gold, fontWeight: 600 }}>{it}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profit summary */}
          {(expenses.length > 0 || milestones.length > 0) && (
            <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 12, background: cardProfit >= 0 ? 'rgba(22,163,74,0.07)' : 'rgba(220,38,38,0.07)', border: `1.5px solid ${cardProfit >= 0 ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Collected</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#16A34A' }}>₹{effectivePaid.toLocaleString('en-IN')}</div>
              </div>
              {expenses.length > 0 && <>
                <div style={{ fontSize: 18, color: '#9B7450', alignSelf: 'center' }}>−</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expenses</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ fontSize: 18, color: '#9B7450', alignSelf: 'center' }}>=</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Net Profit</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: cardProfit >= 0 ? '#16A34A' : '#DC2626' }}>₹{cardProfit.toLocaleString('en-IN')}</div>
                </div>
              </>}
              <button onClick={() => generateInvoice(order, vendorName || '')}
                style={{ alignSelf: 'center', padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${gold}`, background: 'transparent', color: gold, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Invoice ↗
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Revenue Trend Chart ───────────────────────────────────────────────────────
function RevenueChart({ orders }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString('en-IN', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), revenue: 0, collected: 0 };
  });
  orders.forEach(o => {
    const d = new Date(o.createdAt || o.eventDate);
    if (isNaN(d)) return;
    const m = months.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
    if (m) { m.revenue += o.amount || 0; m.collected += o.paidAmount || 0; }
  });
  const maxVal = Math.max(...months.map(m => m.revenue), 1);
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(196,122,46,0.12)', boxShadow: '0 2px 12px rgba(196,122,46,0.06)', marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>Revenue Trend <span style={{ fontSize: 12, fontWeight: 500, color: '#9B7450' }}>(last 6 months)</span></div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[['#C47A2E', 'Billed'], ['#16A34A', 'Collected']].map(([c, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9B7450' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 110, paddingTop: 20 }}>
        {months.map(m => {
          const rh = Math.max(Math.round((m.revenue / maxVal) * 86), 0);
          const ch = Math.max(Math.round((m.collected / maxVal) * 86), 0);
          return (
            <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 3, justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '38%', background: '#C47A2E', borderRadius: '4px 4px 0 0', height: `${rh}%`, minHeight: m.revenue > 0 ? 3 : 0, opacity: 0.85, position: 'relative' }}>
                  {m.revenue > 0 && <span style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: '#C47A2E', whiteSpace: 'nowrap' }}>{m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(0)}k` : m.revenue}</span>}
                </div>
                <div style={{ width: '38%', background: '#16A34A', borderRadius: '4px 4px 0 0', height: `${ch}%`, minHeight: m.collected > 0 ? 3 : 0, opacity: 0.75 }} />
              </div>
              <div style={{ fontSize: 9.5, color: '#9B7450', fontWeight: 600, fontFamily: font }}>{m.label}</div>
            </div>
          );
        })}
      </div>
      {months.every(m => m.revenue === 0) && (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#9B7450', marginTop: 8 }}>Add outside orders to see your revenue trend</div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
// ── Translations ───────────────────────────────────────────────────────────────
const T = {
  en: {
    navHome:'Home', navWork:'My Work', navGigs:'My Gigs', navShows:'My Shows',
    navEarnings:'Earnings', navStats:'Stats', navPage:'My Page', navAvail:'Avail.',
    navChats:'Chats', navEditProfile:'Edit Profile', navSignOut:'Sign Out',
    addGig:'Add Gig', addShow:'Add Show', newQuote:'+ New Quote', addItem:'+ Add Item', copyLink:'Copy Link',
    greetMorning:'Good morning', greetAfternoon:'Good afternoon', greetEvening:'Good evening',
    noGigsMonth:'No {t} logged yet this month',
    gigsMonth:'{n} {t} this month · ₹{a} logged',
    milestone:'events served — a real milestone!',
    milestoneShare:'Share this achievement on your social media or WhatsApp status.',
    reminders:'reminder', remindersFor:'for you',
    conflictTitle:'Time slot conflict', conflictMsg:'gig{s} overlap on the same date and time.',
    callClient:'Call Client', viewDetails:'View Details →', logGig:'Log a',
    logGigSub:'Tap to track a booking from WhatsApp, referral or walk-in',
    collectPayment:'Collect payment', viewAll:'View all', sendReminder:'Send reminder',
    view:'View', balance:'Balance',
    pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled',
    paid:'Paid', partial:'Partial',
    tendrGigs:'Tendr Gigs', outsideGigs:'Outside Gigs', quotes:'Quotes',
    allF:'All', searchPlaceholder:'Search by name or event…',
    totalRevenue:'Total Revenue', collected:'Collected', outstanding:'Outstanding',
    statsTitle:'Performance Stats', totalGigsL:'Total Gigs', completedGigsL:'Completed',
    avgGigValue:'Avg. Gig Value', collectionRate:'Collection Rate',
    repeatClients:'Repeat Clients', netProfit:'Net Profit',
    bookingSources:'Booking Sources', eventTypes:'Event Types', monthlyActivity:'Monthly Activity',
    topClients:'Top Clients', comingSoon:'Coming soon',
    quickTips:'Quick Tips', today:'Today', happeningToday:'HAPPENING TODAY', tomorrowLabel:'TOMORROW',
    profileLinkCopied:'Profile link copied!',
    langToggle:'हिंदी',
    gigConflict:'gig',
  },
  hi: {
    navHome:'होम', navWork:'मेरे काम', navGigs:'मेरे गिग', navShows:'मेरे शो',
    navEarnings:'कमाई', navStats:'आंकड़े', navPage:'मेरा पेज', navAvail:'उपलब्धता',
    navChats:'चैट', navEditProfile:'प्रोफ़ाइल बदलें', navSignOut:'साइन आउट',
    addGig:'गिग जोड़ें', addShow:'शो जोड़ें', newQuote:'+ नया कोटेशन', addItem:'+ आइटम जोड़ें', copyLink:'लिंक कॉपी करें',
    greetMorning:'सुप्रभात', greetAfternoon:'नमस्कार', greetEvening:'शुभ संध्या',
    noGigsMonth:'इस महीने कोई {t} दर्ज नहीं',
    gigsMonth:'इस महीने {n} {t} · ₹{a} दर्ज',
    milestone:'इवेंट पूरे — एक बड़ी उपलब्धि!',
    milestoneShare:'इस उपलब्धि को सोशल मीडिया या WhatsApp स्टेटस पर शेयर करें।',
    reminders:'रिमाइंडर', remindersFor:'आपके लिए',
    conflictTitle:'टाइम स्लॉट टकराव', conflictMsg:'गिग एक ही तारीख और समय पर हैं।',
    callClient:'क्लाइंट को कॉल करें', viewDetails:'विवरण देखें →', logGig:'दर्ज करें',
    logGigSub:'WhatsApp, रेफरल या वॉक-इन बुकिंग ट्रैक करें',
    collectPayment:'पेमेंट लें', viewAll:'सब देखें', sendReminder:'रिमाइंडर भेजें',
    view:'देखें', balance:'बकाया',
    pending:'पेंडिंग', confirmed:'कन्फर्म', completed:'पूरा', cancelled:'रद्द',
    paid:'पेड', partial:'आंशिक',
    tendrGigs:'Tendr गिग', outsideGigs:'बाहरी गिग', quotes:'कोटेशन',
    allF:'सभी', searchPlaceholder:'नाम या इवेंट से खोजें…',
    totalRevenue:'कुल कमाई', collected:'वसूल', outstanding:'बकाया',
    statsTitle:'परफॉर्मेंस आंकड़े', totalGigsL:'कुल गिग', completedGigsL:'पूरे',
    avgGigValue:'औसत गिग मूल्य', collectionRate:'वसूली दर',
    repeatClients:'दोबारा क्लाइंट', netProfit:'शुद्ध मुनाफा',
    bookingSources:'बुकिंग के स्रोत', eventTypes:'इवेंट प्रकार', monthlyActivity:'मासिक गतिविधि',
    topClients:'शीर्ष क्लाइंट', comingSoon:'जल्द आ रहा है',
    quickTips:'जरूरी सुझाव', today:'आज', happeningToday:'आज हो रहा है', tomorrowLabel:'कल',
    profileLinkCopied:'प्रोफ़ाइल लिंक कॉपी हो गया!',
    langToggle:'English',
    gigConflict:'गिग',
  },
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);

  // Derive vendorId from user or JWT
  const jwt = parseJwt(token || '');
  const vendorId = user?._id || user?.id || jwt.vendorId;
  const vendorName = user?.name || 'Vendor';
  const initial = vendorName.charAt(0).toUpperCase();

  const [tab, setTab] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Language
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('tendr_dash_lang') || 'en'; } catch { return 'en'; } });
  const t = (key) => T[lang]?.[key] ?? T.en[key] ?? key;
  const toggleLang = () => { const nl = lang === 'en' ? 'hi' : 'en'; setLang(nl); try { localStorage.setItem('tendr_dash_lang', nl); } catch {} };

  // Data
  const [bookings, setBookings]       = useState([]);
  const [outsideOrders, setOutside]   = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [outsideLoading, setOL]       = useState(false);

  // Outside order modal
  const [modal, setModal]             = useState(null); // null | 'add' | order object
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null);

  // Outside orders tab filters
  const [oFilter, setOFilter]         = useState('all');
  const [oSearch, setOSearch]         = useState('');

  // Mobile detection
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  // Inventory (localStorage per vendor)
  const [inventory, setInventory] = useState(() => { try { return JSON.parse(localStorage.getItem(`tendr_inv_${vendorId||'v'}`)||'[]'); } catch { return []; } });
  const [invModal, setInvModal]   = useState(false);
  const [invForm, setInvForm]     = useState({ name:'', qty:'1', unit:'', category:'', condition:'Good', notes:'' });

  // Media links (video/demo links) — stored in localStorage
  const MEDIA_KEY = `tendr_media_${vendorId||'v'}`;
  const [mediaLinks, setMediaLinks] = useState(() => { try { return JSON.parse(localStorage.getItem(`tendr_media_${vendorId||'v'}`)||'[]'); } catch { return []; } });
  const [mediaModal, setMediaModal] = useState(false);
  const [mediaForm, setMediaForm]   = useState({ title:'', url:'' });
  const [photoCount, setPhotoCount] = useState(null); // null = not loaded yet

  const saveMedia = (items) => { setMediaLinks(items); try { localStorage.setItem(MEDIA_KEY, JSON.stringify(items)); } catch {} };
  const addMediaLink = () => {
    if (!mediaForm.url.trim()) return;
    saveMedia([...mediaLinks, { ...mediaForm, id: Date.now().toString() }]);
    setMediaForm({ title:'', url:'' });
    setMediaModal(false);
  };
  const removeMediaLink = (id) => saveMedia(mediaLinks.filter(m => m.id !== id));

  // Work tab sub-tab
  const [workSubTab, setWorkSubTab] = useState('tendr'); // 'tendr' | 'outside' | 'calendar' | 'quotes'

  // Calendar month navigation
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear]   = useState(() => new Date().getFullYear());

  // Payment request modal (UPI)
  const UPIKEY = `tendr_upi_${vendorId||'v'}`;
  const [vendorUPI, setVendorUPI] = useState(() => { try { return localStorage.getItem(UPIKEY)||''; } catch { return ''; } });
  const [payReqModal, setPayReqModal] = useState(null); // null | { order, pendingAmt }
  const saveUPI = (upi) => { setVendorUPI(upi); try { localStorage.setItem(UPIKEY, upi); } catch {} };

  // Quotes (localStorage)
  const QUOTES_KEY = `tendr_quotes_${vendorId||'v'}`;
  const [quotes, setQuotes] = useState(() => { try { return JSON.parse(localStorage.getItem(`tendr_quotes_${vendorId||'v'}`)||'[]'); } catch { return []; } });
  const [quoteModal, setQuoteModal] = useState(false);
  const [editQuote, setEditQuote] = useState(null);
  const saveQuotes = (arr) => { setQuotes(arr); try { localStorage.setItem(QUOTES_KEY, JSON.stringify(arr)); } catch {} };
  const addOrUpdateQuote = (form) => {
    if (editQuote) {
      saveQuotes(quotes.map(q => q.id === editQuote.id ? { ...q, ...form } : q));
      showToast('Quote updated!');
    } else {
      saveQuotes([{ ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...quotes]);
      showToast('Quote saved!');
    }
    setQuoteModal(false);
    setEditQuote(null);
  };
  const deleteQuote = (id) => saveQuotes(quotes.filter(q => q.id !== id));
  const updateQuoteStatus = (id, status) => saveQuotes(quotes.map(q => q.id === id ? {...q, status} : q));

  // Milestone tracking (localStorage)
  const MILESTONE_KEY = `tendr_milestone_${vendorId||'v'}`;
  const [lastMilestone, setLastMilestone] = useState(() => { try { return Number(localStorage.getItem(MILESTONE_KEY)||0); } catch { return 0; } });
  const dismissMilestone = (m) => { setLastMilestone(m); try { localStorage.setItem(MILESTONE_KEY, String(m)); } catch {} };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Click-outside for profile menu
  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Load Tendr bookings
  useEffect(() => {
    fetch(`${BASE}/vendor/bookings`, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setBookings(Array.isArray(d) ? d : d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Load outside orders
  const loadOutside = () => {
    if (!token) return;
    setOL(true);
    fetch(`${BASE}/vendors/outside-orders`, { headers: authHeaders(token) })
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(d => setOutside(d.orders || []))
      .catch(() => {})
      .finally(() => setOL(false));
  };

  useEffect(() => { loadOutside(); }, [token]); // eslint-disable-line

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Derived stats
  const tendrCount     = bookings.length;
  const outsideCount   = outsideOrders.length;
  const outsideRevenue = outsideOrders.reduce((s, o) => s + (o.amount || 0), 0);
  const outsideCollected = outsideOrders.reduce((s, o) => s + (o.paidAmount || 0), 0);
  const pendingCount   = outsideOrders.filter(o => o.status === 'Pending').length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthOutside = outsideOrders.filter(o => new Date(o.createdAt) >= monthStart).length;
  const thisMonthRevenue = outsideOrders.filter(o => new Date(o.createdAt) >= monthStart).reduce((s, o) => s + (o.amount || 0), 0);

  // Outside orders: filter + search
  const visibleOutside = outsideOrders
    .filter(o => oFilter === 'all' || oFilter === 'outside' || oFilter === 'tendr' ? true : o.status === oFilter)
    .filter(o => !oSearch || o.clientName?.toLowerCase().includes(oSearch.toLowerCase()) || o.eventType?.toLowerCase().includes(oSearch.toLowerCase()) || o.clientPhone?.includes(oSearch));

  // Reminders firing today or overdue (not yet completed/cancelled)
  const reminderCheckDate = new Date().toISOString().split('T')[0];
  const activeReminders = outsideOrders
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Completed' && (o.reminders||[]).length > 0)
    .flatMap(o => (o.reminders||[]).filter(r => r.reminderDate && r.reminderDate <= reminderCheckDate).map(r => ({ ...r, order: o })));

  // Pending payments (partial or fully unpaid, not cancelled)
  const pendingPayments = outsideOrders
    .filter(o => o.status !== 'Cancelled' && (o.amount || 0) > (o.paidAmount || 0))
    .map(o => ({ ...o, due: (o.amount || 0) - (o.paidAmount || 0), daysSince: Math.floor((Date.now() - new Date(o.createdAt)) / 86400000) }))
    .sort((a, b) => b.due - a.due);
  const totalDue = pendingPayments.reduce((s, o) => s + o.due, 0);

  // Artist/vendor branching
  const serviceType   = user?.serviceType || '';
  const typeConfig    = TYPE_CONFIG[serviceType] || TYPE_CONFIG['default'];
  const isArtist      = typeConfig.isArtist;
  const term          = typeConfig.term;
  const terms         = typeConfig.terms;

  // Inventory helpers
  const INV_KEY = `tendr_inv_${vendorId||'v'}`;
  const saveInv = (items) => { setInventory(items); try { localStorage.setItem(INV_KEY, JSON.stringify(items)); } catch {} };
  const addInvItem    = () => { if (!invForm.name.trim()) return; saveInv([...inventory, { ...invForm, qty: Number(invForm.qty)||1, id: Date.now().toString() }]); setInvForm({ name:'', qty:'1', unit:'', category:'', condition:'Good', notes:'' }); setInvModal(false); };
  const removeInvItem = (id) => saveInv(inventory.filter(i => i.id !== id));
  const updateInvCond = (id, condition) => saveInv(inventory.map(i => i.id === id ? {...i, condition} : i));

  // Fetch portfolio photo count when My Page tab is active
  useEffect(() => {
    if (tab !== 'profile' || !vendorId || photoCount !== null) return;
    fetch(`${BASE}/vendors/${vendorId}`, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : null)
      .then(v => { if (v) setPhotoCount((v.portfolioPhotos||[]).length); })
      .catch(() => {});
  }, [tab, vendorId, token, photoCount]);

  // Today + upcoming week
  const todayStr   = new Date().toISOString().split('T')[0];
  const allGigs    = [...bookings.map(b => ({...b, _src:'tendr'})), ...outsideOrders.map(o => ({...o, _src:'outside'}))];
  const todaysGigs = allGigs.filter(g => g.eventDate && new Date(g.eventDate).toISOString().split('T')[0] === todayStr);
  const upcomingWeek = allGigs.filter(g => {
    if (!g.eventDate) return false;
    const d = new Date(g.eventDate); d.setHours(12,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    const next7 = new Date(today); next7.setDate(next7.getDate()+7);
    return d >= today && d <= next7 && g.status !== 'Cancelled';
  }).sort((a,b) => new Date(a.eventDate)-new Date(b.eventDate));

  // Gig conflict detection (artist only)
  const gigConflicts = new Set();
  if (isArtist) {
    const wt = outsideOrders.filter(o => o.eventDate && o.startTime);
    wt.forEach((a, i) => { wt.slice(i+1).forEach(b => {
      const aD = new Date(a.eventDate).toISOString().split('T')[0];
      const bD = new Date(b.eventDate).toISOString().split('T')[0];
      if (aD !== bD) return;
      const [ash,asm] = a.startTime.split(':').map(Number);
      const [aeh,aem] = (a.endTime||'23:59').split(':').map(Number);
      const [bsh,bsm] = b.startTime.split(':').map(Number);
      const [beh,bem] = (b.endTime||'23:59').split(':').map(Number);
      if ((ash*60+asm)<(beh*60+bem) && (aeh*60+aem)>(bsh*60+bsm)) { gigConflicts.add(a._id); gigConflicts.add(b._id); }
    }); });
  }

  // ── Event-platform intelligence ─────────────────────────────────────────────
  // Next upcoming event across all sources
  const nextEvent = allGigs.filter(g => {
    if (!g.eventDate || g.status === 'Cancelled') return false;
    const d = new Date(g.eventDate); d.setHours(23,59,59,0);
    return d >= new Date();
  }).sort((a,b) => new Date(a.eventDate)-new Date(b.eventDate))[0] || null;
  const daysUntilNext = nextEvent
    ? Math.max(0, Math.ceil((new Date(nextEvent.eventDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000))
    : null;

  // Total completed events (for milestone)
  const totalEventsDone = allGigs.filter(g => g.status === 'Completed').length;
  const MILESTONES = [10, 25, 50, 100, 200, 500];
  const currentMilestone = MILESTONES.filter(m => totalEventsDone >= m).slice(-1)[0] || 0;
  const showMilestone = currentMilestone > 0 && currentMilestone > lastMilestone;

  // Event type breakdown from outside orders
  const evtTypeCounts = outsideOrders.reduce((acc, o) => {
    const t = (o.eventType||'Other').trim(); acc[t] = (acc[t]||0)+1; return acc;
  }, {});
  const topEventTypes = Object.entries(evtTypeCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const evtTypeTotal = topEventTypes.reduce((s,[,c])=>s+c,0);

  // Season awareness nudge
  const curMonth = new Date().getMonth();
  const SEASON_INFO = (curMonth>=9||curMonth<=1)
    ? { text:'Wedding season is here (Oct–Feb) — peak booking period.', sub:'Keep availability updated and portfolio photos fresh.', bg:'rgba(196,122,46,0.07)', border:'rgba(196,122,46,0.18)', dot:'#C47A2E' }
    : (curMonth>=2&&curMonth<=3)
    ? { text:'Post-wedding season — corporate & birthday events pick up.', sub:'Good time to add corporate to your profile.', bg:'rgba(124,58,237,0.07)', border:'rgba(124,58,237,0.18)', dot:'#7C3AED' }
    : (curMonth>=4&&curMonth<=7)
    ? { text:'Off-peak season — best time to build portfolio and reviews.', sub:'New photos and reviews now will drive Oct–Feb bookings.', bg:'rgba(22,163,74,0.07)', border:'rgba(22,163,74,0.18)', dot:'#16A34A' }
    : { text:'Year-end corporate & festive season — Q4 bookings are active.', sub:'Tag corporate events in your profile to capture leads.', bg:'rgba(37,99,235,0.07)', border:'rgba(37,99,235,0.18)', dot:'#2563EB' };

  // Yearly heatmap data (all gigs, current calendar year)
  const heatYear = new Date().getFullYear();
  const heatMap = Array.from({length:12},(_,i) => {
    const label = new Date(heatYear,i,1).toLocaleDateString('en-IN',{month:'short'});
    const count = allGigs.filter(g => {
      if (!g.eventDate) return false;
      const d = new Date(g.eventDate);
      return d.getFullYear()===heatYear && d.getMonth()===i;
    }).length;
    return {month:i, label, count};
  });
  const heatMax = Math.max(...heatMap.map(m=>m.count), 1);

  // Client history — derived from outside orders, grouped by phone
  const clientMap = {};
  outsideOrders.forEach(o => {
    const key = (o.clientPhone||'').replace(/\D/g,'') || (o.clientName||'').toLowerCase().trim() || 'unknown';
    if (!clientMap[key]) clientMap[key] = { clientName:o.clientName, clientPhone:o.clientPhone, gigs:[], totalSpent:0, totalPaid:0, lastEventDate:null, lastEventType:'' };
    clientMap[key].gigs.push(o);
    clientMap[key].totalSpent += (o.amount||0);
    clientMap[key].totalPaid  += (o.paidAmount||0);
    if (o.eventDate && (!clientMap[key].lastEventDate || o.eventDate > clientMap[key].lastEventDate)) {
      clientMap[key].lastEventDate = o.eventDate;
      clientMap[key].lastEventType = o.eventType;
    }
  });
  const clientList = Object.values(clientMap).sort((a,b) => b.totalSpent - a.totalSpent);

  // CSV export
  const exportCSV = () => {
    const headers = ['Client Name', 'Phone', 'Email', 'Event Type', 'Event Date', 'Total (₹)', 'Paid (₹)', 'Payment Status', 'Booking Status', 'Source', 'Notes', 'Created At'];
    const rows = outsideOrders.map(o => [
      o.clientName || '', o.clientPhone || '', o.clientEmail || '', o.eventType || '',
      o.eventDate ? new Date(o.eventDate).toLocaleDateString('en-IN') : '',
      o.amount || 0, o.paidAmount || 0, o.paymentStatus || '', o.status || '', o.source || '',
      (o.notes || '').replace(/"/g, '""'),
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })), download: `tendr-orders-${new Date().toISOString().split('T')[0]}.csv` });
    a.click();
  };

  // ── API actions ──────────────────────────────────────────────────────────────
  const saveOrder = async (form) => {
    if (!token) return;
    setSaving(true);
    try {
      const isEdit = modal && typeof modal === 'object' && modal._id;
      const url  = isEdit ? `${BASE}/vendors/outside-orders/${modal._id}` : `${BASE}/vendors/outside-orders`;
      const method = isEdit ? 'PATCH' : 'POST';
      const r = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify(form) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Failed'); }
      const d = await r.json();
      if (isEdit) setOutside(os => os.map(o => o._id === modal._id ? d.order : o));
      else setOutside(os => [d.order, ...os]);
      setModal(null);
      showToast(isEdit ? 'Order updated!' : 'Order added!');
    } catch (e) {
      showToast(e.message || 'Failed to save order', false);
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      const r = await fetch(`${BASE}/vendors/outside-orders/${id}`, { method: 'DELETE', headers: authHeaders(token) });
      if (!r.ok) throw new Error();
      setOutside(os => os.filter(o => o._id !== id));
      showToast('Order deleted');
    } catch {
      showToast('Failed to delete', false);
    }
  };

  const setOrderStatus = async (id, status) => {
    try {
      const r = await fetch(`${BASE}/vendors/outside-orders/${id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setOutside(os => os.map(o => o._id === id ? d.order : o));
      showToast(`Marked ${status}`);
    } catch {
      showToast('Failed to update status', false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { key: 'home',        label: t('navHome'),                                        icon: dsic(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>) },
    { key: 'work',        label: isArtist ? t(terms==='Shows'?'navShows':'navGigs') : t('navWork'), icon: dsic(<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>) },
    { key: 'earnings',    label: t('navEarnings'),                                    icon: dsic(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>) },
    { key: 'performance', label: t('navStats'),                                       icon: dsic(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>) },
    { key: 'inventory',   label: typeConfig.invLabel,                                 icon: dsic(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>) },
    { key: 'profile',     label: t('navPage'),                                        icon: dsic(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>) },
    { key: 'calendar',    label: t('navAvail'),                                       icon: dsic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>) },
  ];
  const sideW = 220;

  const COND_COLOR = { 'Good': { bg:'rgba(22,163,74,0.08)', color:'#16A34A', dot:'#16A34A' }, 'Needs Service': { bg:'rgba(217,119,6,0.08)', color:'#D97706', dot:'#D97706' }, 'Out of Order': { bg:'rgba(220,38,38,0.08)', color:'#DC2626', dot:'#DC2626' } };
  const INV_CATS    = typeConfig.invCats;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FAF7F2', fontFamily:font }}>

      {/* ── Sidebar (desktop) ── */}
      {!isMobile && (
        <div style={{ width:sideW, background:'#fff', borderRight:'1px solid rgba(196,122,46,0.1)', position:'fixed', top:0, left:0, bottom:0, display:'flex', flexDirection:'column', zIndex:100 }}>
          <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(196,122,46,0.08)', cursor:'pointer' }} onClick={() => navigate('/')}>
            <img src={logo} alt="Tendr" style={{ height:28, display:'block', marginBottom:10 }} />
            <div style={{ fontSize:13.5, fontWeight:800, color:ink, lineHeight:1.2 }}>{vendorName}</div>
            {serviceType && <div style={{ fontSize:11, color:gold, fontWeight:600, marginTop:2 }}>{serviceType}</div>}
          </div>
          <nav style={{ padding:'10px 10px', flex:1, overflowY:'auto' }}>
            {NAV_ITEMS.map(item => {
              const active = tab === item.key;
              return (
                <button key={item.key} onClick={() => setTab(item.key)}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'none', background:active?'rgba(196,122,46,0.09)':'transparent', color:active?gold:'#9B7450', cursor:'pointer', fontFamily:font, fontSize:13.5, fontWeight:active?700:500, display:'flex', alignItems:'center', gap:10, marginBottom:2, transition:'all 0.15s', textAlign:'left' }}>
                  <span style={{ color:active?gold:'#BDA282', display:'flex', flexShrink:0 }}>{item.icon}</span>
                  <span style={{ flex:1 }}>{item.label}</span>
                  {item.key==='home' && todaysGigs.length>0 && <span style={{ fontSize:10, fontWeight:700, background:'rgba(22,163,74,0.12)', color:'#16A34A', borderRadius:100, padding:'1px 6px' }}>{todaysGigs.length} today</span>}
                  {item.key==='work' && pendingCount>0 && <span style={{ fontSize:10, fontWeight:700, background:'rgba(217,119,6,0.15)', color:'#D97706', borderRadius:100, padding:'1px 6px' }}>{pendingCount}</span>}
                  {item.key==='inventory' && inventory.filter(i=>i.condition==='Needs Service'||i.condition==='Out of Order').length>0 && <span style={{ fontSize:10, fontWeight:700, background:'rgba(220,38,38,0.1)', color:'#DC2626', borderRadius:100, padding:'1px 6px' }}>!</span>}
                </button>
              );
            })}
          </nav>
          <div style={{ padding:'8px 10px 16px', borderTop:'1px solid rgba(196,122,46,0.08)' }}>
            <button onClick={toggleLang} style={{ width:'100%', padding:'8px 12px', borderRadius:10, border:'1px solid rgba(196,122,46,0.22)', background:'rgba(196,122,46,0.06)', color:gold, cursor:'pointer', fontFamily:font, fontSize:12.5, fontWeight:700, display:'flex', alignItems:'center', gap:10, marginBottom:6, letterSpacing:'0.01em' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {t('langToggle')}
            </button>
            <button onClick={() => navigate('/vendor/chats')} style={{ width:'100%', padding:'8px 12px', borderRadius:10, border:'none', background:'transparent', color:'#9B7450', cursor:'pointer', fontFamily:font, fontSize:13, display:'flex', alignItems:'center', gap:10, marginBottom:1 }}>
              {dsic(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>)} {t('navChats')}
            </button>
            <button onClick={() => navigate('/vendor/profile')} style={{ width:'100%', padding:'8px 12px', borderRadius:10, border:'none', background:'transparent', color:'#9B7450', cursor:'pointer', fontFamily:font, fontSize:13, display:'flex', alignItems:'center', gap:10, marginBottom:1 }}>
              {dsic(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>)} {t('navEditProfile')}
            </button>
            <button onClick={() => dispatch(logout()).then(() => navigate('/'))} style={{ width:'100%', padding:'8px 12px', borderRadius:10, border:'none', background:'transparent', color:'#DC2626', cursor:'pointer', fontFamily:font, fontSize:13, display:'flex', alignItems:'center', gap:10 }}>
              {dsic(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>)} {t('navSignOut')}
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ flex:1, marginLeft:isMobile?0:sideW, display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        {/* Top bar */}
        <div style={{ background:'#fff', borderBottom:'1px solid rgba(196,122,46,0.1)', padding:'0 18px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:90, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {isMobile && <img src={logo} alt="Tendr" style={{ height:26, cursor:'pointer' }} onClick={() => navigate('/')} />}
            <div style={{ fontSize:15, fontWeight:800, color:ink }}>{NAV_ITEMS.find(n=>n.key===tab)?.label}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {isMobile && (
              <button onClick={toggleLang} style={{ padding:'5px 10px', borderRadius:8, border:'1px solid rgba(196,122,46,0.22)', background:'transparent', color:gold, fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>
                {t('langToggle')}
              </button>
            )}
            {tab==='work' && (workSubTab==='tendr'||workSubTab==='outside') && <button onClick={() => setModal('add')}    style={{ padding:'7px 14px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>+ {terms==='Shows'?t('addShow'):t('addGig')}</button>}
            {tab==='work' && workSubTab==='quotes'   && <button onClick={() => { setEditQuote(null); setQuoteModal(true); }}    style={{ padding:'7px 14px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>{t('newQuote')}</button>}
            {tab==='inventory' && <button onClick={() => setInvModal(true)}  style={{ padding:'7px 14px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>{t('addItem')}</button>}
            {tab==='profile'   && <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/vendor/${vendorId}`).then(() => showToast(t('profileLinkCopied'))); }}
              style={{ padding:'7px 14px', borderRadius:9, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>{t('copyLink')}</button>}
            <div ref={profileRef} style={{ position:'relative' }}>
              <button onClick={() => setProfileOpen(p => !p)} style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${gold},${goldLt})`, border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{initial}</button>
              {profileOpen && (
                <div style={{ position:'absolute', top:42, right:0, background:'#fff', borderRadius:14, boxShadow:'0 8px 28px rgba(0,0,0,0.14)', border:'1px solid rgba(196,122,46,0.14)', zIndex:200, minWidth:180, padding:'8px 0', fontFamily:font }}>
                  <div style={{ padding:'8px 16px 10px', borderBottom:'1px solid rgba(196,122,46,0.1)' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:ink }}>{vendorName}</div>
                    {serviceType && <div style={{ fontSize:11, color:gold, fontWeight:600 }}>{serviceType}</div>}
                  </div>
                  <button onClick={toggleLang} style={{ width:'100%', padding:'9px 16px', border:'none', background:'rgba(196,122,46,0.05)', textAlign:'left', fontSize:13, fontWeight:700, color:gold, cursor:'pointer', fontFamily:font }}>{t('langToggle')}</button>
                  <button onClick={() => { navigate('/vendor/profile'); setProfileOpen(false); }} style={{ width:'100%', padding:'9px 16px', border:'none', background:'none', textAlign:'left', fontSize:13, fontWeight:600, color:ink, cursor:'pointer', fontFamily:font }}>{t('navEditProfile')}</button>
                  <button onClick={() => { navigate('/vendor/chats'); setProfileOpen(false); }} style={{ width:'100%', padding:'9px 16px', border:'none', background:'none', textAlign:'left', fontSize:13, fontWeight:600, color:ink, cursor:'pointer', fontFamily:font }}>{t('navChats')}</button>
                  <div style={{ borderTop:'1px solid rgba(196,122,46,0.1)', margin:'4px 0' }} />
                  <button onClick={() => dispatch(logout()).then(() => navigate('/'))} style={{ width:'100%', padding:'9px 16px', border:'none', background:'none', textAlign:'left', fontSize:13, fontWeight:600, color:'#DC2626', cursor:'pointer', fontFamily:font }}>{t('navSignOut')}</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page body */}
        <div style={{ flex:1, padding:isMobile?'16px 14px 88px':'24px 28px 48px' }}>

          {/* ── HOME ── */}
          {tab === 'home' && (
            <>
              {/* Greeting + this-month snapshot */}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:isMobile?20:24, fontWeight:800, color:ink }}>
                  {new Date().getHours()<12?t('greetMorning'):new Date().getHours()<17?t('greetAfternoon'):t('greetEvening')}, {vendorName.split(' ')[0]}
                </div>
                <div style={{ fontSize:13, color:'#9B7450', marginTop:3 }}>
                  {thisMonthOutside>0
                    ? t('gigsMonth').replace('{n}',thisMonthOutside).replace('{t}',thisMonthOutside===1?term.toLowerCase():terms.toLowerCase()).replace('{a}',thisMonthRevenue.toLocaleString('en-IN'))
                    : t('noGigsMonth').replace('{t}',terms.toLowerCase())}
                </div>
              </div>

              {/* Milestone banner */}
              {showMilestone && (
                <div style={{ background:'linear-gradient(135deg,rgba(204,171,74,0.13),rgba(196,122,46,0.07))', borderRadius:16, padding:'14px 18px', marginBottom:16, border:'1.5px solid rgba(196,122,46,0.22)', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ fontSize:34, flexShrink:0 }}>🎉</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:ink }}>{currentMilestone}+ {t('milestone')}</div>
                    <div style={{ fontSize:12, color:'#9B7450', marginTop:2 }}>{t('milestoneShare')}</div>
                  </div>
                  <button onClick={() => dismissMilestone(currentMilestone)} style={{ width:26, height:26, borderRadius:'50%', border:'none', background:'rgba(196,122,46,0.12)', color:'#9B7450', cursor:'pointer', fontSize:15, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:font }}>×</button>
                </div>
              )}

              {/* Reminders alert */}
              {activeReminders.length > 0 && (
                <div style={{ background:'rgba(37,99,235,0.05)', border:'1.5px solid rgba(37,99,235,0.18)', borderRadius:14, padding:'12px 16px', marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#1D4ED8', marginBottom:8 }}>🔔 {activeReminders.length} {t('reminders')}{lang==='en'&&activeReminders.length!==1?'s':''} {t('remindersFor')}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {activeReminders.slice(0,4).map((r,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'8px 12px', background:'rgba(37,99,235,0.05)', borderRadius:10 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12.5, fontWeight:700, color:'#1D4ED8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.order.clientName} · {r.order.eventType||'Event'}</div>
                          <div style={{ fontSize:11, color:'#9B7450', marginTop:2 }}>{r.label} — {r.order.eventDate ? new Date(r.order.eventDate).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}) : ''}</div>
                        </div>
                        {r.order.clientPhone && (
                          <a href={`https://wa.me/91${r.order.clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${r.order.clientName}, just a reminder about your ${r.order.eventType||'event'}${r.order.eventDate?' on '+new Date(r.order.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):''} 🎉`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ padding:'5px 10px', borderRadius:8, background:'#25D366', color:'#fff', fontSize:11, fontWeight:700, textDecoration:'none', flexShrink:0 }}>WA</a>
                        )}
                        <button onClick={() => setTab('work')} style={{ padding:'5px 10px', borderRadius:8, border:'1.5px solid rgba(37,99,235,0.25)', background:'transparent', color:'#2563EB', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:font, flexShrink:0 }}>View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflict alert (artist) */}
              {isArtist && gigConflicts.size>0 && (
                <div style={{ background:'rgba(220,38,38,0.05)', border:'1.5px solid rgba(220,38,38,0.18)', borderRadius:14, padding:'12px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ color:'#DC2626', flexShrink:0 }}>{dsic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>)}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#DC2626', marginBottom:2 }}>{t('conflictTitle')}</div>
                    <div style={{ fontSize:12, color:'#9B7450' }}>{gigConflicts.size} {lang==='en'?`gig${gigConflicts.size!==1?'s':''} overlap on the same date and time.`:t('conflictMsg')}</div>
                  </div>
                  <button onClick={() => setTab('work')} style={{ fontSize:12, fontWeight:700, color:'#DC2626', background:'none', border:'none', cursor:'pointer', fontFamily:font, flexShrink:0, padding:0 }}>View →</button>
                </div>
              )}

              {/* Next event countdown card */}
              {nextEvent ? (
                <div style={{ background:`linear-gradient(135deg,${ink},#3D2510)`, borderRadius:20, padding:'20px 22px', marginBottom:18, color:'#fff', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-24, right:-24, width:110, height:110, borderRadius:'50%', background:'rgba(196,122,46,0.07)', pointerEvents:'none' }} />
                  <div style={{ position:'absolute', bottom:-28, right:55, width:80, height:80, borderRadius:'50%', background:'rgba(204,171,74,0.05)', pointerEvents:'none' }} />
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:5 }}>
                    {daysUntilNext===0 ? '🔴 HAPPENING TODAY' : daysUntilNext===1 ? '⏰ TOMORROW' : `📅 IN ${daysUntilNext} DAYS`}
                  </div>
                  <div style={{ fontSize:isMobile?18:20, fontWeight:800, marginBottom:2, color:'#fff' }}>
                    {nextEvent.customerName||nextEvent.clientName||'Client'}
                  </div>
                  <div style={{ fontSize:13, color:'#CCAB4A', fontWeight:600, marginBottom:16 }}>
                    {[nextEvent.eventType, nextEvent.eventDate && new Date(nextEvent.eventDate).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}), nextEvent.startTime && `${nextEvent.startTime}${nextEvent.endTime?` – ${nextEvent.endTime}`:''}`].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {(nextEvent.clientPhone||nextEvent.customerPhone) && (
                      <a href={`tel:${nextEvent.clientPhone||nextEvent.customerPhone}`}
                        style={{ padding:'8px 16px', borderRadius:10, background:'rgba(255,255,255,0.13)', color:'#fff', fontSize:12.5, fontWeight:700, textDecoration:'none', flexShrink:0 }}>
                        {t('callClient')}
                      </a>
                    )}
                    {(nextEvent.clientPhone||nextEvent.customerPhone) && (
                      <a href={`https://wa.me/91${(nextEvent.clientPhone||nextEvent.customerPhone||'').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${nextEvent.customerName||nextEvent.clientName||'there'}, just confirming I'll be there for your ${nextEvent.eventType||'event'}${nextEvent.eventDate?' on '+new Date(nextEvent.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):''} 🎉`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ padding:'8px 16px', borderRadius:10, background:'#25D366', color:'#fff', fontSize:12.5, fontWeight:700, textDecoration:'none', flexShrink:0 }}>
                        WhatsApp
                      </a>
                    )}
                    <button onClick={() => setTab('work')}
                      style={{ padding:'8px 16px', borderRadius:10, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.65)', fontSize:12.5, fontWeight:600, border:'none', cursor:'pointer', fontFamily:font, flexShrink:0 }}>
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setModal('add')} style={{ width:'100%', background:`linear-gradient(135deg,${gold},${goldLt})`, borderRadius:18, padding:'20px 22px', marginBottom:18, border:'none', cursor:'pointer', fontFamily:font, textAlign:'left', boxShadow:'0 4px 18px rgba(196,122,46,0.28)', display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>+</div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:2 }}>{t('logGig')} {lang==='en'?term.toLowerCase():''}</div>
                    <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.78)' }}>{t('logGigSub')}</div>
                  </div>
                </button>
              )}

              {/* Pending payments — shown only when money is owed */}
              {pendingPayments.length>0 && (
                <div style={{ background:'#fff', borderRadius:18, padding:'16px 20px', border:'1.5px solid rgba(217,119,6,0.2)', marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:ink }}>
                        {t('collectPayment')}
                        <span style={{ fontSize:11, fontWeight:700, color:'#D97706', background:'rgba(217,119,6,0.1)', borderRadius:100, padding:'2px 7px', marginLeft:6 }}>{pendingPayments.length}</span>
                      </div>
                      <div style={{ fontSize:12, color:'#9B7450', marginTop:1 }}>₹{totalDue.toLocaleString('en-IN')} outstanding</div>
                    </div>
                    <button onClick={() => setTab('work')} style={{ fontSize:12, fontWeight:700, color:gold, background:'none', border:'none', cursor:'pointer', fontFamily:font }}>All →</button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {pendingPayments.slice(0,3).map(o => (
                      <div key={o._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'#FFFCF5', borderRadius:10, border:'1px solid rgba(217,119,6,0.1)' }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(217,119,6,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#D97706', fontWeight:800, fontSize:13, flexShrink:0 }}>{o.clientName?.charAt(0)?.toUpperCase()||'?'}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.clientName}</div>
                          <div style={{ fontSize:11, color:'#9B7450' }}>{o.eventType||''}</div>
                        </div>
                        <div style={{ fontSize:14, fontWeight:800, color:'#D97706', flexShrink:0 }}>₹{o.due.toLocaleString('en-IN')}</div>
                        {o.clientPhone && (
                          <a href={`https://wa.me/91${o.clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${o.clientName}, gentle reminder that ₹${o.due.toLocaleString('en-IN')} is pending for your ${o.eventType||'event'}. Please arrange payment. Thank you! 🙏`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ padding:'6px 11px', borderRadius:8, background:'#25D366', color:'#fff', fontSize:11, fontWeight:700, textDecoration:'none', flexShrink:0 }}>WA</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming — next 5 events */}
              {upcomingWeek.length>0 && (
                <div style={{ background:'#fff', borderRadius:18, padding:'16px 20px', border:'1px solid rgba(196,122,46,0.12)', marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:ink }}>Coming up</div>
                    <button onClick={() => setTab('work')} style={{ fontSize:12, fontWeight:700, color:gold, background:'none', border:'none', cursor:'pointer', fontFamily:font }}>All {terms.toLowerCase()} →</button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {upcomingWeek.slice(0,5).map((g,i) => (
                      <div key={g._id||i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(196,122,46,0.06)', border:'1px solid rgba(196,122,46,0.12)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <div style={{ fontSize:14, fontWeight:800, color:gold, lineHeight:1 }}>{new Date(g.eventDate).getDate()}</div>
                          <div style={{ fontSize:9, fontWeight:700, color:'#9B7450', textTransform:'uppercase' }}>{new Date(g.eventDate).toLocaleDateString('en-IN',{month:'short'})}</div>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.customerName||g.clientName}</div>
                          <div style={{ fontSize:11.5, color:'#9B7450' }}>{[g.eventType, g.startTime&&`${g.startTime}${g.endTime?`–${g.endTime}`:''}`].filter(Boolean).join(' · ')}</div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          {g.amount>0 && <div style={{ fontSize:13, fontWeight:700, color:ink }}>₹{Number(g.amount).toLocaleString('en-IN')}</div>}
                          <div style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:100, background:STATUS_COLOR[g.status]?.bg||'rgba(196,122,46,0.08)', color:STATUS_COLOR[g.status]?.color||'#9B7450', display:'inline-block', marginTop:2 }}>{g.status||'Pending'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state — nothing logged yet */}
              {outsideOrders.length===0 && bookings.length===0 && !nextEvent && (
                <div style={{ textAlign:'center', padding:'32px 20px', background:'#fff', borderRadius:18, border:'1.5px dashed rgba(196,122,46,0.18)' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
                  <div style={{ fontSize:14, fontWeight:700, color:ink, marginBottom:4 }}>No bookings yet</div>
                  <div style={{ fontSize:13, color:'#9B7450', marginBottom:16, lineHeight:1.55 }}>Start by logging a booking — WhatsApp, referral, direct — it all goes here.</div>
                  <button onClick={() => setModal('add')} style={{ padding:'11px 24px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontFamily:font, fontSize:13.5, fontWeight:700, cursor:'pointer' }}>
                    + Log your first {term.toLowerCase()}
                  </button>
                </div>
              )}

              {/* Share profile card */}
              <div style={{ marginTop:16, padding:'14px 18px', borderRadius:16, background:'rgba(196,122,46,0.05)', border:'1.5px solid rgba(196,122,46,0.14)', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:26, flexShrink:0 }}>🔗</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:ink }}>Share your profile</div>
                  <div style={{ fontSize:11.5, color:'#9B7450', marginTop:2, lineHeight:1.45 }}>Send to clients directly — they can book through Tendr or contact you straight.</div>
                </div>
                <button onClick={() => {
                  const url = `${window.location.origin}/vendor/${vendorId}`;
                  if (navigator.share) { navigator.share({ title: vendorName, text: `Check out ${vendorName} on Tendr`, url }).catch(() => {}); }
                  else { navigator.clipboard?.writeText(url).then(() => showToast('Profile link copied!')); }
                }} style={{ padding:'8px 14px', borderRadius:9, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontFamily:font, fontSize:12.5, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                  Share
                </button>
              </div>
            </>
          )}

          {/* ── WORK ── */}
          {tab === 'work' && (
            <div>
              {/* Main sub-tab row */}
              <div style={{ display:'flex', gap:2, marginBottom:16, borderBottom:'2px solid rgba(196,122,46,0.1)', overflowX:'auto' }}>
                {[
                  ['tendr',   lang==='hi'?'Tendr':'Tendr',                                      tendrCount>0?tendrCount:''],
                  ['outside', lang==='hi'?'बाहरी':'Outside',                                   outsideCount>0?outsideCount:''],
                  ['calendar',lang==='hi'?'कैलेंडर':'Calendar',                                ''],
                  ['quotes',  lang==='hi'?'कोटेशन':'Quotes',                                   quotes.length>0?quotes.length:''],
                  ['clients', lang==='hi'?'क्लाइंट':'Clients',                                 clientList.length>0?clientList.length:''],
                ].map(([key,label,badge]) => (
                  <button key={key} onClick={() => { setWorkSubTab(key); setOSearch(''); setOFilter('all'); }}
                    style={{ padding:'8px 16px', border:'none', background:'transparent', fontFamily:font, fontSize:13, fontWeight:workSubTab===key?700:500, color:workSubTab===key?gold:'#9B7450', cursor:'pointer', borderBottom:workSubTab===key?`2.5px solid ${gold}`:'2.5px solid transparent', marginBottom:-2, transition:'all 0.15s', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap', flexShrink:0 }}>
                    {label}
                    {badge ? <span style={{ fontSize:10.5, fontWeight:700, background:'rgba(196,122,46,0.12)', color:gold, borderRadius:10, padding:'1px 6px' }}>{badge}</span> : null}
                  </button>
                ))}
              </div>

              {/* ── CALENDAR VIEW ── */}
              {workSubTab === 'calendar' && (() => {
                const allGigsForCal = [
                  ...bookings.map(b => ({...b, _src:'tendr'})),
                  ...outsideOrders.map(o => ({...o, _src:'outside'}))
                ];
                const firstDay = new Date(calYear, calMonth, 1).getDay();
                const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                const cells = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, i) => {
                  const day = i - firstDay + 1;
                  if (day < 1 || day > daysInMonth) return null;
                  const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const dayGigs = allGigsForCal.filter(g => g.eventDate && new Date(g.eventDate).toISOString().split('T')[0] === dateStr);
                  return { day, dateStr, gigs: dayGigs };
                });
                const todayStr2 = new Date().toISOString().split('T')[0];
                const monthName = new Date(calYear, calMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                return (
                  <div>
                    <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                        <button onClick={() => { const d = new Date(calYear, calMonth-1, 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }}
                          style={{ width:32, height:32, borderRadius:8, border:'1.5px solid rgba(196,122,46,0.2)', background:'transparent', cursor:'pointer', color:'#9B7450', fontSize:16 }}>‹</button>
                        <div style={{ fontSize:15, fontWeight:800, color:ink }}>{monthName}</div>
                        <button onClick={() => { const d = new Date(calYear, calMonth+1, 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }}
                          style={{ width:32, height:32, borderRadius:8, border:'1.5px solid rgba(196,122,46,0.2)', background:'transparent', cursor:'pointer', color:'#9B7450', fontSize:16 }}>›</button>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
                        {['S','M','T','W','T','F','S'].map((d,i) => (
                          <div key={i} style={{ textAlign:'center', fontSize:10.5, fontWeight:700, color:'#9B7450', padding:'4px 0', textTransform:'uppercase', letterSpacing:'0.06em' }}>{d}</div>
                        ))}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
                        {cells.map((cell, i) => {
                          if (!cell) return <div key={i} />;
                          const isToday = cell.dateStr === todayStr2;
                          const tendrGigs = cell.gigs.filter(g => g._src==='tendr');
                          const outsideGigs = cell.gigs.filter(g => g._src==='outside');
                          return (
                            <div key={i} style={{ minHeight:52, borderRadius:9, padding:'5px 6px', background:isToday?`rgba(196,122,46,0.09)`:cell.gigs.length>0?'rgba(196,122,46,0.03)':'transparent', border:isToday?`1.5px solid ${gold}`:`1px solid ${cell.gigs.length>0?'rgba(196,122,46,0.15)':'rgba(196,122,46,0.07)'}`, cursor:cell.gigs.length>0?'default':'default', position:'relative' }}>
                              <div style={{ fontSize:12, fontWeight:isToday?800:500, color:isToday?gold:cell.day===0?'#DC2626':'#6B4A2A', marginBottom:3 }}>{cell.day}</div>
                              {tendrGigs.length > 0 && <div style={{ fontSize:9.5, fontWeight:700, background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', borderRadius:4, padding:'1px 4px', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tendrGigs.length} T</div>}
                              {outsideGigs.length > 0 && <div style={{ fontSize:9.5, fontWeight:700, background:'rgba(124,58,237,0.15)', color:'#7C3AED', borderRadius:4, padding:'1px 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{outsideGigs.length} O</div>}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display:'flex', gap:16, marginTop:14, paddingTop:10, borderTop:'1px solid rgba(196,122,46,0.08)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#9B7450' }}><span style={{ width:12, height:12, borderRadius:3, background:`linear-gradient(135deg,${gold},${goldLt})`, display:'inline-block' }} />Tendr</div>
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#9B7450' }}><span style={{ width:12, height:12, borderRadius:3, background:'rgba(124,58,237,0.3)', display:'inline-block' }} />Outside</div>
                      </div>
                    </div>
                    {/* Upcoming in this month */}
                    {(() => {
                      const thisMonthGigs = allGigsForCal.filter(g => {
                        if (!g.eventDate) return false;
                        const d = new Date(g.eventDate);
                        return d.getMonth()===calMonth && d.getFullYear()===calYear && g.status!=='Cancelled';
                      }).sort((a,b) => new Date(a.eventDate)-new Date(b.eventDate));
                      if (thisMonthGigs.length === 0) return null;
                      return (
                        <div style={{ marginTop:14, background:'#fff', borderRadius:16, padding:'14px 18px', border:'1px solid rgba(196,122,46,0.1)' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>{thisMonthGigs.length} {terms} this month</div>
                          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                            {thisMonthGigs.map((g,i) => (
                              <div key={g._id||i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div style={{ width:36, height:36, borderRadius:9, background:'rgba(196,122,46,0.07)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                  <div style={{ fontSize:13, fontWeight:800, color:gold, lineHeight:1 }}>{new Date(g.eventDate).getDate()}</div>
                                  <div style={{ fontSize:8.5, fontWeight:700, color:'#9B7450', textTransform:'uppercase' }}>{new Date(g.eventDate).toLocaleDateString('en-IN',{month:'short'})}</div>
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:13, fontWeight:700, color:ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.customerName||g.clientName}</div>
                                  <div style={{ fontSize:11, color:'#9B7450' }}>{[g.eventType, g.startTime&&`${g.startTime}${g.endTime?`–${g.endTime}`:''}`].filter(Boolean).join(' · ')}</div>
                                </div>
                                <span style={{ fontSize:9.5, fontWeight:700, padding:'2px 6px', borderRadius:100, background:g._src==='tendr'?'rgba(196,122,46,0.1)':'rgba(124,58,237,0.1)', color:g._src==='tendr'?gold:'#7C3AED', flexShrink:0 }}>{g._src==='tendr'?'Tendr':'Outside'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}

              {/* ── QUOTES VIEW ── */}
              {workSubTab === 'quotes' && (
                <div>
                  {quotes.length === 0 ? (
                    <div style={{ background:'#fff', borderRadius:18, padding:'48px 24px', textAlign:'center', border:'1px solid rgba(196,122,46,0.1)' }}>
                      <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                      <div style={{ fontSize:16, fontWeight:800, color:ink, marginBottom:8 }}>No quotes yet</div>
                      <div style={{ fontSize:13, color:'#9B7450', marginBottom:18, maxWidth:340, margin:'0 auto 18px' }}>
                        Create estimates for clients before they confirm. A professional quote converts enquiries into bookings.
                      </div>
                      <button onClick={() => { setEditQuote(null); setQuoteModal(true); }} style={{ padding:'11px 24px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontFamily:font, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(196,122,46,0.35)' }}>
                        + Create First Quote
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {quotes.map(q => {
                        const qtotal = (() => {
                          const sub = (q.items||[]).reduce((s,i) => s+(Number(i.qty)||1)*(Number(i.rate)||0), 0);
                          return sub - (Number(q.discount)||0);
                        })();
                        const QSTATUS = { Draft:{ bg:'rgba(156,163,175,0.12)', color:'#6B7280', dot:'#9CA3AF' }, Sent:{ bg:'rgba(59,130,246,0.1)', color:'#1D4ED8', dot:'#3B82F6' }, Accepted:{ bg:'rgba(22,163,74,0.1)', color:'#166534', dot:'#16A34A' }, Declined:{ bg:'rgba(220,38,38,0.08)', color:'#991B1B', dot:'#EF4444' } };
                        const qs = QSTATUS[q.status] || QSTATUS.Draft;
                        return (
                          <div key={q.id} style={{ background:'#fff', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(196,122,46,0.12)' }}>
                            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(196,122,46,0.07)', display:'flex', alignItems:'center', justifyContent:'center', color:gold, fontWeight:800, fontSize:15, flexShrink:0 }}>
                                {(q.clientName||'?').charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                                  <span style={{ fontWeight:700, color:ink, fontSize:14 }}>{q.clientName}</span>
                                  <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:100, background:qs.bg, color:qs.color }}>{q.status||'Draft'}</span>
                                </div>
                                <div style={{ fontSize:12, color:'#9B7450', marginTop:2, display:'flex', flexWrap:'wrap', gap:'2px 10px' }}>
                                  {q.eventType && <span>{q.eventType}</span>}
                                  {q.eventDate && <span>{new Date(q.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>}
                                  {q.clientPhone && <span>{q.clientPhone}</span>}
                                </div>
                              </div>
                              <div style={{ textAlign:'right', flexShrink:0 }}>
                                <div style={{ fontSize:16, fontWeight:800, color:ink }}>₹{qtotal.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize:10, color:'#9B7450', marginTop:1 }}>{(q.items||[]).length} item{(q.items||[]).length!==1?'s':''}</div>
                              </div>
                            </div>
                            <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                              <button onClick={() => generateQuote(q, vendorName)}
                                style={{ padding:'5px 12px', borderRadius:8, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontFamily:font, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                                Print / PDF
                              </button>
                              {q.clientPhone && (
                                <a href={`https://wa.me/91${q.clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${q.clientName}, please find your estimate for the ${q.eventType||'event'}: Total ₹${qtotal.toLocaleString('en-IN')}. Contact me for full details. — ${vendorName}`)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  style={{ padding:'5px 12px', borderRadius:8, border:'none', background:'#25D366', color:'#fff', fontFamily:font, fontSize:12, fontWeight:700, textDecoration:'none' }}>
                                  WhatsApp
                                </a>
                              )}
                              {['Sent','Accepted','Declined'].filter(s => s !== q.status).map(s => (
                                <button key={s} onClick={() => updateQuoteStatus(q.id, s)}
                                  style={{ padding:'5px 12px', borderRadius:8, border:'1.5px solid rgba(196,122,46,0.2)', background:'transparent', color:'#9B7450', fontFamily:font, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                  → {s}
                                </button>
                              ))}
                              <button onClick={() => { setEditQuote(q); setQuoteModal(true); }}
                                style={{ padding:'5px 12px', borderRadius:8, border:'1.5px solid rgba(196,122,46,0.2)', background:'transparent', color:'#9B7450', fontFamily:font, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                Edit
                              </button>
                              <button onClick={() => { if (window.confirm('Delete this quote?')) deleteQuote(q.id); }}
                                style={{ padding:'5px 10px', borderRadius:8, border:'1.5px solid rgba(220,38,38,0.2)', background:'transparent', color:'#DC2626', fontFamily:font, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TENDR BOOKINGS ── */}
              {workSubTab === 'tendr' && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <div style={{ fontSize:12, color:'#9B7450' }}>Bookings sent to you through the Tendr platform</div>
                    <button onClick={() => navigate('/vendor/bookings')} style={{ fontSize:12, fontWeight:700, color:gold, background:'none', border:'none', cursor:'pointer', fontFamily:font, flexShrink:0 }}>Full page →</button>
                  </div>
                  {isArtist && gigConflicts.size>0 && (
                    <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(220,38,38,0.05)', border:'1.5px solid rgba(220,38,38,0.18)', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ color:'#DC2626' }}>{dsic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>)}</span>
                      <span style={{ fontSize:12.5, color:'#DC2626', fontWeight:600 }}>{gigConflicts.size} time conflict{gigConflicts.size!==1?'s':''} detected</span>
                    </div>
                  )}
                  <input value={oSearch} onChange={e => setOSearch(e.target.value)} placeholder="Search by name or event type…"
                    style={{ width:'100%', maxWidth:380, padding:'9px 14px', borderRadius:10, border:'1.5px solid rgba(196,122,46,0.22)', fontFamily:font, fontSize:13, color:ink, outline:'none', background:'#fff', boxSizing:'border-box', marginBottom:14 }} />
                  {loading ? <div style={{ textAlign:'center', padding:'24px', color:'#9B7450' }}>Loading…</div>
                  : bookings.length===0 ? (
                    <div style={{ textAlign:'center', padding:'36px 24px', background:'#fff', borderRadius:16, border:'1.5px dashed rgba(196,122,46,0.18)' }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
                      <div style={{ fontSize:14, fontWeight:700, color:ink, marginBottom:6 }}>No Tendr bookings yet</div>
                      <div style={{ fontSize:13, color:'#9B7450', maxWidth:280, margin:'0 auto' }}>Keep your profile active and updated — clients browsing Tendr will find and book you here.</div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {bookings.filter(b => !oSearch||b.customerName?.toLowerCase().includes(oSearch.toLowerCase())||b.eventType?.toLowerCase().includes(oSearch.toLowerCase())).map((b,i) => <BookingCard key={b.id||b._id||i} b={b} />)}
                    </div>
                  )}
                </div>
              )}

              {/* ── OUTSIDE BOOKINGS ── */}
              {workSubTab === 'outside' && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontSize:12, color:'#9B7450' }}>Direct bookings — WhatsApp, referrals, walk-ins</div>
                    {outsideOrders.length>0 && <button onClick={exportCSV} style={{ padding:'5px 12px', borderRadius:8, border:'1.5px solid rgba(196,122,46,0.2)', background:'#fff', color:'#9B7450', fontFamily:font, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>{dsic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>)} CSV</button>}
                  </div>
                  {/* Status pills */}
                  {outsideOrders.length>0 && (
                    <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                      {['all','Pending','Confirmed','Completed','Cancelled'].map(s => {
                        const n = s==='all' ? outsideOrders.length : outsideOrders.filter(o=>o.status===s).length;
                        if (s!=='all' && n===0) return null;
                        const active = oFilter===s||(s==='all'&&(oFilter==='all'||oFilter==='outside'));
                        return (
                          <button key={s} onClick={() => setOFilter(s==='all'?'outside':s)}
                            style={{ padding:'5px 13px', borderRadius:100, fontSize:12, fontWeight:700, fontFamily:font, cursor:'pointer', border:'1.5px solid', borderColor:active?gold:'rgba(196,122,46,0.2)', background:active?gold:'#fff', color:active?'#fff':'#9B7450', transition:'all 0.15s' }}>
                            {s==='all'?'All':s} ({n})
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <input value={oSearch} onChange={e => setOSearch(e.target.value)} placeholder="Search by name, event type, or phone…"
                    style={{ width:'100%', maxWidth:380, padding:'9px 14px', borderRadius:10, border:'1.5px solid rgba(196,122,46,0.22)', fontFamily:font, fontSize:13, color:ink, outline:'none', background:'#fff', boxSizing:'border-box', marginBottom:14 }} />
                  {outsideLoading ? <div style={{ textAlign:'center', padding:'24px', color:'#9B7450' }}>Loading…</div>
                  : visibleOutside.length===0 ? (
                    <div style={{ background:'#fff', borderRadius:16, padding:'40px 24px', textAlign:'center', border:'1.5px dashed rgba(196,122,46,0.18)' }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
                      <div style={{ fontSize:15, fontWeight:700, color:ink, marginBottom:6 }}>{outsideOrders.length===0?`No outside ${terms.toLowerCase()} yet`:`No ${terms.toLowerCase()} match`}</div>
                      {outsideOrders.length===0 && <>
                        <div style={{ fontSize:13, color:'#9B7450', marginBottom:16, maxWidth:300, margin:'0 auto 16px' }}>Log bookings from WhatsApp, Instagram, referrals, or walk-ins to track your full revenue here.</div>
                        <button onClick={() => setModal('add')} style={{ padding:'10px 22px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontFamily:font, fontSize:13.5, fontWeight:700, cursor:'pointer' }}>+ Log Your First {term}</button>
                      </>}
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {visibleOutside.map(o => (
                        <div key={o._id} style={{ outline:gigConflicts.has(o._id)?'2px solid #DC2626':'none', borderRadius:14 }}>
                          <OutsideOrderCard order={o} onEdit={setModal} onDelete={deleteOrder} onStatus={setOrderStatus} onRequestPayment={setPayReqModal} vendorName={vendorName} profileUrl={`${window.location.origin}/vendor/${vendorId}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {outsideOrders.length>0 && (
                    <div style={{ display:'flex', gap:20, padding:'14px 18px', borderRadius:14, background:'#fff', border:'1px solid rgba(196,122,46,0.1)', marginTop:16, flexWrap:'wrap' }}>
                      <div><div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>Revenue</div><div style={{ fontSize:18, fontWeight:800, color:ink }}>₹{outsideRevenue.toLocaleString('en-IN')}</div></div>
                      <div><div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>Collected</div><div style={{ fontSize:18, fontWeight:800, color:'#16A34A' }}>₹{outsideCollected.toLocaleString('en-IN')}</div></div>
                      <div><div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>Pending</div><div style={{ fontSize:18, fontWeight:800, color:'#D97706' }}>₹{(outsideRevenue-outsideCollected).toLocaleString('en-IN')}</div></div>
                    </div>
                  )}
                </div>
              )}
              {/* ── CLIENTS VIEW ── */}
              {workSubTab === 'clients' && (
                <div>
                  {clientList.length === 0 ? (
                    <div style={{ background:'#fff', borderRadius:18, padding:'48px 24px', textAlign:'center', border:'1.5px dashed rgba(196,122,46,0.18)' }}>
                      <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
                      <div style={{ fontSize:15, fontWeight:700, color:ink, marginBottom:8 }}>No clients yet</div>
                      <div style={{ fontSize:13, color:'#9B7450', maxWidth:300, margin:'0 auto 18px' }}>Log outside bookings and your client history will build up automatically.</div>
                      <button onClick={() => { setWorkSubTab('outside'); setModal('add'); }}
                        style={{ padding:'11px 24px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontFamily:font, fontSize:13.5, fontWeight:700, cursor:'pointer' }}>
                        + Log First {term}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {/* Summary strip */}
                      <div style={{ display:'flex', gap:16, padding:'14px 18px', borderRadius:14, background:'#fff', border:'1px solid rgba(196,122,46,0.1)', flexWrap:'wrap', marginBottom:4 }}>
                        <div><div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>Clients</div><div style={{ fontSize:18, fontWeight:800, color:ink }}>{clientList.length}</div></div>
                        <div><div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>Total Revenue</div><div style={{ fontSize:18, fontWeight:800, color:ink }}>₹{clientList.reduce((s,c)=>s+c.totalSpent,0).toLocaleString('en-IN')}</div></div>
                        <div><div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em' }}>Repeat Clients</div><div style={{ fontSize:18, fontWeight:800, color:gold }}>{clientList.filter(c=>c.gigs.length>1).length}</div></div>
                      </div>

                      {clientList.map((c, i) => {
                        const due = c.totalSpent - c.totalPaid;
                        const phoneDigits = (c.clientPhone||'').replace(/\D/g,'');
                        return (
                          <div key={i} style={{ background:'#fff', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(196,122,46,0.12)' }}>
                            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                              {/* Avatar */}
                              <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,rgba(196,122,46,0.12),rgba(196,122,46,0.06))`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1.5px solid rgba(196,122,46,0.15)` }}>
                                <span style={{ fontSize:18, fontWeight:800, color:gold }}>{(c.clientName||'?').charAt(0).toUpperCase()}</span>
                              </div>

                              {/* Info */}
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                                  <span style={{ fontSize:14, fontWeight:800, color:ink }}>{c.clientName}</span>
                                  {c.gigs.length > 1 && (
                                    <span style={{ fontSize:9.5, fontWeight:700, background:'rgba(196,122,46,0.1)', color:gold, borderRadius:100, padding:'2px 7px' }}>
                                      {c.gigs.length}× repeat
                                    </span>
                                  )}
                                </div>
                                {c.clientPhone && (
                                  <div style={{ fontSize:12, color:'#9B7450', marginTop:2 }}>{c.clientPhone}</div>
                                )}
                                <div style={{ display:'flex', gap:12, marginTop:6, flexWrap:'wrap' }}>
                                  <div>
                                    <div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.07em' }}>{c.gigs.length} {c.gigs.length===1?term:terms}</div>
                                    <div style={{ fontSize:14, fontWeight:800, color:ink }}>₹{c.totalSpent.toLocaleString('en-IN')}</div>
                                  </div>
                                  {due > 0 && (
                                    <div>
                                      <div style={{ fontSize:10, fontWeight:700, color:'#D97706', textTransform:'uppercase', letterSpacing:'0.07em' }}>Pending</div>
                                      <div style={{ fontSize:14, fontWeight:800, color:'#D97706' }}>₹{due.toLocaleString('en-IN')}</div>
                                    </div>
                                  )}
                                  {c.lastEventDate && (
                                    <div>
                                      <div style={{ fontSize:10, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.07em' }}>Last Event</div>
                                      <div style={{ fontSize:12, fontWeight:600, color:ink }}>{c.lastEventType||'Event'} · {new Date(c.lastEventDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action row */}
                            {phoneDigits && (
                              <div style={{ display:'flex', gap:6, marginTop:12 }}>
                                <a href={`tel:${c.clientPhone}`}
                                  style={{ flex:1, padding:'7px', borderRadius:9, border:'1.5px solid rgba(196,122,46,0.2)', background:'transparent', color:'#9B7450', fontFamily:font, fontSize:12, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                                  📞 Call
                                </a>
                                <a href={`https://wa.me/91${phoneDigits}`} target="_blank" rel="noopener noreferrer"
                                  style={{ flex:1, padding:'7px', borderRadius:9, border:'none', background:'#25D366', color:'#fff', fontFamily:font, fontSize:12, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                                  WhatsApp
                                </a>
                                {due > 0 && (
                                  <a href={`https://wa.me/91${phoneDigits}?text=${encodeURIComponent(`Hi ${c.clientName}, just a gentle reminder — ₹${due.toLocaleString('en-IN')} is pending from your last event. Please let me know when it's convenient. 🙏 — ${vendorName}`)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{ flex:1.5, padding:'7px', borderRadius:9, border:'none', background:'rgba(217,119,6,0.1)', color:'#D97706', fontFamily:font, fontSize:12, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                                    Remind Payment
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Gig history */}
                            <div style={{ marginTop:10, borderTop:'1px solid rgba(196,122,46,0.08)', paddingTop:10, display:'flex', flexDirection:'column', gap:4 }}>
                              {c.gigs.slice(0,3).map((g,gi) => (
                                <div key={g._id||gi} style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <div style={{ width:6, height:6, borderRadius:'50%', background:g.status==='Completed'?'#16A34A':g.status==='Cancelled'?'#DC2626':'#D97706', flexShrink:0 }} />
                                  <div style={{ flex:1, fontSize:11.5, color:'#9B7450' }}>
                                    {[g.eventType, g.eventDate&&new Date(g.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})].filter(Boolean).join(' · ')}
                                  </div>
                                  <div style={{ fontSize:11.5, fontWeight:700, color:ink }}>₹{(g.amount||0).toLocaleString('en-IN')}</div>
                                  <button onClick={() => setModal(g)} style={{ fontSize:10.5, fontWeight:600, color:gold, background:'none', border:'none', cursor:'pointer', fontFamily:font, padding:0 }}>View →</button>
                                </div>
                              ))}
                              {c.gigs.length > 3 && (
                                <div style={{ fontSize:11, color:'#9B7450', paddingLeft:14 }}>+{c.gigs.length-3} more {c.gigs.length-3===1?term:terms}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ── EARNINGS / P&L ── */}
          {tab === 'earnings' && (() => {
            const earnNow = new Date();
            const plMonths = Array.from({ length: 6 }, (_, i) => {
              const d = new Date(earnNow.getFullYear(), earnNow.getMonth() - (5 - i), 1);
              return { label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), year: d.getFullYear(), month: d.getMonth(), revenue: 0, collected: 0, expenses: 0, count: 0 };
            });
            outsideOrders.forEach(o => {
              const d = new Date(o.createdAt || o.eventDate);
              if (isNaN(d)) return;
              const m = plMonths.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
              if (!m) return;
              const orderExpenses = (o.expenses||[]).reduce((s,e) => s+(Number(e.amount)||0), 0);
              const paid = (o.milestones||[]).length > 0
                ? o.milestones.filter(m=>m.paid).reduce((s,m)=>s+(Number(m.amount)||0),0)
                : Number(o.paidAmount)||0;
              m.revenue += Number(o.amount)||0;
              m.collected += paid;
              m.expenses += orderExpenses;
              m.count++;
            });
            const totalExpensesAll = outsideOrders.reduce((s,o) => s + (o.expenses||[]).reduce((ss,e) => ss+(Number(e.amount)||0), 0), 0);
            const netProfit = outsideCollected - totalExpensesAll;
            const thisM = plMonths[plMonths.length - 1];
            const prevM = plMonths[plMonths.length - 2];
            const momChange = prevM?.collected > 0 ? Math.round(((thisM.collected - prevM.collected) / prevM.collected) * 100) : null;
            const maxBar = Math.max(...plMonths.map(m => m.revenue), 1);
            return (
              <div>
                {/* Top stats */}
                <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                  <Stat label="Total Revenue"  value={outsideRevenue>=1000?`₹${(outsideRevenue/1000).toFixed(1)}k`:`₹${outsideRevenue}`} sub="all time billed" icon={dsic(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>)} accent="rgba(196,122,46,0.1)" />
                  <Stat label="Total Collected" value={outsideCollected>=1000?`₹${(outsideCollected/1000).toFixed(1)}k`:`₹${outsideCollected}`} sub={`₹${(outsideRevenue-outsideCollected).toLocaleString('en-IN')} pending`} icon={dsic(<><polyline points="20 6 9 17 4 12"/></>)} accent="rgba(22,163,74,0.1)" />
                  <Stat label="Total Expenses" value={totalExpensesAll>=1000?`₹${(totalExpensesAll/1000).toFixed(1)}k`:`₹${totalExpensesAll}`} sub="materials, travel, labour" icon={dsic(<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>)} accent="rgba(220,38,38,0.07)" />
                  <Stat label="Net Profit" value={netProfit>=1000?`₹${(netProfit/1000).toFixed(1)}k`:`₹${netProfit}`} sub={momChange!==null?`${momChange>=0?'+':''}${momChange}% vs last month`:'collected − expenses'} icon={dsic(<><path d="M23 6l-9.5 9.5-5-5L1 18"/><polyline points="17 6 23 6 23 12"/></>)} accent={netProfit>=0?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.07)'} />
                </div>

                {/* Monthly bar chart */}
                <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)', marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:ink }}>Monthly Revenue <span style={{ fontSize:12, fontWeight:500, color:'#9B7450' }}>(last 6 months)</span></div>
                    <div style={{ display:'flex', gap:12 }}>
                      {[['#C47A2E','Billed'],['#16A34A','Collected'],['#DC2626','Expenses']].map(([c,l]) => (
                        <span key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#9B7450' }}>
                          <span style={{ width:9, height:9, borderRadius:3, background:c, display:'inline-block' }} />{l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:110, paddingTop:20 }}>
                    {plMonths.map(m => {
                      const rh = Math.max(Math.round((m.revenue/maxBar)*86),0);
                      const ch = Math.max(Math.round((m.collected/maxBar)*86),0);
                      const eh = Math.max(Math.round((m.expenses/maxBar)*86),0);
                      return (
                        <div key={m.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%' }}>
                          <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end', gap:2, justifyContent:'center' }}>
                            <div style={{ width:'30%', background:'#C47A2E', borderRadius:'3px 3px 0 0', height:`${rh}%`, minHeight:m.revenue>0?3:0, opacity:0.8 }} />
                            <div style={{ width:'30%', background:'#16A34A', borderRadius:'3px 3px 0 0', height:`${ch}%`, minHeight:m.collected>0?3:0, opacity:0.8 }} />
                            <div style={{ width:'30%', background:'#DC2626', borderRadius:'3px 3px 0 0', height:`${eh}%`, minHeight:m.expenses>0?3:0, opacity:0.7 }} />
                          </div>
                          <div style={{ fontSize:9.5, color:'#9B7450', fontWeight:600, marginTop:3, fontFamily:font }}>{m.label}</div>
                        </div>
                      );
                    })}
                  </div>
                  {plMonths.every(m => m.revenue === 0) && <div style={{ textAlign:'center', fontSize:12, color:'#9B7450', marginTop:8 }}>Log outside orders to see revenue trend here</div>}
                </div>

                {/* Yearly event heatmap */}
                <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)', marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:ink }}>Event Calendar <span style={{ fontSize:11.5, fontWeight:500, color:'#9B7450' }}>{heatYear}</span></div>
                    <div style={{ fontSize:11, color:'#9B7450' }}>all {terms.toLowerCase()}</div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
                    {heatMap.map(m => {
                      const intensity = m.count / heatMax;
                      const isNow = m.month === new Date().getMonth();
                      return (
                        <div key={m.month} style={{ textAlign:'center', padding:'10px 4px', borderRadius:10, background:`rgba(196,122,46,${0.05+intensity*0.45})`, border:`1.5px solid ${isNow?gold:'rgba(196,122,46,'+(0.1+intensity*0.2)+')'}`, transition:'background 0.2s' }}>
                          <div style={{ fontSize:18, fontWeight:800, color:intensity>0.25?gold:ink, fontVariantNumeric:'tabular-nums' }}>{m.count}</div>
                          <div style={{ fontSize:10, color:'#9B7450', fontWeight:600, marginTop:2, letterSpacing:'0.04em' }}>{m.label}</div>
                          {isNow && <div style={{ width:5, height:5, borderRadius:'50%', background:gold, margin:'3px auto 0' }} />}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:12, justifyContent:'flex-end' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:12, height:12, borderRadius:3, background:'rgba(196,122,46,0.1)', border:'1px solid rgba(196,122,46,0.15)' }} />
                      <span style={{ fontSize:10, color:'#9B7450' }}>0 events</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:12, height:12, borderRadius:3, background:'rgba(196,122,46,0.5)' }} />
                      <span style={{ fontSize:10, color:'#9B7450' }}>busy</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:gold }} />
                      <span style={{ fontSize:10, color:'#9B7450' }}>current month</span>
                    </div>
                  </div>
                </div>

                {/* Monthly P&L table */}
                <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)', marginBottom:20 }}>
                  <div style={{ fontSize:15, fontWeight:800, color:ink, marginBottom:14 }}>Month-by-Month P&L</div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:font, fontSize:12.5 }}>
                      <thead>
                        <tr style={{ borderBottom:'1.5px solid rgba(196,122,46,0.12)' }}>
                          {['Month','Orders','Billed','Collected','Expenses','Net Profit'].map(h => (
                            <th key={h} style={{ padding:'7px 10px', textAlign:h==='Month'||h==='Orders'?'left':'right', fontSize:10.5, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...plMonths].reverse().map((m, i) => {
                          const net = m.collected - m.expenses;
                          return (
                            <tr key={m.label} style={{ borderBottom:'1px solid rgba(196,122,46,0.07)', background:i===0?'rgba(196,122,46,0.03)':'transparent' }}>
                              <td style={{ padding:'9px 10px', fontWeight:i===0?700:400, color:ink }}>{m.label}{i===0?<span style={{ fontSize:10, color:gold, marginLeft:5, fontWeight:700 }}>← this month</span>:null}</td>
                              <td style={{ padding:'9px 10px', textAlign:'left', color:'#9B7450' }}>{m.count}</td>
                              <td style={{ padding:'9px 10px', textAlign:'right', color:ink, fontWeight:600 }}>₹{m.revenue.toLocaleString('en-IN')}</td>
                              <td style={{ padding:'9px 10px', textAlign:'right', color:'#16A34A', fontWeight:600 }}>₹{m.collected.toLocaleString('en-IN')}</td>
                              <td style={{ padding:'9px 10px', textAlign:'right', color:m.expenses>0?'#DC2626':'#9B7450', fontWeight:600 }}>₹{m.expenses.toLocaleString('en-IN')}</td>
                              <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:700, color:net>=0?'#16A34A':'#DC2626' }}>₹{net.toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop:'2px solid rgba(196,122,46,0.15)' }}>
                          <td colSpan={2} style={{ padding:'9px 10px', fontWeight:800, color:ink }}>All Time</td>
                          <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:800, color:ink }}>₹{outsideRevenue.toLocaleString('en-IN')}</td>
                          <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:800, color:'#16A34A' }}>₹{outsideCollected.toLocaleString('en-IN')}</td>
                          <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:800, color:'#DC2626' }}>₹{totalExpensesAll.toLocaleString('en-IN')}</td>
                          <td style={{ padding:'9px 10px', textAlign:'right', fontWeight:800, color:netProfit>=0?'#16A34A':'#DC2626' }}>₹{netProfit.toLocaleString('en-IN')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Pending dues */}
                {pendingPayments.length > 0 && (
                  <div style={{ background:'#fff', borderRadius:18, padding:'16px 20px', border:'1.5px solid rgba(217,119,6,0.15)' }}>
                    <div style={{ fontSize:14, fontWeight:800, color:ink, marginBottom:12 }}>
                      Outstanding Dues <span style={{ fontSize:11, fontWeight:700, color:'#D97706', background:'rgba(217,119,6,0.1)', borderRadius:100, padding:'2px 7px', marginLeft:5 }}>₹{totalDue.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {pendingPayments.slice(0,5).map(o => (
                        <div key={o._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#FFFCF5', borderRadius:10, border:'1px solid rgba(217,119,6,0.1)' }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(217,119,6,0.1)', color:'#D97706', fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{o.clientName?.charAt(0)||'?'}</div>
                          <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:12.5, fontWeight:700, color:ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.clientName}</div><div style={{ fontSize:11, color:'#9B7450' }}>{o.eventType}</div></div>
                          <div style={{ fontSize:13, fontWeight:800, color:'#D97706', flexShrink:0 }}>₹{o.due.toLocaleString('en-IN')}</div>
                          {o.clientPhone && (
                            <a href={`https://wa.me/91${o.clientPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${o.clientName}, gentle reminder — ₹${o.due.toLocaleString('en-IN')} is pending for your ${o.eventType||'event'}. Thank you! 🙏`)}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ padding:'5px 10px', borderRadius:7, background:'#25D366', color:'#fff', fontSize:11, fontWeight:700, textDecoration:'none', flexShrink:0 }}>WA</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── PERFORMANCE STATS ── */}
          {tab === 'performance' && (() => {
            const totalGigs      = allGigs.length;
            const completedGigs  = allGigs.filter(g => g.status === 'Completed').length;
            const tendrCount     = bookings.length;
            const outsideCount   = outsideOrders.length;
            const avgGigValue    = outsideCount > 0 ? Math.round(outsideRevenue / outsideCount) : 0;
            const collectionRate = outsideRevenue > 0 ? Math.round((outsideCollected / outsideRevenue) * 100) : 0;
            const repeatClients  = clientList.filter(c => c.gigs.length > 1).length;
            const repeatRate     = clientList.length > 0 ? Math.round((repeatClients / clientList.length) * 100) : 0;
            const totalExpenses  = outsideOrders.reduce((s,o) => s + (o.expenses||[]).reduce((ss,e) => ss+(Number(e.amount)||0), 0), 0);
            const netProfit      = outsideCollected - totalExpenses;

            // Last 12 months across all gigs
            const now = new Date();
            const last12 = Array.from({length: 12}, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
              const lbl = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
              const cnt = allGigs.filter(g => {
                if (!g.eventDate) return false;
                const gd = new Date(g.eventDate);
                return gd.getFullYear() === d.getFullYear() && gd.getMonth() === d.getMonth();
              }).length;
              return { label: lbl, count: cnt };
            });
            const chartMax  = Math.max(...last12.map(m => m.count), 1);
            const bestMonth = [...last12].sort((a,b) => b.count - a.count)[0];

            const ink2  = '#2C1A0E';
            const gold  = '#C47A2E';
            const card  = { background:'#fff', border:'1px solid rgba(44,26,14,0.08)', borderRadius:12, padding:'18px 20px' };
            const sh    = (key, fallback) => <div style={{ fontSize:11, fontWeight:700, color:gold, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>{T[lang]?.[key] || fallback || key}</div>;

            return (
              <div style={{ padding:'0 0 40px' }}>
                <div style={{ marginBottom:22 }}>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:'1.55rem', fontWeight:600, color:ink2, margin:'0 0 4px' }}>{t('statsTitle')}</h2>
                  <p style={{ fontSize:12.5, color:'#9B7450', margin:0 }}>{lang==='hi'?'आपके सभी गिग और क्लाइंट डेटा की झलक।':'Your business at a glance — from all gigs and client data.'}</p>
                </div>

                {/* KPI row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:11, marginBottom:14 }}>
                  <Stat label={t('totalGigsL')}      value={totalGigs}    sub={`${completedGigs} ${t('completedGigsL').toLowerCase()}`}                                                             icon={dsic(<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>)}                                                                                               accent="rgba(196,122,46,0.08)" />
                  <Stat label={t('avgGigValue')}   value={avgGigValue>=1000?`₹${(avgGigValue/1000).toFixed(1)}k`:`₹${avgGigValue}`} sub={lang==='hi'?'बाहरी बुकिंग':'outside bookings'}           icon={dsic(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>)}                                                   accent="rgba(22,163,74,0.07)" />
                  <Stat label={t('collectionRate')} value={`${collectionRate}%`} sub={`₹${(outsideRevenue-outsideCollected).toLocaleString('en-IN')} ${t('outstanding').toLowerCase()}`}          icon={dsic(<><polyline points="20 6 9 17 4 12"/></>)}                                                                                                             accent={collectionRate>=80?'rgba(22,163,74,0.08)':'rgba(217,119,6,0.08)'} />
                  <Stat label={t('netProfit')}      value={netProfit>=1000?`₹${(netProfit/1000).toFixed(1)}k`:`₹${Math.max(netProfit,0)}`} sub={lang==='hi'?`₹${(totalExpenses/1000).toFixed(1)}k खर्च के बाद`:`after ₹${(totalExpenses/1000).toFixed(1)}k expenses`} icon={dsic(<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>)}                                                                             accent="rgba(196,122,46,0.08)" />
                  <Stat label={t('repeatClients')}  value={`${repeatRate}%`}    sub={lang==='hi'?`${repeatClients} में से ${clientList.length} क्लाइंट`:`${repeatClients} of ${clientList.length} clients`}                                icon={dsic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>)} accent="rgba(124,58,237,0.07)" />
                </div>

                {/* Sources + Event types */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11, marginBottom:11 }}>
                  <div style={card}>
                    {sh('bookingSources')}
                    {[
                      { label:'Via Tendr', count:tendrCount, color:gold },
                      { label:'Outside',   count:outsideCount, color:'#7C3AED' },
                    ].map(({ label, count, color }) => (
                      <div key={label} style={{ marginBottom:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:ink2 }}>{label}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:ink2 }}>{count} gig{count!==1?'s':''}</span>
                        </div>
                        <div style={{ height:6, background:'rgba(44,26,14,0.07)', borderRadius:100, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:totalGigs>0?`${(count/totalGigs)*100}%`:'0%', background:color, borderRadius:100, transition:'width 0.5s ease' }} />
                        </div>
                      </div>
                    ))}
                    {totalGigs===0 && <p style={{ fontSize:12, color:'#9B7450', marginTop:4 }}>No gigs recorded yet.</p>}
                  </div>

                  <div style={card}>
                    {sh('eventTypes')}
                    {topEventTypes.length===0
                      ? <p style={{ fontSize:12, color:'#9B7450', margin:0 }}>No outside orders yet.</p>
                      : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                          {topEventTypes.map(([type, count]) => (
                            <div key={type}>
                              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                                <span style={{ fontSize:12, fontWeight:500, color:ink2 }}>{type}</span>
                                <span style={{ fontSize:11, fontWeight:700, color:'#9B7450' }}>{count} · {evtTypeTotal>0?Math.round((count/evtTypeTotal)*100):0}%</span>
                              </div>
                              <div style={{ height:5, background:'rgba(44,26,14,0.07)', borderRadius:100, overflow:'hidden' }}>
                                <div style={{ height:'100%', width:evtTypeTotal>0?`${(count/evtTypeTotal)*100}%`:'0%', background:gold, borderRadius:100 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                </div>

                {/* Monthly bar chart */}
                <div style={{ ...card, marginBottom:11 }}>
                  {sh('monthlyActivity')}
                  {bestMonth&&bestMonth.count>0&&(
                    <p style={{ fontSize:11.5, color:'#9B7450', margin:'0 0 14px' }}>
                      Best month: <strong style={{ color:ink2 }}>{bestMonth.label}</strong> ({bestMonth.count} gig{bestMonth.count!==1?'s':''})
                    </p>
                  )}
                  {totalGigs===0
                    ? <p style={{ fontSize:12, color:'#9B7450', margin:0 }}>No gig data yet.</p>
                    : <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:88 }}>
                        {last12.map((m,i) => (
                          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%', justifyContent:'flex-end' }}>
                            <div
                              title={`${m.label}: ${m.count} gig${m.count!==1?'s':''}`}
                              style={{ width:'100%', minHeight:m.count>0?4:2, height:`${m.count>0?Math.max((m.count/chartMax)*100,6):2}%`, background:m.count>0?gold:'rgba(44,26,14,0.07)', borderRadius:'3px 3px 0 0', transition:'height 0.4s ease' }}
                            />
                            <span style={{ fontSize:8.5, color:'#9B7450', whiteSpace:'nowrap', display:'block', marginTop:5, transform:'rotate(-40deg)', transformOrigin:'top center' }}>{m.label}</span>
                          </div>
                        ))}
                      </div>
                  }
                </div>

                {/* Top clients */}
                {clientList.length>0 && (
                  <div style={{ ...card, marginBottom:11 }}>
                    {sh('topClients')}
                    {clientList.slice(0,5).map((c,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 0', borderBottom:i<Math.min(clientList.length,5)-1?'1px solid rgba(44,26,14,0.06)':'none' }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:`rgba(196,122,46,${0.12+i*0.04})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:gold }}>{(c.clientName||'?').charAt(0).toUpperCase()}</span>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:ink2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.clientName||'Unknown'}</div>
                          <div style={{ fontSize:11, color:'#9B7450' }}>{c.gigs.length} gig{c.gigs.length!==1?'s':''} · {c.lastEventType||'—'}</div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:ink2 }}>₹{c.totalSpent.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize:10, fontWeight:600, color:c.totalPaid===c.totalSpent?'#16A34A':'#D97706' }}>
                            {c.totalPaid===c.totalSpent?'Fully paid':`₹${c.totalPaid.toLocaleString('en-IN')} paid`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Placeholder cards for backend-needed metrics */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
                  {[
                    { label:'Profile Views',       icon:dsic(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>),            desc:'How many people viewed your Tendr profile' },
                    { label:'Enquiries Received',  icon:dsic(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>),                       desc:'Total leads from your Tendr listing' },
                  ].map(({ label, icon, desc }) => (
                    <div key={label} style={{ ...card, opacity:0.6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <div style={{ width:28, height:28, borderRadius:7, background:'rgba(44,26,14,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
                        <span style={{ fontSize:11, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</span>
                      </div>
                      <div style={{ fontSize:22, fontWeight:800, color:'rgba(44,26,14,0.2)', marginBottom:4 }}>—</div>
                      <div style={{ fontSize:11, color:'#9B7450' }}>{desc}</div>
                      <div style={{ marginTop:8, fontSize:10, fontWeight:700, color:gold, background:'rgba(196,122,46,0.08)', borderRadius:5, padding:'3px 8px', display:'inline-block' }}>{t('comingSoon')}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── INVENTORY / EQUIPMENT ── */}
          {tab === 'inventory' && (() => {
            const grouped = INV_CATS.reduce((acc,cat) => { acc[cat]=inventory.filter(i=>i.category===cat); return acc; }, {});
            const uncategorized = inventory.filter(i => !i.category||!INV_CATS.includes(i.category));
            return (
              <div>
                <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                  <Stat label={`Total ${typeConfig.invLabel}`} value={inventory.length} sub="in stock" icon={dsic(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>)} />
                  <Stat label="Need Service" value={inventory.filter(i=>i.condition==='Needs Service').length} sub="check soon" icon={dsic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>)} accent="rgba(217,119,6,0.1)" />
                  <Stat label="Out of Order" value={inventory.filter(i=>i.condition==='Out of Order').length} sub="needs repair" icon={dsic(<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>)} accent="rgba(220,38,38,0.08)" />
                </div>

                {inventory.length===0 ? (
                  <div style={{ background:'#fff', borderRadius:20, padding:'48px 24px', textAlign:'center', border:'1px solid rgba(196,122,46,0.12)' }}>
                    <div style={{ fontSize:44, marginBottom:12 }}>{typeConfig.invEmoji}</div>
                    <div style={{ fontSize:17, fontWeight:800, color:ink, marginBottom:8 }}>No {typeConfig.invLabel.toLowerCase()} logged yet</div>
                    <div style={{ fontSize:13, color:'#9B7450', marginBottom:20, maxWidth:360, margin:'0 auto 20px' }}>
                      Track everything you own — know what you have, what needs attention, and plan each {term.toLowerCase()} better.
                    </div>
                    <button onClick={() => setInvModal(true)} style={{ padding:'11px 24px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontFamily:font, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(196,122,46,0.35)' }}>
                      + Add First Item
                    </button>
                    <div style={{ marginTop:22, display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
                      {INV_CATS.slice(0,5).map(cat => (
                        <button key={cat} onClick={() => { setInvForm(f => ({...f, category:cat})); setInvModal(true); }}
                          style={{ padding:'6px 14px', borderRadius:100, border:'1.5px solid rgba(196,122,46,0.2)', background:'#FFFCF5', color:'#9B7450', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>
                          + {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {INV_CATS.filter(cat => grouped[cat]?.length>0).map(cat => (
                      <div key={cat}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>{cat} <span style={{ fontWeight:500, opacity:0.6 }}>({grouped[cat].length})</span></div>
                        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                          {grouped[cat].map(item => (
                            <div key={item.id} style={{ background:'#fff', borderRadius:14, padding:'11px 15px', border:'1px solid rgba(196,122,46,0.1)', display:'flex', alignItems:'center', gap:12 }}>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:13.5, fontWeight:700, color:ink }}>{item.name}</div>
                                {(item.qty>1||item.unit) && <div style={{ fontSize:11.5, color:'#9B7450', marginTop:1 }}>Qty: {item.qty}{item.unit?` ${item.unit}`:''}</div>}
                                {item.notes && <div style={{ fontSize:11, color:'#9B7450', fontStyle:'italic', marginTop:1 }}>{item.notes}</div>}
                              </div>
                              <div style={{ display:'flex', gap:5, alignItems:'center', flexShrink:0 }}>
                                {['Good','Needs Service','Out of Order'].map(c => (
                                  <button key={c} onClick={() => updateInvCond(item.id, c)} title={c}
                                    style={{ width:10, height:10, borderRadius:'50%', border:`2px solid ${item.condition===c?COND_COLOR[c].dot:'rgba(196,122,46,0.2)'}`, background:item.condition===c?COND_COLOR[c].dot:'transparent', cursor:'pointer', padding:0 }} />
                                ))}
                              </div>
                              <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:100, background:COND_COLOR[item.condition||'Good'].bg, color:COND_COLOR[item.condition||'Good'].color, flexShrink:0 }}>{item.condition||'Good'}</span>
                              <button onClick={() => removeInvItem(item.id)} style={{ width:26, height:26, borderRadius:7, border:'1px solid rgba(220,38,38,0.2)', background:'transparent', color:'#DC2626', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {uncategorized.length>0 && (
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Other</div>
                        {uncategorized.map(item => (
                          <div key={item.id} style={{ background:'#fff', borderRadius:14, padding:'11px 15px', border:'1px solid rgba(196,122,46,0.1)', display:'flex', alignItems:'center', gap:12, marginBottom:7 }}>
                            <div style={{ flex:1 }}><div style={{ fontSize:13.5, fontWeight:700, color:ink }}>{item.name}</div></div>
                            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:100, background:COND_COLOR[item.condition||'Good'].bg, color:COND_COLOR[item.condition||'Good'].color }}>{item.condition||'Good'}</span>
                            <button onClick={() => removeInvItem(item.id)} style={{ width:26, height:26, borderRadius:7, border:'1px solid rgba(220,38,38,0.2)', background:'transparent', color:'#DC2626', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── MY PAGE (Profile) ── */}
          {tab === 'profile' && (() => {
            const profileUrl = `${window.location.origin}/vendor/${vendorId}`;
            const checks = [
              { label:'Name set',        done:!!(vendorName&&vendorName!=='Vendor') },
              { label:'Service category',done:!!serviceType },
              { label:'Profile photo',   done:!!(user?.image||user?.profilePhoto) },
              { label:'City / location', done:!!(user?.city) },
              { label:'Phone number',    done:!!(user?.phoneNumber) },
            ];
            const donePct = Math.round((checks.filter(c=>c.done).length/checks.length)*100);
            return (
              <div>
                {/* Hero card */}
                <div style={{ background:`linear-gradient(135deg,${ink},#3D2510)`, borderRadius:20, padding:'22px 24px', marginBottom:20, color:'#fff' }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:6 }}>Your Public Profile</div>
                  <div style={{ fontSize:18, fontWeight:800, marginBottom:2 }}>{vendorName}</div>
                  {serviceType && <div style={{ fontSize:13, color:goldLt, fontWeight:600, marginBottom:16 }}>{serviceType}</div>}
                  <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                    <div style={{ flex:1, fontSize:12, color:'rgba(255,255,255,0.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'monospace' }}>{profileUrl}</div>
                    <button onClick={() => navigator.clipboard?.writeText(profileUrl).then(() => showToast('Copied!'))}
                      style={{ padding:'6px 14px', borderRadius:8, border:'none', background:gold, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font, whiteSpace:'nowrap', flexShrink:0 }}>Copy</button>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                      style={{ flex:1, padding:'9px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:12.5, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                      Preview
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Check out my profile on Tendr: ${profileUrl}`)}`} target="_blank" rel="noopener noreferrer"
                      style={{ flex:1, padding:'9px', borderRadius:10, border:'none', color:'#fff', fontSize:12.5, fontWeight:700, textDecoration:'none', textAlign:'center', background:'#25D366' }}>
                      Share on WhatsApp
                    </a>
                  </div>
                </div>

                {/* ── Photos & Videos ── */}
                <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)', marginBottom:20 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:ink, marginBottom:14 }}>Photos & Videos</div>

                  {/* Photos row */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, border:'1.5px solid rgba(196,122,46,0.13)', background:'#FFFCF5', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg,${gold},${goldLt})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:ink }}>Portfolio Photos</div>
                        <div style={{ fontSize:11.5, color:'#9B7450', marginTop:1 }}>
                          {photoCount === null ? 'Loading…' : photoCount === 0 ? 'No photos yet — add some to impress customers' : `${photoCount}/10 photo${photoCount!==1?'s':''} uploaded`}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => navigate('/vendor/profile?tab=portfolio')}
                      style={{ padding:'7px 14px', borderRadius:9, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:font, flexShrink:0, whiteSpace:'nowrap' }}>
                      {photoCount === 0 ? '+ Add Photos' : 'Manage'}
                    </button>
                  </div>

                  {/* Video/demo links */}
                  <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ fontSize:12.5, fontWeight:700, color:'#6B3A1F' }}>
                        {isArtist ? 'Demo Reels & Mixes' : 'Videos & Showcases'}
                      </div>
                      {mediaLinks.length < 6 && (
                        <button onClick={() => setMediaModal(true)}
                          style={{ padding:'5px 12px', borderRadius:8, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:font }}>
                          + Add Link
                        </button>
                      )}
                    </div>

                    {mediaLinks.length === 0 ? (
                      <button onClick={() => setMediaModal(true)}
                        style={{ width:'100%', padding:'14px', borderRadius:12, border:'2px dashed rgba(196,122,46,0.25)', background:'transparent', cursor:'pointer', fontFamily:font, textAlign:'center' }}>
                        <div style={{ fontSize:12.5, color:'#9B7450', fontWeight:600 }}>
                          {isArtist ? '+ Add a YouTube, Instagram, or SoundCloud link' : '+ Add a YouTube or Instagram link'}
                        </div>
                        <div style={{ fontSize:11, color:'#BDA282', marginTop:4 }}>Customers see these on your profile page</div>
                      </button>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {mediaLinks.map(m => {
                          const isYT = /youtu/.test(m.url);
                          const isIG = /instagram/.test(m.url);
                          const isSC = /soundcloud/.test(m.url);
                          const isSpotify = /spotify/.test(m.url);
                          const icon = isYT ? '▶' : isIG ? '📸' : isSC ? '🎵' : isSpotify ? '🎶' : '🔗';
                          const platform = isYT ? 'YouTube' : isIG ? 'Instagram' : isSC ? 'SoundCloud' : isSpotify ? 'Spotify' : 'Link';
                          return (
                            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:11, border:'1.5px solid rgba(196,122,46,0.13)', background:'#FFFCF5' }}>
                              <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:12.5, fontWeight:700, color:ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title || platform}</div>
                                <a href={m.url} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize:11, color:gold, textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                                  {m.url.length > 40 ? m.url.slice(0,40)+'…' : m.url}
                                </a>
                              </div>
                              <button onClick={() => removeMediaLink(m.id)}
                                style={{ width:26, height:26, borderRadius:'50%', border:'none', background:'rgba(220,38,38,0.08)', color:'#dc2626', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
                            </div>
                          );
                        })}
                        {mediaLinks.length < 6 && (
                          <button onClick={() => setMediaModal(true)}
                            style={{ padding:'9px', borderRadius:11, border:'2px dashed rgba(196,122,46,0.2)', background:'transparent', cursor:'pointer', fontFamily:font, fontSize:12, color:'#9B7450', fontWeight:600 }}>
                            + Add another link
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Completeness */}
                <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)', marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:ink }}>Profile Completeness</div>
                    <div style={{ fontSize:13, fontWeight:800, color:donePct===100?'#16A34A':gold }}>{donePct}%</div>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'rgba(196,122,46,0.1)', marginBottom:14, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:3, background:donePct===100?'#16A34A':`linear-gradient(90deg,${gold},${goldLt})`, width:`${donePct}%`, transition:'width 0.5s ease' }} />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {checks.map(c => (
                      <div key={c.label} style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:c.done?'rgba(22,163,74,0.1)':'rgba(196,122,46,0.07)', border:`1.5px solid ${c.done?'#16A34A':'rgba(196,122,46,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {c.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <span style={{ fontSize:12.5, color:c.done?ink:'#9B7450', fontWeight:c.done?600:400, flex:1 }}>{c.label}</span>
                        {!c.done && <button onClick={() => navigate('/vendor/profile')} style={{ fontSize:11, color:gold, fontWeight:700, background:'none', border:'none', cursor:'pointer', fontFamily:font, padding:0 }}>Add →</button>}
                      </div>
                    ))}
                  </div>
                  {donePct<100 && <button onClick={() => navigate('/vendor/profile')} style={{ marginTop:14, width:'100%', padding:'10px', borderRadius:10, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontFamily:font, fontSize:13, fontWeight:700, cursor:'pointer' }}>Complete Profile →</button>}
                </div>

                {/* Type-specific profile tools */}
                <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)', marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <span style={{ fontSize:20 }}>{typeConfig.emoji}</span>
                    <div style={{ fontSize:14, fontWeight:800, color:ink }}>{serviceType || 'Your'} Profile Tools</div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {typeConfig.profileTools.map(a => (
                      <button key={a.label} onClick={() => navigate('/vendor/profile')}
                        style={{ padding:'14px', borderRadius:12, border:'1.5px solid rgba(196,122,46,0.15)', background:'#FFFCF5', color:ink, textAlign:'left', cursor:'pointer', fontFamily:font, transition:'all 0.15s' }}>
                        <div style={{ color:gold, marginBottom:6 }}>{dsic(a.icon)}</div>
                        <div style={{ fontSize:13, fontWeight:700 }}>{a.label}</div>
                        <div style={{ fontSize:11, color:'#9B7450', marginTop:2 }}>{a.sub}</div>
                      </button>
                    ))}
                  </div>
                  {/* Quick tips for this type */}
                  {typeConfig.quickTips?.length > 0 && (
                    <div style={{ marginTop:14, borderTop:'1px solid rgba(196,122,46,0.08)', paddingTop:12 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Tips for {serviceType||'your business'}</div>
                      {typeConfig.quickTips.map((tip,i) => (
                        <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:i<typeConfig.quickTips.length-1?6:0 }}>
                          <span style={{ color:gold, fontSize:12, flexShrink:0, marginTop:1 }}>→</span>
                          <span style={{ fontSize:12, color:'#6B3A1F' }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* My Plan */}
                {(() => {
                  const isPro = !!(user?.isPro || user?.plan === 'pro' || user?.subscriptionActive);
                  const FREE_FEATURES = [
                    { label:'Listed on Tendr', included:true },
                    { label:'Public profile page', included:true },
                    { label:'Customer enquiries via chat', included:true },
                    { label:'All bookings in one place — Tendr + outside', included:isPro, lockMsg:'₹399/mo' },
                    { label:'Invoice & quote PDF generation', included:isPro, lockMsg:'₹399/mo' },
                    { label:'Profit per booking & P&L tracking', included:isPro, lockMsg:'₹399/mo' },
                    { label:`${isArtist?'Equipment':'Inventory'} tracker`, included:isPro, lockMsg:'₹399/mo' },
                    { label:'Promoted placement in search', included:isPro, lockMsg:'₹399/mo' },
                  ];
                  return (
                    <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:`1.5px solid ${isPro?'rgba(22,163,74,0.2)':'rgba(196,122,46,0.18)'}`, marginBottom:20 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:800, color:ink }}>My Plan</div>
                          <div style={{ fontSize:11, color:'#9B7450', marginTop:1 }}>Tendr Business Dashboard</div>
                        </div>
                        <span style={{ padding:'4px 13px', borderRadius:100, background:isPro?'rgba(22,163,74,0.1)':'rgba(196,122,46,0.1)', color:isPro?'#16A34A':gold, fontSize:12, fontWeight:700 }}>{isPro ? 'Pro ✓' : 'Free'}</span>
                      </div>
                      {!isPro && (
                        <div style={{ fontSize:12, color:'#6B3A1F', lineHeight:1.55, marginBottom:14, padding:'10px 12px', background:'rgba(196,122,46,0.05)', borderRadius:9, border:'1px solid rgba(196,122,46,0.12)' }}>
                          Whether the booking comes from Tendr, WhatsApp, Instagram or a referral — run your entire event business from one place.
                        </div>
                      )}
                      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:isPro?0:14 }}>
                        {FREE_FEATURES.map(f => (
                          <div key={f.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:16, height:16, borderRadius:'50%', background:f.included?'rgba(22,163,74,0.1)':'rgba(196,122,46,0.06)', border:`1.5px solid ${f.included?'#16A34A':'rgba(196,122,46,0.18)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              {f.included
                                ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                                : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9B7450" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              }
                            </div>
                            <span style={{ fontSize:12.5, color:f.included?ink:'#9B7450', fontWeight:f.included?500:400, flex:1 }}>{f.label}</span>
                            {f.lockMsg && !f.included && <span style={{ fontSize:10.5, color:'#D97706', fontWeight:700 }}>{f.lockMsg}</span>}
                          </div>
                        ))}
                      </div>
                      {!isPro && (
                        <button style={{ marginTop:2, width:'100%', padding:'12px', borderRadius:11, border:'none', background:`linear-gradient(135deg,${gold},${goldLt})`, color:'#fff', fontFamily:font, fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 3px 14px rgba(196,122,46,0.3)' }}>
                          Run your event business on Tendr — ₹399/mo
                        </button>
                      )}
                      {!isPro && <div style={{ textAlign:'center', fontSize:11, color:'#9B7450', marginTop:6 }}>Cancel anytime · No hidden fees · Instant activation</div>}
                      {isPro && <div style={{ marginTop:6, fontSize:12, color:'#16A34A', fontWeight:600, textAlign:'center' }}>All Pro features active ✓</div>}
                    </div>
                  );
                })()}

                {/* Reviews */}
                <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid rgba(196,122,46,0.12)' }}>
                  <div style={{ fontSize:14, fontWeight:800, color:ink, marginBottom:4 }}>Reviews</div>
                  <div style={{ fontSize:12, color:'#9B7450', marginBottom:12 }}>Customers who book you through Tendr can leave reviews visible on your profile.</div>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', padding:'9px 16px', borderRadius:10, border:`1.5px solid ${gold}`, color:gold, fontFamily:font, fontSize:13, fontWeight:700, textDecoration:'none' }}>View Public Profile →</a>
                </div>
              </div>
            );
          })()}

          {/* ── AVAILABILITY ── */}
          {tab === 'calendar' && (
            <div>
              <div style={{ fontSize:13, color:'#9B7450', marginBottom:16 }}>Block dates you're booked. Customers see your availability before reaching out. Each day has Morning (10AM–2PM) and Evening (4PM–9PM) slots.</div>
              <div style={{ background:'#fff', borderRadius:18, padding:'20px', border:'1px solid rgba(196,122,46,0.12)' }}>
                <VendorAvailabilityCalendar vendorId={vendorId} isVendorView token={token} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      {isMobile && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid rgba(196,122,46,0.12)', display:'flex', zIndex:200, paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
          {NAV_ITEMS.map(item => {
            const active = tab===item.key;
            return (
              <button key={item.key} onClick={() => setTab(item.key)}
                style={{ flex:1, padding:'8px 2px 10px', border:'none', background:'transparent', cursor:'pointer', fontFamily:font, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ color:active?gold:'#BDA282', display:'flex' }}>{item.icon}</span>
                <span style={{ fontSize:9.5, fontWeight:active?700:500, color:active?gold:'#9B7450' }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{ position:'fixed', top:16, right:16, zIndex:9999, padding:'12px 20px', borderRadius:12, background:toast.ok?'#166534':'#991B1B', color:'#fff', fontSize:14, fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>{toast.ok?'✓':'✕'} {toast.msg}</div>}

      {/* Order Modal */}
      {modal && (
        <OrderModal
          initial={modal==='add'?null:{...modal, eventDate:modal.eventDate?new Date(modal.eventDate).toISOString().split('T')[0]:'', amount:modal.amount||'', paidAmount:modal.paidAmount||''}}
          onSave={saveOrder} onClose={() => setModal(null)} saving={saving} existingClients={outsideOrders} serviceType={user?.serviceType||''}
        />
      )}

      {/* Add Media Link Modal */}
      {mediaModal && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(28,9,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setMediaModal(false)}>
          <div style={{ width:'100%', maxWidth:420, background:cream, borderRadius:20, boxShadow:'0 24px 60px rgba(0,0,0,0.22)', fontFamily:font, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid rgba(196,122,46,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:16, fontWeight:800, color:ink }}>Add Video / Demo Link</div>
              <button onClick={() => setMediaModal(false)} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(196,122,46,0.1)', border:'none', cursor:'pointer', fontSize:16, color:'#9B7450' }}>×</button>
            </div>
            <div style={{ padding:'18px 22px 22px', display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ fontSize:12, color:'#9B7450', lineHeight:1.5 }}>
                {isArtist
                  ? 'Paste a YouTube, Instagram Reel, SoundCloud, or Spotify link to your best work.'
                  : 'Paste a YouTube or Instagram link showcasing your work.'}
              </div>
              <div>
                <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#6B3A1F', marginBottom:4 }}>Link Title (optional)</label>
                <input
                  style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid rgba(196,122,46,0.25)', fontFamily:font, fontSize:13.5, color:ink, outline:'none', background:'#FFFCF5', boxSizing:'border-box' }}
                  value={mediaForm.title}
                  onChange={e => setMediaForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={isArtist ? 'e.g. New Year Eve Set 2025' : 'e.g. Wedding Decor Showcase'}
                />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#6B3A1F', marginBottom:4 }}>URL *</label>
                <input
                  style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid rgba(196,122,46,0.25)', fontFamily:font, fontSize:13, color:ink, outline:'none', background:'#FFFCF5', boxSizing:'border-box' }}
                  value={mediaForm.url}
                  onChange={e => setMediaForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://youtube.com/... or https://instagram.com/..."
                  type="url"
                  autoFocus
                />
              </div>
              <button onClick={addMediaLink} disabled={!mediaForm.url.trim()}
                style={{ padding:'12px', borderRadius:12, border:'none', background:mediaForm.url.trim()?`linear-gradient(135deg,${gold},${goldLt})`:'rgba(196,122,46,0.2)', color:'#fff', fontFamily:font, fontSize:14, fontWeight:800, cursor:mediaForm.url.trim()?'pointer':'default', boxShadow:mediaForm.url.trim()?'0 3px 12px rgba(196,122,46,0.35)':'none' }}>
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Request Modal */}
      {payReqModal && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(28,9,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setPayReqModal(null)}>
          <div style={{ width:'100%', maxWidth:420, background:cream, borderRadius:20, boxShadow:'0 24px 60px rgba(0,0,0,0.22)', fontFamily:font }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid rgba(196,122,46,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:ink }}>Request Payment</div>
                <div style={{ fontSize:11.5, color:'#9B7450', marginTop:1 }}>{payReqModal.order?.clientName} · ₹{payReqModal.pendingAmt?.toLocaleString('en-IN')} pending</div>
              </div>
              <button onClick={() => setPayReqModal(null)} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(196,122,46,0.1)', border:'none', cursor:'pointer', fontSize:16, color:'#9B7450' }}>×</button>
            </div>
            <div style={{ padding:'18px 22px 22px', display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6B3A1F', marginBottom:4 }}>Your UPI ID</label>
                <input
                  style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid rgba(196,122,46,0.25)', fontFamily:font, fontSize:13.5, color:ink, outline:'none', background:'#FFFCF5', boxSizing:'border-box' }}
                  value={vendorUPI}
                  onChange={e => saveUPI(e.target.value)}
                  placeholder="yourname@upi or phone@bank"
                  autoFocus
                />
                <div style={{ fontSize:11, color:'#9B7450', marginTop:3 }}>e.g. 9876543210@paytm · saved for next time</div>
              </div>
              {vendorUPI.trim() && (() => {
                const amt = payReqModal.pendingAmt;
                const desc = `${payReqModal.order?.eventType||'Event'} advance — ${vendorName}`;
                const upiLink = `upi://pay?pa=${encodeURIComponent(vendorUPI)}&pn=${encodeURIComponent(vendorName)}&am=${amt}&tn=${encodeURIComponent(desc)}&cu=INR`;
                const waMsg = `Hi ${payReqModal.order?.clientName}, please pay ₹${amt.toLocaleString('en-IN')} for ${payReqModal.order?.eventType||'your event'} using UPI:\n\nUPI ID: *${vendorUPI}*\nAmount: *₹${amt.toLocaleString('en-IN')}*\n\nOr use this link (works on UPI apps):\n${upiLink}\n\nThank you! 🙏`;
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(196,122,46,0.06)', border:'1px solid rgba(196,122,46,0.15)' }}>
                      <div style={{ fontSize:10.5, fontWeight:700, color:'#9B7450', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Payment Details</div>
                      <div style={{ fontSize:12.5, color:ink, marginBottom:3 }}><strong>To:</strong> {vendorUPI}</div>
                      <div style={{ fontSize:12.5, color:ink, marginBottom:3 }}><strong>Amount:</strong> ₹{amt.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize:12, color:'#9B7450' }}><strong>Note:</strong> {desc}</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <a href={upiLink} style={{ flex:1, padding:'10px', borderRadius:10, border:`1.5px solid ${gold}`, color:gold, fontFamily:font, fontSize:12.5, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                        Open UPI App
                      </a>
                      <a href={`https://wa.me/91${(payReqModal.order?.clientPhone||'').replace(/\D/g,'')}?text=${encodeURIComponent(waMsg)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'#25D366', color:'#fff', fontFamily:font, fontSize:12.5, fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                        Send via WhatsApp
                      </a>
                    </div>
                    <button onClick={() => { navigator.clipboard?.writeText(upiLink).then(() => showToast('UPI link copied!')); }}
                      style={{ padding:'9px', borderRadius:10, border:'1.5px solid rgba(196,122,46,0.2)', background:'transparent', color:'#9B7450', fontFamily:font, fontSize:12.5, fontWeight:600, cursor:'pointer' }}>
                      Copy UPI Link
                    </button>
                  </div>
                );
              })()}
              {!vendorUPI.trim() && <div style={{ fontSize:12, color:'#9B7450', textAlign:'center', padding:'8px 0' }}>Enter your UPI ID above to generate a payment link</div>}
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {quoteModal && (
        <QuoteModal
          initial={editQuote}
          onSave={addOrUpdateQuote}
          onClose={() => { setQuoteModal(false); setEditQuote(null); }}
        />
      )}

      {/* Inventory Add Modal */}
      {invModal && (
        <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(28,9,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setInvModal(false)}>
          <div style={{ width:'100%', maxWidth:440, background:cream, borderRadius:20, boxShadow:'0 24px 60px rgba(0,0,0,0.22)', fontFamily:font, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid rgba(196,122,46,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:16, fontWeight:800, color:ink }}><span style={{ marginRight:6 }}>{typeConfig.invEmoji}</span>Add {typeConfig.invLabel} Item</div>
              <button onClick={() => setInvModal(false)} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(196,122,46,0.1)', border:'none', cursor:'pointer', fontSize:16, color:'#9B7450' }}>×</button>
            </div>
            <div style={{ padding:'16px 22px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              {(() => {
                const inp2 = { width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid rgba(196,122,46,0.25)', fontFamily:font, fontSize:13.5, color:ink, outline:'none', background:'#FFFCF5', boxSizing:'border-box' };
                const lbl2 = { display:'block', fontSize:11.5, fontWeight:700, color:'#6B3A1F', marginBottom:4 };
                return (<>
                  <div>
                    <label style={lbl2}>Item Name *</label>
                    <input style={inp2} value={invForm.name} onChange={e => setInvForm(f=>({...f,name:e.target.value}))} placeholder={typeConfig.invPlaceholder} autoFocus />
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <div style={{ flex:1 }}><label style={lbl2}>Quantity</label><input style={inp2} type="number" min="1" value={invForm.qty} onChange={e => setInvForm(f=>({...f,qty:e.target.value}))} /></div>
                    <div style={{ flex:1 }}><label style={lbl2}>Unit (optional)</label><input style={inp2} value={invForm.unit} onChange={e => setInvForm(f=>({...f,unit:e.target.value}))} placeholder="units, pcs, kg…" /></div>
                  </div>
                  <div>
                    <label style={lbl2}>Category</label>
                    <select style={inp2} value={invForm.category} onChange={e => setInvForm(f=>({...f,category:e.target.value}))}>
                      <option value="">Select category</option>
                      {INV_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl2}>Condition</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {['Good','Needs Service','Out of Order'].map(c => {
                        const cc = COND_COLOR[c];
                        const active = invForm.condition===c;
                        return <button key={c} onClick={() => setInvForm(f=>({...f,condition:c}))} style={{ flex:1, padding:'7px 4px', borderRadius:9, fontSize:11.5, fontWeight:700, fontFamily:font, cursor:'pointer', border:'1.5px solid', borderColor:active?cc.dot:'rgba(196,122,46,0.2)', background:active?cc.bg:'transparent', color:active?cc.color:'#9B7450', transition:'all 0.15s' }}>{c}</button>;
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={lbl2}>Notes (optional)</label>
                    <input style={inp2} value={invForm.notes} onChange={e => setInvForm(f=>({...f,notes:e.target.value}))} placeholder={isArtist?'Serial no, purchase year, rack location…':'Supplier, storage location…'} />
                  </div>
                  <button onClick={addInvItem} disabled={!invForm.name.trim()}
                    style={{ padding:'12px', borderRadius:12, border:'none', background:invForm.name.trim()?`linear-gradient(135deg,${gold},${goldLt})`:'rgba(196,122,46,0.2)', color:'#fff', fontFamily:font, fontSize:14, fontWeight:800, cursor:invForm.name.trim()?'pointer':'default', boxShadow:invForm.name.trim()?'0 3px 12px rgba(196,122,46,0.35)':'none' }}>
                    Add Item
                  </button>
                </>);
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

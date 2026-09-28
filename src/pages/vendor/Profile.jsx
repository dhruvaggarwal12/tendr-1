import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LOCATION_OPTIONS = [
  "Delhi", "Noida", "Gurgaon", "Ghaziabad",
  "Greater Noida", "South Delhi", "North Delhi", "East Delhi", "West Delhi",
];

const SERVICE_TYPE_LABELS = {
  DJ: "DJ", Decorator: "Decorator", Photographer: "Photographer",
  Caterer: "Caterer", GiftHamper: "Gift Hamper", Cake: "Cake",
  Emcee: "Emcee", Anchor: "Anchor", Band: "Band", Choreographer: "Choreographer",
  Performer: "Performer", Musician: "Musician", Singer: "Singer", Comedian: "Comedian",
};

const ALL_VENDOR_TYPES = [
  'DJ', 'Anchor', 'Emcee/Host', 'Band', 'Singer', 'Musician', 'Performer', 'Choreographer',
  'Stand-up Comedian', 'Magician', 'AV Setup',
  'Photographer', 'Videographer', 'Decorator', 'Caterer', 'Makeup Artist',
  'Mehendi Artist', 'Hair Stylist', 'Cake Artist', 'Bartender',
  'Wedding Planner', 'Food Truck', 'Photo Booth', 'Live Streaming',
  'Gift & Favours', 'Transportation', 'Security',
];

const GIG_PRO_TYPES = ['DJ', 'Emcee/Host', 'Anchor', 'Band', 'Choreographer', 'Performer', 'Musician', 'Singer', 'Stand-up Comedian', 'Magician', 'AV Setup'];

const GIG_GENRE_OPTIONS = ['Bollywood', 'EDM', 'Classical', 'Hip-Hop', 'Sufi', 'Punjabi', 'Jazz', 'Rock', 'Pop', 'Folk', 'Ghazal', 'Devotional'];
const GIG_LANG_OPTIONS = ['Hindi', 'English', 'Punjabi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Marathi'];
const GIG_STYLE_OPTIONS = {
  DJ:                  ['Indoor', 'Outdoor', 'Wedding', 'Corporate', 'Club', 'Festival'],
  'Emcee/Host':        ['Formal', 'Casual', 'Bilingual', 'Interactive', 'High-energy'],
  Anchor:              ['Formal', 'Casual', 'Bilingual', 'Scripted', 'Improvised'],
  Band:                ['Live Band', 'Cover Songs', 'Original Compositions', 'Jazz Set', 'Bollywood Night', 'Sufi Night'],
  Choreographer:       ['Bollywood', 'Contemporary', 'Hip-Hop', 'Classical', 'Wedding Sangeet', 'Couple Dance', 'Group Choreography'],
  Performer:           ['Stage Act', 'Walk Act', 'Flash Mob', 'Stunt', 'Dance', 'Comedy', 'Circus'],
  Musician:            ['Solo', 'Duo', 'Ensemble', 'Classical', 'Fusion', 'Acoustic'],
  Singer:              ['Solo Vocals', 'Duet', 'Background Vocals', 'Live Looping', 'Classical', 'Ghazal'],
  'Stand-up Comedian': ['Stand-Up', 'Roast', 'Mimicry', 'Improv', 'Corporate Safe', 'Open Mic'],
  Magician:            ['Close-up Magic', 'Stage Illusions', 'Mentalism', "Children's Show", 'Corporate Magic', 'Escape Act'],
  'AV Setup':          ['Basic', 'Standard', 'Premium', 'Full Production'],
};

export default function VendorProfile() {
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector((s) => s.auth);
  const vendorId   = user?._id || user?.id;
  const [tab, setTab]       = useState(() => { const t = searchParams.get('tab'); return (!t || t === 'portfolio') ? 'info' : t; });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [profile, setProfile]   = useState(null);

  const [form, setForm] = useState({
    name: "", yearsOfExperience: "", teamSize: "",
    upiId: "", city: "", state: "", serviceType: "",
  });
  const [gigForm, setGigForm] = useState({
    performingStyle: [], genres: [], languages: [],
    instruments: [], danceStyles: [], eventTypes: [],
    bandSize: "", bio: "", socialLink: "", showreel: "",
    setupType: "", lightsIncluded: "", setlist: "",
  });
  const [svcForm, setSvcForm] = useState({
    // Photographer
    photoServices: "", photographyType: [], hoursIncluded: "", editingTime: "",
    // Caterer
    cuisineTypes: [], cateringServiceType: [], menuType: [], beverage: "",
    // Decorator
    decorTypes: [], venueCoverage: [],
    // Makeup Artist
    makeupSpecialisations: [], makeupBrands: [], makeupAudience: [], makeupTrialAvailable: "",
    // Mehendi Artist
    mehendiStyles: [], mehendiCoverage: [], mehendiConeType: "", mehendiGroupBooking: "",
    // Hair Stylist
    hairServices: [], hairTypes: [], hairTravelAvailable: "",
    // Cake Artist
    cakeStyles: [], cakeFlavours: [], cakeMinOrder: "", cakeLeadTime: "",
    // Bartender
    bartenderServices: [], bartenderBarEquipment: "", bartenderEventTypes: [], bartenderCertified: "",
    // Videographer
    videoStyle: [], videoPackages: [], videoDroneAvailable: "", videoDeliveryDays: "",
    // Food Truck
    foodCounterTypes: [], foodMinPax: "", foodSpaceNeeded: "", foodPowerNeeded: "",
    // Wedding Planner
    plannerServices: [], plannerBudgetRange: [], plannerEventTypes: [],
    // Live Streaming
    streamPlatforms: [], streamCameraCount: "", streamResolution: "", streamBackupInternet: "",
    // Photo Booth
    boothTypes: [], boothPrints: "", boothBrandedOverlay: "", boothPropBox: "",
    // Gift & Favours
    giftOccasions: [], giftCustomisation: [], giftMinOrder: "", giftDelivery: "",
    // Transportation
    transportVehicles: [], transportDecoration: "", transportServiceArea: [],
    // Security
    securityServices: [], securityTeamSize: "", securityCertified: "", securityArmed: "",
  });
  const [locations, setLocations] = useState([]);
  const [locInput, setLocInput]   = useState("");

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    fetch(`${BASE_URL}/vendors/${vendorId}`, {
      credentials: "include",
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(v => {
        setProfile(v);
        setForm({
          name: v.name || "",
          yearsOfExperience: v.yearsOfExperience ?? "",
          teamSize: v.teamSize ?? "",
          upiId: v.upiId || "",
          city: v.address?.city || "",
          state: v.address?.state || "",
          serviceType: v.serviceType || "",
        });
        setGigForm({
          performingStyle: v.performingStyle || [],
          genres:          v.genres || [],
          languages:       v.languages || [],
          instruments:     v.instruments || [],
          danceStyles:     v.danceStyles || [],
          eventTypes:      v.eventTypes || [],
          bandSize:        v.bandSize || "",
          bio:             v.bio || "",
          socialLink:      v.socialLink || "",
          showreel:        v.showreel || "",
          setupType:       v.setupType || "",
          lightsIncluded:  v.lightsIncluded || "",
          setlist:         v.setlist || "",
        });
        setSvcForm({
          photoServices:        v.photoServices || "",
          photographyType:      v.photographyType || [],
          hoursIncluded:        v.hoursIncluded || "",
          editingTime:          v.editingTime || "",
          cuisineTypes:         v.cuisineTypes || [],
          cateringServiceType:  v.cateringServiceType || [],
          menuType:             v.menuType || [],
          beverage:             v.beverage || "",
          decorTypes:           v.decorTypes || [],
          venueCoverage:        v.venueCoverage || [],
          makeupSpecialisations: v.makeupSpecialisations || [],
          makeupBrands:         v.makeupBrands || [],
          makeupAudience:       v.makeupAudience || [],
          makeupTrialAvailable: v.makeupTrialAvailable || "",
          mehendiStyles:        v.mehendiStyles || [],
          mehendiCoverage:      v.mehendiCoverage || [],
          mehendiConeType:      v.mehendiConeType || "",
          mehendiGroupBooking:  v.mehendiGroupBooking || "",
          hairServices:         v.hairServices || [],
          hairTypes:            v.hairTypes || [],
          hairTravelAvailable:  v.hairTravelAvailable || "",
          cakeStyles:           v.cakeStyles || [],
          cakeFlavours:         v.cakeFlavours || [],
          cakeMinOrder:         v.cakeMinOrder || "",
          cakeLeadTime:         v.cakeLeadTime || "",
          bartenderServices:    v.bartenderServices || [],
          bartenderBarEquipment:v.bartenderBarEquipment || "",
          bartenderEventTypes:  v.bartenderEventTypes || [],
          bartenderCertified:   v.bartenderCertified || "",
          videoStyle:           v.videoStyle || [],
          videoPackages:        v.videoPackages || [],
          videoDroneAvailable:  v.videoDroneAvailable || "",
          videoDeliveryDays:    v.videoDeliveryDays || "",
          foodCounterTypes:     v.foodCounterTypes || [],
          foodMinPax:           v.foodMinPax || "",
          foodSpaceNeeded:      v.foodSpaceNeeded || "",
          foodPowerNeeded:      v.foodPowerNeeded || "",
          plannerServices:      v.plannerServices || [],
          plannerBudgetRange:   v.plannerBudgetRange || [],
          plannerEventTypes:    v.plannerEventTypes || [],
          streamPlatforms:      v.streamPlatforms || [],
          streamCameraCount:    v.streamCameraCount || "",
          streamResolution:     v.streamResolution || "",
          streamBackupInternet: v.streamBackupInternet || "",
          boothTypes:           v.boothTypes || [],
          boothPrints:          v.boothPrints || "",
          boothBrandedOverlay:  v.boothBrandedOverlay || "",
          boothPropBox:         v.boothPropBox || "",
          giftOccasions:        v.giftOccasions || [],
          giftCustomisation:    v.giftCustomisation || [],
          giftMinOrder:         v.giftMinOrder || "",
          giftDelivery:         v.giftDelivery || "",
          transportVehicles:    v.transportVehicles || [],
          transportDecoration:  v.transportDecoration || "",
          transportServiceArea: v.transportServiceArea || [],
          securityServices:     v.securityServices || [],
          securityTeamSize:     v.securityTeamSize || "",
          securityCertified:    v.securityCertified || "",
          securityArmed:        v.securityArmed || "",
        });
        setLocations(v.locations || []);
      })
      .catch(() => showToast("Failed to load profile", false))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveInfo = async () => {
    setSaving(true);
    try {
      const currentType = form.serviceType || profile?.serviceType;
      const isGig = GIG_PRO_TYPES.includes(currentType);
      const SVC_TYPES = ['Photographer','Caterer','Decorator','Makeup Artist','Mehendi Artist','Hair Stylist','Cake Artist','Bartender','Videographer','Food Truck','Wedding Planner','Live Streaming','Photo Booth','Gift & Favours','Transportation','Security'];
      const isSvc = SVC_TYPES.includes(currentType);
      const body = {
        name: form.name,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        teamSize: Number(form.teamSize) || 0,
        upiId: form.upiId,
        locations,
        address: { city: form.city, state: form.state },
        serviceType: form.serviceType || undefined,
        ...(isGig ? {
          performingStyle: gigForm.performingStyle,
          genres:          gigForm.genres,
          languages:       gigForm.languages,
          instruments:     gigForm.instruments,
          danceStyles:     gigForm.danceStyles,
          eventTypes:      gigForm.eventTypes,
          bandSize:        gigForm.bandSize,
          bio:             gigForm.bio,
          socialLink:      gigForm.socialLink,
          showreel:        gigForm.showreel,
          setupType:       gigForm.setupType,
          lightsIncluded:  gigForm.lightsIncluded,
        } : {}),
        ...(isSvc ? { ...svcForm } : {}),
      };
      const r = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();

      if (isGig) {
        const gigBody = {
          bio:            gigForm.bio,
          genres:         gigForm.genres,
          performingStyle:gigForm.performingStyle,
          instruments:    gigForm.instruments,
          languages:      gigForm.languages,
          danceStyles:    gigForm.danceStyles,
          bandSize:       gigForm.bandSize,
          showreel:       gigForm.showreel,
          socialLink:     gigForm.socialLink,
          eventTypes:     gigForm.eventTypes,
          setlist:        gigForm.setlist,
        };
        const rGig = await fetch(`${BASE_URL}/vendors/${vendorId}/gigpro`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          credentials: "include",
          body: JSON.stringify(gigBody),
        });
        if (!rGig.ok) throw new Error();
      }

      setProfile(p => ({ ...p, serviceType: form.serviceType || p?.serviceType }));
      showToast("Profile saved!");
    } catch {
      showToast("Failed to save. Try again.", false);
    } finally {
      setSaving(false);
    }
  };

  const addLocation = (loc) => {
    if (loc && !locations.includes(loc)) setLocations(l => [...l, loc]);
    setLocInput("");
  };
  const removeLocation = (loc) => setLocations(l => l.filter(x => x !== loc));

  const setGig = (k, v) => setGigForm(f => ({ ...f, [k]: v }));
  const toggleGig = (k, val) => setGigForm(f => ({ ...f, [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val] }));
  const setSvc = (k, v) => setSvcForm(f => ({ ...f, [k]: v }));
  const toggleSvc = (k, val) => setSvcForm(f => ({ ...f, [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val] }));

  const ChipPicker = ({ label, field, options }) => (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = gigForm[field]?.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggleGig(field, opt)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${active ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  const ChipSingle = ({ label, field, options }) => (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = svcForm[field] === opt;
          return (
            <button key={opt} type="button" onClick={() => setSvc(field, active ? "" : opt)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${active ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  const ChipMulti = ({ label, field, options }) => (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = svcForm[field]?.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggleSvc(field, opt)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${active ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "12px 20px", borderRadius: 12, background: toast.ok ? "#16a34a" : "#dc2626", color: "#fff", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
          {toast.ok ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/vendor/dashboard")} className="text-yellow-700 hover:text-yellow-900 font-semibold text-sm flex items-center gap-1">
              ← Dashboard
            </button>
            <img src={logo} alt="tendr" className="h-9" />
            <span className="text-xl font-bold text-gray-800">My Profile</span>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
            {SERVICE_TYPE_LABELS[profile?.serviceType] || profile?.serviceType || "Vendor"}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            ["info", "About Me"],
            ...(GIG_PRO_TYPES.includes(profile?.serviceType) ? [["setlist", "Setlist"]] : []),
            ["bank", "Bank & Payments"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${tab === id ? "bg-yellow-500 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── About Me Tab ── */}
        {tab === "info" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Business Name</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Service Type</label>
                <select value={form.serviceType} onChange={e => set("serviceType", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm bg-white">
                  <option value="">— Select type —</option>
                  {ALL_VENDOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Years of Experience</label>
                <input type="number" min="0" value={form.yearsOfExperience} onChange={e => set("yearsOfExperience", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Team Size</label>
                <input type="number" min="1" value={form.teamSize} onChange={e => set("teamSize", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">City</label>
                <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Noida" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">State</label>
                <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="e.g. Uttar Pradesh" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
              </div>
            </div>

            {/* Service areas */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Service Areas</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {locations.map(loc => (
                  <span key={loc} className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {loc}
                    <button onClick={() => removeLocation(loc)} className="text-yellow-600 hover:text-yellow-900 leading-none">×</button>
                  </span>
                ))}
                {locations.length === 0 && <span className="text-sm text-gray-400">No areas added yet</span>}
              </div>
              <div className="flex gap-2">
                <select value={locInput} onChange={e => setLocInput(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm">
                  <option value="">Select an area to add…</option>
                  {LOCATION_OPTIONS.filter(l => !locations.includes(l)).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <button onClick={() => addLocation(locInput)} disabled={!locInput} className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-yellow-600 transition-colors">
                  Add
                </button>
              </div>
            </div>

            {/* ── Performance Details (gig pros only) ── */}
            {GIG_PRO_TYPES.includes(profile?.serviceType) && (() => {
              const svc = profile.serviceType;
              const styleOpts = GIG_STYLE_OPTIONS[svc] || [];
              return (
                <>
                  <hr className="my-8 border-gray-100" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Performance Details</h3>
                  <p className="text-sm text-gray-500 mb-6">Help customers understand exactly what you offer — this info shows on your public profile.</p>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">About You <span className="text-gray-400 font-normal">(shown on your profile)</span></label>
                    <textarea value={gigForm.bio} onChange={e => setGig("bio", e.target.value)} rows={3}
                      placeholder={`Tell customers about your ${svc?.toLowerCase()} journey, style, and what makes you special...`}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm resize-none" />
                  </div>

                  {styleOpts.length > 0 && <ChipPicker label="Performing Style" field="performingStyle" options={styleOpts} />}
                  {['DJ', 'Band', 'Musician', 'Singer'].includes(svc) && <ChipPicker label="Music Genres" field="genres" options={GIG_GENRE_OPTIONS} />}

                  {['Band', 'Musician'].includes(svc) && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Instruments <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                      <input value={gigForm.instruments?.join(', ')} onChange={e => setGig("instruments", e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="e.g. Guitar, Tabla, Keyboard, Violin" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                  )}

                  {svc === 'Band' && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Number of Members</label>
                      <input type="number" min="1" value={gigForm.bandSize} onChange={e => setGig("bandSize", e.target.value)}
                        placeholder="e.g. 5" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                  )}

                  {svc === 'Choreographer' && (
                    <ChipPicker label="Dance Styles" field="danceStyles" options={['Bollywood', 'Classical', 'Contemporary', 'Hip-Hop', 'Salsa', 'Couple Dance', 'Group']} />
                  )}

                  {['Emcee/Host', 'Anchor', 'Singer', 'Stand-up Comedian'].includes(svc) && <ChipPicker label="Languages" field="languages" options={GIG_LANG_OPTIONS} />}

                  <ChipPicker label="Suitable For" field="eventTypes"
                    options={['Wedding', 'Birthday', 'Corporate', 'Festival', 'College Event', 'Private Party', 'Sangeet', 'Anniversary', 'Award Night']} />

                  {svc === 'DJ' && (<>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Setup Type</label>
                      <div className="flex gap-2 flex-wrap">
                        {['Basic Setup','Full Production'].map(opt => (
                          <button key={opt} type="button" onClick={() => setGig("setupType", gigForm.setupType === opt ? "" : opt)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${gigForm.setupType === opt ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Lights Included?</label>
                      <div className="flex gap-2">
                        {['Yes','No'].map(opt => (
                          <button key={opt} type="button" onClick={() => setGig("lightsIncluded", gigForm.lightsIncluded === opt ? "" : opt)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${gigForm.lightsIncluded === opt ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>)}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Instagram / Social Link</label>
                      <input value={gigForm.socialLink} onChange={e => setGig("socialLink", e.target.value)}
                        placeholder="https://instagram.com/yourprofile" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Showreel / YouTube Link</label>
                      <input value={gigForm.showreel} onChange={e => setGig("showreel", e.target.value)}
                        placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ── Service Details (service vendors only) ── */}
            {['Photographer','Caterer','Decorator','Makeup Artist','Mehendi Artist','Hair Stylist','Cake Artist','Bartender','Videographer','Food Truck','Wedding Planner','Live Streaming','Photo Booth','Gift & Favours','Transportation','Security'].includes(profile?.serviceType) && (() => {
              const svc = profile.serviceType;
              return (
                <>
                  <hr className="my-8 border-gray-100" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Service Details</h3>
                  <p className="text-sm text-gray-500 mb-6">These details appear on your public profile and help customers choose you.</p>

                  {svc === 'Photographer' && (<>
                    <ChipSingle label="Services Offered" field="photoServices" options={['Photographer','Videographer','Both']} />
                    <ChipMulti label="Photography Style" field="photographyType" options={['Candid','Drone','Traditional','Cinematic']} />
                    <ChipSingle label="Hours Included" field="hoursIncluded" options={['2 hrs','4 hrs','8 hrs','Full day']} />
                    <ChipSingle label="Editing Time (days)" field="editingTime" options={['2','5','7','10+']} />
                  </>)}

                  {svc === 'Caterer' && (<>
                    <ChipMulti label="Cuisine Types" field="cuisineTypes" options={['North Indian','South Indian','Snacks','Chinese Starters','Punjabi','Sweets','Italian','Continental','Other']} />
                    <ChipMulti label="Service Style" field="cateringServiceType" options={['Buffet','Food Stations','Live Counter','Family Style']} />
                    <ChipMulti label="Menu Type" field="menuType" options={['Veg','Non Veg','Jain']} />
                    <ChipSingle label="Beverages Included?" field="beverage" options={['Yes','No']} />
                  </>)}

                  {svc === 'Decorator' && (<>
                    <ChipMulti label="Decoration Types" field="decorTypes" options={['Themed','Floral','Lighting','Balloon Art','Traditional','Modern','Rustic','Minimalist','Other']} />
                    <ChipMulti label="Venue Coverage" field="venueCoverage" options={['Interior','Exterior','Full Venue','Stage Setup','Entrance Focus','Backdrop']} />
                  </>)}

                  {svc === 'Makeup Artist' && (<>
                    <ChipMulti label="Specialisations" field="makeupSpecialisations" options={['Bridal','HD Airbrush','Party Makeup','Editorial','Stage / Theatre','Grooming']} />
                    <ChipMulti label="Brands Used" field="makeupBrands" options={['MAC','Huda Beauty','Kryolan','Armani','L\'Oréal','Charlotte Tilbury','NARS','Other']} />
                    <ChipMulti label="Who Do You Serve" field="makeupAudience" options={['Bride','Bridesmaids','Groom Grooming','Group Bookings']} />
                    <ChipSingle label="Trial Booking Available?" field="makeupTrialAvailable" options={['Yes','No']} />
                  </>)}

                  {svc === 'Mehendi Artist' && (<>
                    <ChipMulti label="Design Styles" field="mehendiStyles" options={['Arabic','Indian Traditional','Fusion','Moroccan','Pakistani','Minimalist']} />
                    <ChipMulti label="Coverage Offered" field="mehendiCoverage" options={['Full Hands','Half Hands','Feet','Back of Hand','Arms']} />
                    <ChipSingle label="Cone Type" field="mehendiConeType" options={['Natural Only','Chemical','Both']} />
                    <ChipSingle label="Group Bookings?" field="mehendiGroupBooking" options={['Yes','No']} />
                  </>)}

                  {svc === 'Hair Stylist' && (<>
                    <ChipMulti label="Services Offered" field="hairServices" options={['Bridal Updo','Extensions','Highlights / Colour','Blowout','Party Style','Braids & Accessories']} />
                    <ChipMulti label="Hair Types Handled" field="hairTypes" options={['Straight','Wavy','Curly','Thick','Fine','Coloured / Treated']} />
                    <ChipSingle label="Travel to Venue?" field="hairTravelAvailable" options={['Yes','No']} />
                  </>)}

                  {svc === 'Cake Artist' && (<>
                    <ChipMulti label="Cake Styles" field="cakeStyles" options={['Fondant','Fresh Cream','Drip Cake','Naked Cake','Floral','Sculpted / 3D']} />
                    <ChipMulti label="Flavours" field="cakeFlavours" options={['Vanilla','Chocolate','Butterscotch','Red Velvet','Fruit','Blueberry','Custom']} />
                    <ChipSingle label="Minimum Order" field="cakeMinOrder" options={['500g','1 kg','2 kg','3 kg+']} />
                    <ChipSingle label="Lead Time Needed" field="cakeLeadTime" options={['1 day','2 days','3–5 days','7+ days']} />
                  </>)}

                  {svc === 'Bartender' && (<>
                    <ChipMulti label="Drink Services" field="bartenderServices" options={['Cocktails','Mocktails','Wine Service','Beer Service','Shots & LIIT','BYOB Setup']} />
                    <ChipMulti label="Event Types" field="bartenderEventTypes" options={['Wedding','House Party','Corporate','Pool Party','Club Night']} />
                    <ChipSingle label="Bring Own Bar Counter?" field="bartenderBarEquipment" options={['Yes','No']} />
                    <ChipSingle label="Certified Mixologist?" field="bartenderCertified" options={['Yes','No']} />
                  </>)}

                  {svc === 'Videographer' && (<>
                    <ChipMulti label="Filming Style" field="videoStyle" options={['Cinematic','Documentary','Highlight Reel','Short Reels','Live Event']} />
                    <ChipMulti label="Packages" field="videoPackages" options={['2 hrs','4 hrs','Full Day','Multi-Day','Pre-Wedding']} />
                    <ChipSingle label="Drone Available?" field="videoDroneAvailable" options={['Yes','No']} />
                    <ChipSingle label="Delivery Timeline" field="videoDeliveryDays" options={['3 days','7 days','14 days','30 days']} />
                  </>)}

                  {svc === 'Food Truck' && (<>
                    <ChipMulti label="Counter Types" field="foodCounterTypes" options={['Chaat','Dosa / South Indian','Pizza','Biryani','Chinese','Desserts','Beverages','BBQ','Other']} />
                    <ChipSingle label="Minimum Pax" field="foodMinPax" options={['25','50','100','200+']} />
                    <ChipSingle label="Space Needed" field="foodSpaceNeeded" options={['10×10 ft','15×15 ft','20×20 ft','Flexible']} />
                    <ChipSingle label="Power Requirement" field="foodPowerNeeded" options={['Self-sufficient','5 kW','10 kW','15 kW+']} />
                  </>)}

                  {svc === 'Wedding Planner' && (<>
                    <ChipMulti label="Services Offered" field="plannerServices" options={['Full Planning','Partial Planning','Day-of Coordination','Destination Weddings','Pre-Wedding Events']} />
                    <ChipMulti label="Budget Range Handled" field="plannerBudgetRange" options={['Under ₹5L','₹5–15L','₹15–50L','₹50L+']} />
                    <ChipMulti label="Event Types" field="plannerEventTypes" options={['Hindu','Muslim','Christian','Sikh','Destination','Corporate','Private Party']} />
                  </>)}

                  {svc === 'Live Streaming' && (<>
                    <ChipMulti label="Platforms Supported" field="streamPlatforms" options={['YouTube','Zoom','Facebook','Instagram Live','Custom RTMP']} />
                    <ChipSingle label="Camera Count" field="streamCameraCount" options={['1','2','3','4+']} />
                    <ChipSingle label="Max Resolution" field="streamResolution" options={['720p','1080p','4K']} />
                    <ChipSingle label="Backup Internet?" field="streamBackupInternet" options={['Yes','No']} />
                  </>)}

                  {svc === 'Photo Booth' && (<>
                    <ChipMulti label="Booth Types" field="boothTypes" options={['Open Booth','360 Booth','Mirror Booth','Enclosed','GIF Booth','Selfie Pod']} />
                    <ChipSingle label="On-site Prints?" field="boothPrints" options={['Yes','No']} />
                    <ChipSingle label="Branded Overlay?" field="boothBrandedOverlay" options={['Yes','No']} />
                    <ChipSingle label="Prop Box Included?" field="boothPropBox" options={['Yes','No']} />
                  </>)}

                  {svc === 'Gift & Favours' && (<>
                    <ChipMulti label="Occasion Specialities" field="giftOccasions" options={['Wedding','Corporate','Diwali','Birthday','Baby Shower','Anniversary','Farewell']} />
                    <ChipMulti label="Customisation Options" field="giftCustomisation" options={['Branding / Logo','Personalised Message','Custom Packaging','Monogramming','Edible Items']} />
                    <ChipSingle label="Minimum Order Qty" field="giftMinOrder" options={['1','10','25','50','100+']} />
                    <ChipSingle label="Delivery" field="giftDelivery" options={['Pickup Only','Local Delivery','Pan India']} />
                  </>)}

                  {svc === 'Transportation' && (<>
                    <ChipMulti label="Vehicle Types" field="transportVehicles" options={['Sedan','SUV / Luxury','Vintage / Classic','Mini Bus (18-seater)','Bus / Coach','Tempo Traveller','Decorated Bridal Car']} />
                    <ChipMulti label="Service Areas" field="transportServiceArea" options={['Local City','Outstation','Airport Transfers','Pan India']} />
                    <ChipSingle label="Decoration Available?" field="transportDecoration" options={['Yes','No']} />
                  </>)}

                  {svc === 'Security' && (<>
                    <ChipMulti label="Services Offered" field="securityServices" options={['Crowd Management','VIP Escort','Door Supervision','Patrol','Metal Detection','Parking Management']} />
                    <ChipSingle label="Team Size" field="securityTeamSize" options={['1–5','5–10','10–20','20+']} />
                    <ChipSingle label="PSARA Certified?" field="securityCertified" options={['Yes','No']} />
                    <ChipSingle label="Armed Guards?" field="securityArmed" options={['Available','Not Available']} />
                  </>)}
                </>
              );
            })()}

            <div className="mt-8 flex justify-end">
              <button onClick={saveInfo} disabled={saving} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── Setlist Tab (gig pros only) ── */}
        {tab === "setlist" && GIG_PRO_TYPES.includes(profile?.serviceType) && (() => {
          const svc = profile?.serviceType;
          const setlistLabel = svc === 'DJ' ? 'Typical Set / Playlist Theme'
            : ['Emcee/Host','Anchor'].includes(svc) ? 'Script Outline / Typical Segments'
            : svc === 'Stand-up Comedian' ? 'Set Material / Topics'
            : svc === 'Choreographer' ? 'Routine Description'
            : svc === 'Magician' ? 'Show Description / Acts'
            : 'Setlist / Repertoire';
          const setlistPlaceholder = ['Emcee/Host','Anchor'].includes(svc)
            ? 'e.g.\n• Welcome address & intro\n• Couple Q&A / fun games\n• Award or milestone rounds\n• Dance floor / entertainment segments\n• Closing & vote of thanks'
            : svc === 'DJ'
            ? 'e.g.\n• Ceremony: Soft Hindi classics (Arijit, Jubin)\n• Cocktail hour: Lounge / EDM mix\n• Reception: Bollywood party anthems\n• Late night: Punjabi & Hip-Hop'
            : svc === 'Choreographer'
            ? 'e.g.\n• Couple first dance — 1 min choreographed routine\n• Bride\'s sisters group performance — 3 songs\n• Sangeet flash mob — 12 participants, 6 sessions'
            : svc === 'Singer'
            ? 'e.g.\n• Ghazals: Jagjit Singh classics\n• Bollywood romantic: Tum Hi Ho, Kesariya\n• Sufi set: Kun Faya Kun, Arziyan\n• Crowd requests: open to suggestions'
            : 'List your acts, songs, sets, or signature segments — helps event planners understand exactly what you deliver';
          const QUICK_ITEMS = {
            DJ:               ['Bollywood Party Mix (2 hrs)','EDM Drop Set','Sufi Night Set','Retro Classics','Cocktail Hour Lounge','Punjabi Wedding Bangers','Late Night High Energy'],
            Singer:           ['Ghazal Set (30 min)','Bollywood Romantic Set','Sufi / Devotional Set','Live Unplugged Session','Custom Song Requests','Title Song Medley'],
            Musician:         ['Classical Raag Performance','Fusion Set','Instrumental Background Music','Solo Recital','Jugalbandi / Duet'],
            Band:             ['Bollywood Live Set (90 min)','Retro Classics Set','Sufi Night','Jazz Lounge Set','Rock / Fusion Set'],
            Choreographer:    ['Couple First Dance','Group Sangeet Performance','Flash Mob Coordination','Kids Dance Act','Bridal Entry Choreography'],
            Anchor:           ['Welcome & Introductions','Couple Q&A Game','Audience Fun Games','Award / Felicitation Rounds','Closing Ceremony'],
            'Emcee/Host':     ['High-Energy Opening','Brand Activation Segment','Audience Interaction Games','Product Launch Script','Closing & Thank You'],
            'Stand-up Comedian': ['Clean Corporate Set','Wedding Roast (family-friendly)','Open Mic Material','Crowd Work Segment','Mimicry & Impressions'],
            Magician:         ['Close-Up Card Magic','Stage Illusion Act','Mentalism / Mind Reading','Children\'s Show Set','Corporate Branded Finale'],
            Performer:        ['Stage Act (20 min)','Walk-Around Meet & Greet','Flash Mob Surprise','Stunt / Fire Act','Comedy Sketch'],
          };
          const quickItems = QUICK_ITEMS[svc] || [];
          return (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{setlistLabel}</h2>
              <p className="text-sm text-gray-500 mb-6">This appears on your public profile's Setlist tab — give event planners a clear picture of what you perform.</p>

              {/* Quick-add chips */}
              {quickItems.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-3">⚡ Quick Add — {svc} Segments</div>
                  <div className="flex flex-wrap gap-2">
                    {quickItems.map((item, i) => (
                      <button key={i} type="button"
                        onClick={() => {
                          const current = gigForm.setlist || '';
                          const line = `• ${item}`;
                          if (!current.includes(line)) {
                            setGigForm(f => ({ ...f, setlist: current ? current + '\n' + line : line }));
                          }
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition-colors">
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Your {setlistLabel}</label>
                <textarea
                  value={gigForm.setlist}
                  onChange={e => setGigForm(f => ({ ...f, setlist: e.target.value }))}
                  rows={10}
                  placeholder={setlistPlaceholder}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm resize-y font-mono"
                />
                <p className="text-xs text-gray-400 mt-1.5">Use bullet points (•) or numbered lines for best display on your public profile.</p>
              </div>

              <div className="flex justify-end">
                <button onClick={saveInfo} disabled={saving}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : "Save Setlist"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Bank & Payments Tab ── */}
        {tab === "bank" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Bank & Payments</h2>
            <p className="text-sm text-gray-500 mb-6">Earnings are transferred to your registered bank account after each confirmed event.</p>

            {/* UPI */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">UPI ID</label>
              <div className="flex gap-2">
                <input value={form.upiId} onChange={e => set("upiId", e.target.value)} placeholder="yourname@upi" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                <button onClick={saveInfo} disabled={saving} className="px-5 py-3 bg-yellow-500 text-white rounded-xl font-semibold text-sm hover:bg-yellow-600 transition-colors disabled:opacity-60">
                  {saving ? "…" : "Save"}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-gray-800">Bank Account Details</div>
                  <div className="text-sm text-gray-500">For NEFT/RTGS payouts</div>
                </div>
              </div>
              <BankDetailsForm vendorId={vendorId} showToast={showToast} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BankDetailsForm({ vendorId, showToast }) {
  const { token } = useSelector((s) => s.auth);
  const [bank, setBank]     = useState({ accountHolder: "", accountNumber: "", ifsc: "", bankName: "" });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${BASE_URL}/vendors/${vendorId}/bank-details`, {
      credentials: "include",
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setBank({ accountHolder: d.accountHolder || "", accountNumber: d.accountNumber || "", ifsc: d.ifsc || "", bankName: d.bankName || "" });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [vendorId, token]);

  const setF = (k, v) => setBank(b => ({ ...b, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${BASE_URL}/vendors/${vendorId}/bank-details`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(bank),
      });
      if (!r.ok) throw new Error();
      showToast("Bank details saved!");
    } catch {
      showToast("Failed to save bank details", false);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Account Holder Name</label>
        <input value={bank.accountHolder} onChange={e => setF("accountHolder", e.target.value)} placeholder="As per bank records" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Bank Name</label>
        <input value={bank.bankName} onChange={e => setF("bankName", e.target.value)} placeholder="e.g. HDFC Bank" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Account Number</label>
        <input value={bank.accountNumber} onChange={e => setF("accountNumber", e.target.value)} placeholder="Account number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">IFSC Code</label>
        <input value={bank.ifsc} onChange={e => setF("ifsc", e.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
      </div>
      <div className="md:col-span-2 flex justify-end mt-2">
        <button onClick={save} disabled={saving} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
}

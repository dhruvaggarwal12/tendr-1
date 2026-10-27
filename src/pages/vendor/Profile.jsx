import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import {
  GIG_PRO_TYPES, GIG_GENRE_OPTIONS, GIG_LANG_OPTIONS, GIG_LANGUAGE_CATEGORIES,
  GIG_STYLE_OPTIONS, CONTENT_RATING_OPTIONS, performanceLabel, performanceFieldHints,
  QUICK_PERFORMANCE_ITEMS, PERFORMER_CATEGORIES, performanceItemNoun, eventTypeOptions,
  HOSTING_RESPONSIBILITY_OPTIONS, AUDIENCE_SIZE_OPTIONS, CAPABILITY_BADGE_OPTIONS,
  AUDIENCE_PARTICIPATION_OPTIONS, AGE_SUITABILITY_OPTIONS, EQUIPMENT_PROVIDED_OPTIONS,
  PARTY_ENERGY_OPTIONS, SCRIPT_SOURCE_OPTIONS, REQUIREMENT_FIELD_CATEGORIES, SONG_REQUEST_CATEGORIES,
  PERFORMANCE_ATMOSPHERE_OPTIONS, CUSTOM_MATERIAL_CATEGORIES,
} from "../../constants/performerCategories";

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
    bandSize: "", bandType: "", bio: "", socialLink: "", showreel: "",
    setupType: "", lightsIncluded: "",
    contentRating: "",
    highlights: [{ label: "", desc: "" }],
    performanceItems: [{ title: "", note: "" }],
    lineup: [{ name: "", role: "" }],
    packages: [{ name: "", price: "", unit: "per event", duration: "", bestFor: "", items: [""], performerCount: "", travelCharge: "", overtimeCharge: "", addOns: [""], configuration: "" }],
    requirements: {
      travel: "", setupTimeMinutes: "", soundSystemProvided: false, stageRequired: false,
      powerRequirement: "", spaceRequirement: "", advanceBookingDays: "", customRequestsNote: "",
      scriptSource: "", rehearsalAvailable: false, outfitArrangement: "",
      micCount: "", lightingRequirement: "", floorRequirement: "", costumeArrangement: "",
    },
    mainPhotoIndex: -1,
    milestones: [{ year: "", text: "" }],
    notableClients: [""],
    awards: [""],
    secondaryCategories: [],
    hostingResponsibilities: [], audienceSizeExperience: [], capabilityBadges: [],
    audienceParticipation: [], ageSuitability: [], equipmentProvided: [], partyEnergyLevels: [],
    songRequestPolicy: { accepted: false, noticeDays: "", extraCharge: "" },
    performanceAtmosphere: [],
    customMaterialPolicy: { offered: false, infoNeeded: "", prepDays: "" },
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
          bandType:        v.bandType || "",
          bio:             v.bio || "",
          // Instagram/showreel live under `social` on the schema — reading the old
          // flat `socialLink`/`showreel` keys here meant a vendor's saved links
          // never even showed back up after a page reload.
          socialLink:      v.social?.instagram || "",
          showreel:        v.social?.showreel || "",
          setupType:       v.setupType || "",
          lightsIncluded:  v.lightsIncluded || "",
          contentRating:   v.contentRating || "",
          highlights:      v.highlights?.length ? v.highlights : [{ label: "", desc: "" }],
          performanceItems: v.performanceItems?.length ? v.performanceItems : [{ title: "", note: "" }],
          lineup:          v.lineup?.length ? v.lineup : [{ name: "", role: "" }],
          packages:        v.packages?.length ? v.packages.map(p => ({
                              ...p,
                              items: p.items?.length ? p.items : [""],
                              performerCount: p.performerCount ?? "",
                              travelCharge: p.travelCharge || "",
                              overtimeCharge: p.overtimeCharge || "",
                              addOns: p.addOns?.length ? p.addOns : [""],
                              configuration: p.configuration || "",
                            })) : [{ name: "", price: "", unit: "per event", duration: "", bestFor: "", items: [""], performerCount: "", travelCharge: "", overtimeCharge: "", addOns: [""], configuration: "" }],
          requirements: {
            travel: v.requirements?.travel || "",
            setupTimeMinutes: v.requirements?.setupTimeMinutes ?? "",
            soundSystemProvided: !!v.requirements?.soundSystemProvided,
            stageRequired: !!v.requirements?.stageRequired,
            powerRequirement: v.requirements?.powerRequirement || "",
            spaceRequirement: v.requirements?.spaceRequirement || "",
            advanceBookingDays: v.requirements?.advanceBookingDays ?? "",
            customRequestsNote: v.requirements?.customRequestsNote || "",
            scriptSource: v.requirements?.scriptSource || "",
            rehearsalAvailable: !!v.requirements?.rehearsalAvailable,
            outfitArrangement: v.requirements?.outfitArrangement || "",
            micCount: v.requirements?.micCount ?? "",
            lightingRequirement: v.requirements?.lightingRequirement || "",
            floorRequirement: v.requirements?.floorRequirement || "",
            costumeArrangement: v.requirements?.costumeArrangement || "",
          },
          mainPhotoIndex: Number.isInteger(v.mainPhotoIndex) ? v.mainPhotoIndex : -1,
          hostingResponsibilities: v.hostingResponsibilities || [],
          audienceSizeExperience:  v.audienceSizeExperience  || [],
          capabilityBadges:        v.capabilityBadges        || [],
          audienceParticipation:   v.audienceParticipation   || [],
          ageSuitability:          v.ageSuitability          || [],
          equipmentProvided:       v.equipmentProvided       || [],
          partyEnergyLevels:       v.partyEnergyLevels       || [],
          songRequestPolicy: {
            accepted: !!v.songRequestPolicy?.accepted,
            noticeDays: v.songRequestPolicy?.noticeDays ?? "",
            extraCharge: v.songRequestPolicy?.extraCharge || "",
          },
          performanceAtmosphere: v.performanceAtmosphere || [],
          customMaterialPolicy: {
            offered: !!v.customMaterialPolicy?.offered,
            infoNeeded: v.customMaterialPolicy?.infoNeeded || "",
            prepDays: v.customMaterialPolicy?.prepDays ?? "",
          },
          milestones:      v.milestones?.length ? v.milestones : [{ year: "", text: "" }],
          notableClients:  v.notableClients?.length ? v.notableClients : [""],
          awards:          v.awards?.length ? v.awards : [""],
          secondaryCategories: v.secondaryCategories || [],
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
          bandType:       gigForm.bandType,
          // Nested to match the schema (`social.instagram`/`social.showreel`) —
          // sending these flat used to silently drop them on every save.
          social:         { instagram: gigForm.socialLink, showreel: gigForm.showreel },
          eventTypes:     gigForm.eventTypes,
          contentRating:  gigForm.contentRating,
          highlights:     gigForm.highlights.filter(h => h.label.trim()),
          performanceItems: gigForm.performanceItems.filter(it => it.title.trim()),
          lineup:         gigForm.lineup.filter(m => m.name.trim()),
          packages:       gigForm.packages.filter(p => p.name.trim()).map(p => ({ ...p, items: p.items.filter(Boolean), addOns: p.addOns.filter(Boolean) })),
          requirements:   gigForm.requirements,
          mainPhotoIndex: gigForm.mainPhotoIndex,
          milestones:     gigForm.milestones.filter(m => m.year.trim() && m.text.trim()),
          notableClients: gigForm.notableClients.filter(Boolean),
          awards:         gigForm.awards.filter(Boolean),
          secondaryCategories: gigForm.secondaryCategories,
          hostingResponsibilities: gigForm.hostingResponsibilities,
          audienceSizeExperience:  gigForm.audienceSizeExperience,
          capabilityBadges:        gigForm.capabilityBadges,
          audienceParticipation:   gigForm.audienceParticipation,
          ageSuitability:          gigForm.ageSuitability,
          equipmentProvided:       gigForm.equipmentProvided,
          partyEnergyLevels:       gigForm.partyEnergyLevels,
          songRequestPolicy:       gigForm.songRequestPolicy,
          performanceAtmosphere:   gigForm.performanceAtmosphere,
          customMaterialPolicy:    gigForm.customMaterialPolicy,
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
  const setReq = (k, v) => setGigForm(f => ({ ...f, requirements: { ...f.requirements, [k]: v } }));

  // Generic helpers for the repeatable-row sections (highlights, performanceItems,
  // lineup, packages) — every row is a plain object the vendor fills field-by-field,
  // so what they type always lands in the right structured shape on the profile
  // instead of a freeform block of text they have to format themselves.
  const setRow = (field, i, key, val) => setGigForm(f => ({ ...f, [field]: f[field].map((row, j) => j === i ? { ...row, [key]: val } : row) }));
  const addRow = (field, blank, max) => setGigForm(f => f[field].length >= max ? f : ({ ...f, [field]: [...f[field], blank] }));
  const removeRow = (field, i) => setGigForm(f => ({ ...f, [field]: f[field].filter((_, j) => j !== i) }));

  const addQuickPerformanceItem = (title) => setGigForm(f => {
    if (f.performanceItems.some(it => it.title.trim().toLowerCase() === title.toLowerCase())) return f;
    const items = f.performanceItems[0]?.title.trim() ? [...f.performanceItems] : [];
    return { ...f, performanceItems: [...items, { title, note: "" }] };
  });

  const setPkgItem = (pi, ii, val) => setGigForm(f => ({ ...f, packages: f.packages.map((p, j) => j === pi ? { ...p, items: p.items.map((it, k) => k === ii ? val : it) } : p) }));
  const addPkgItem = (pi) => setGigForm(f => ({ ...f, packages: f.packages.map((p, j) => j === pi && p.items.length < 10 ? { ...p, items: [...p.items, ""] } : p) }));
  const removePkgItem = (pi, ii) => setGigForm(f => ({ ...f, packages: f.packages.map((p, j) => j === pi ? { ...p, items: p.items.filter((_, k) => k !== ii) } : p) }));
  const setPkgAddOn = (pi, ii, val) => setGigForm(f => ({ ...f, packages: f.packages.map((p, j) => j === pi ? { ...p, addOns: p.addOns.map((a, k) => k === ii ? val : a) } : p) }));
  const addPkgAddOn = (pi) => setGigForm(f => ({ ...f, packages: f.packages.map((p, j) => j === pi && p.addOns.length < 10 ? { ...p, addOns: [...p.addOns, ""] } : p) }));
  const removePkgAddOn = (pi, ii) => setGigForm(f => ({ ...f, packages: f.packages.map((p, j) => j === pi ? { ...p, addOns: p.addOns.filter((_, k) => k !== ii) } : p) }));

  // Plain-string repeatable lists (notableClients, awards) — same shape idea as
  // setRow/addRow/removeRow but for a flat array of strings, not objects.
  const setStr = (field, i, val) => setGigForm(f => ({ ...f, [field]: f[field].map((s, j) => j === i ? val : s) }));
  const addStr = (field, max) => setGigForm(f => f[field].length >= max ? f : ({ ...f, [field]: [...f[field], ""] }));
  const removeStr = (field, i) => setGigForm(f => ({ ...f, [field]: f[field].filter((_, j) => j !== i) }));

  const toggleSecondaryCategory = (cat) => setGigForm(f => {
    if (f.secondaryCategories.includes(cat)) return { ...f, secondaryCategories: f.secondaryCategories.filter(c => c !== cat) };
    if (f.secondaryCategories.length >= 2) return f;
    return { ...f, secondaryCategories: [...f.secondaryCategories, cat] };
  });
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
            ...(GIG_PRO_TYPES.includes(profile?.serviceType) ? [["setlist", "Setlist & Performance"], ["packages", "Packages & Pricing"]] : []),
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
              // Primary + any "Also Perform As" categories — so picking "Musician" as a
              // secondary category on a Singer profile also surfaces the Instruments field,
              // not just the Singer-only ones.
              const activeCats = [svc, ...gigForm.secondaryCategories];
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

                  {svc === 'Stand-up Comedian' && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Content Rating <span className="text-gray-400 font-normal">(shown as a badge near your name — helps the right customers book you)</span></label>
                      <div className="flex gap-2 flex-wrap">
                        {CONTENT_RATING_OPTIONS.map(opt => (
                          <button key={opt} type="button" onClick={() => setGig("contentRating", gigForm.contentRating === opt ? "" : opt)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${gigForm.contentRating === opt ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Also Perform As <span className="text-gray-400 font-normal">(up to 2 — e.g. a Singer who's also a Musician gets both sections on their profile)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PERFORMER_CATEGORIES.filter(c => c.value !== svc).map(c => {
                        const active = gigForm.secondaryCategories.includes(c.value);
                        return (
                          <button key={c.value} type="button" onClick={() => toggleSecondaryCategory(c.value)}
                            disabled={!active && gigForm.secondaryCategories.length >= 2}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all disabled:opacity-40 ${active ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {styleOpts.length > 0 && <ChipPicker label="Performing Style" field="performingStyle" options={styleOpts} />}
                  {['DJ', 'Band', 'Musician', 'Singer'].some(c => activeCats.includes(c)) && <ChipPicker label="Music Genres" field="genres" options={GIG_GENRE_OPTIONS} />}

                  {['Band', 'Musician'].some(c => activeCats.includes(c)) && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Instruments <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                      <input value={gigForm.instruments?.join(', ')} onChange={e => setGig("instruments", e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="e.g. Guitar, Tabla, Keyboard, Violin" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                  )}

                  {svc === 'Musician' && (
                    <ChipPicker label="Performance Atmosphere" field="performanceAtmosphere" options={PERFORMANCE_ATMOSPHERE_OPTIONS} />
                  )}

                  {svc === 'Band' && (<>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Number of Members</label>
                      <input type="number" min="1" value={gigForm.bandSize} onChange={e => setGig("bandSize", e.target.value)}
                        placeholder="e.g. 5" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Band Type <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input value={gigForm.bandType} onChange={e => setGig("bandType", e.target.value)}
                        placeholder="e.g. Bollywood Band, Fusion, Classical" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Meet the Band <span className="text-gray-400 font-normal">(shown on your profile's About tab)</span></label>
                      <div className="flex flex-col gap-2">
                        {gigForm.lineup.map((m, i) => (
                          <div key={i} className="flex gap-2">
                            <input value={m.name} onChange={e => setRow("lineup", i, "name", e.target.value)}
                              placeholder="Member name" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                            <input value={m.role} onChange={e => setRow("lineup", i, "role", e.target.value)}
                              placeholder="Role — e.g. Lead Vocalist" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                            {gigForm.lineup.length > 1 && (
                              <button type="button" onClick={() => removeRow("lineup", i)} className="px-3 text-gray-400 hover:text-red-500">×</button>
                            )}
                          </div>
                        ))}
                      </div>
                      {gigForm.lineup.length < 12 && (
                        <button type="button" onClick={() => addRow("lineup", { name: "", role: "" }, 12)}
                          className="mt-2 text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add member</button>
                      )}
                    </div>
                  </>)}

                  {activeCats.includes('Choreographer') && (
                    <ChipPicker label="Dance Styles" field="danceStyles" options={['Bollywood', 'Classical', 'Contemporary', 'Hip-Hop', 'Salsa', 'Couple Dance', 'Group']} />
                  )}

                  {['Emcee/Host', 'Anchor', 'Singer', 'Stand-up Comedian'].some(c => activeCats.includes(c)) && <ChipPicker label="Languages" field="languages" options={GIG_LANG_OPTIONS} />}

                  <ChipPicker label="Suitable For" field="eventTypes" options={eventTypeOptions(svc)} />

                  {['Emcee/Host', 'Anchor'].includes(svc) && (<>
                    <ChipPicker label="Hosting Responsibilities" field="hostingResponsibilities" options={HOSTING_RESPONSIBILITY_OPTIONS} />
                    <ChipPicker label="Audience Size Experience" field="audienceSizeExperience" options={AUDIENCE_SIZE_OPTIONS} />
                  </>)}

                  {svc === 'Anchor' && (
                    <ChipPicker label="Capabilities" field="capabilityBadges" options={CAPABILITY_BADGE_OPTIONS} />
                  )}

                  {svc === 'Magician' && (<>
                    <ChipPicker label="Audience Participation" field="audienceParticipation" options={AUDIENCE_PARTICIPATION_OPTIONS} />
                    <ChipPicker label="Age Suitability" field="ageSuitability" options={AGE_SUITABILITY_OPTIONS} />
                  </>)}

                  {svc === 'DJ' && (<>
                    <ChipPicker label="Equipment Provided" field="equipmentProvided" options={EQUIPMENT_PROVIDED_OPTIONS} />
                    <ChipPicker label="Party Energy Levels" field="partyEnergyLevels" options={PARTY_ENERGY_OPTIONS} />
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

                  {SONG_REQUEST_CATEGORIES.some(c => activeCats.includes(c)) && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Song Requests</label>
                      <div className="flex gap-2 mb-2">
                        {['Yes', 'No'].map(opt => {
                          const val = opt === 'Yes';
                          const active = gigForm.songRequestPolicy.accepted === val;
                          return (
                            <button key={opt} type="button" onClick={() => setGigForm(f => ({ ...f, songRequestPolicy: { ...f.songRequestPolicy, accepted: val } }))}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${active ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
                              {opt === 'Yes' ? 'I take requests' : "I don't take requests"}
                            </button>
                          );
                        })}
                      </div>
                      {gigForm.songRequestPolicy.accepted && (
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" min="0" value={gigForm.songRequestPolicy.noticeDays}
                            onChange={e => setGigForm(f => ({ ...f, songRequestPolicy: { ...f.songRequestPolicy, noticeDays: e.target.value } }))}
                            placeholder="Notice period (days)" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                          <input value={gigForm.songRequestPolicy.extraCharge}
                            onChange={e => setGigForm(f => ({ ...f, songRequestPolicy: { ...f.songRequestPolicy, extraCharge: e.target.value } }))}
                            placeholder="Extra charge, if any" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        </div>
                      )}
                    </div>
                  )}

                  {CUSTOM_MATERIAL_CATEGORIES.some(c => activeCats.includes(c)) && (
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Custom Material <span className="text-gray-400 font-normal">(personalised jokes, custom openings, brand-specific bits)</span></label>
                      <div className="flex gap-2 mb-2">
                        {['Yes', 'No'].map(opt => {
                          const val = opt === 'Yes';
                          const active = gigForm.customMaterialPolicy.offered === val;
                          return (
                            <button key={opt} type="button" onClick={() => setGigForm(f => ({ ...f, customMaterialPolicy: { ...f.customMaterialPolicy, offered: val } }))}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${active ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
                              {opt === 'Yes' ? 'I offer custom material' : "I don't offer custom material"}
                            </button>
                          );
                        })}
                      </div>
                      {gigForm.customMaterialPolicy.offered && (
                        <div className="grid grid-cols-2 gap-3">
                          <input value={gigForm.customMaterialPolicy.infoNeeded}
                            onChange={e => setGigForm(f => ({ ...f, customMaterialPolicy: { ...f.customMaterialPolicy, infoNeeded: e.target.value } }))}
                            placeholder="Info needed — e.g. name, event details" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                          <input type="number" min="0" value={gigForm.customMaterialPolicy.prepDays}
                            onChange={e => setGigForm(f => ({ ...f, customMaterialPolicy: { ...f.customMaterialPolicy, prepDays: e.target.value } }))}
                            placeholder="Prep time needed (days)" className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        </div>
                      )}
                    </div>
                  )}

                  {svc === 'Choreographer' && (
                    <p className="text-xs text-gray-400 mb-5">Tip: tag some of your uploaded photos as "Costumes" (from the Portfolio section) so customers can see your costume options in the gallery.</p>
                  )}

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
                  <p className="text-xs text-gray-400 mt-2">
                    Want more videos on your profile's Portfolio tab? Add YouTube/Instagram/SoundCloud links from your Dashboard's "Videos & Showcases" section.
                  </p>

                  {/* Cover photo picker — which already-uploaded photo opens the profile */}
                  {(profile?.portfolioPhotos || []).length > 0 && (
                    <div className="mt-6 mb-5">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Cover Photo <span className="text-gray-400 font-normal">(shown at the top of your profile)</span></label>
                      <div className="flex flex-wrap gap-3">
                        {profile.portfolioPhotos.map((url, i) => {
                          const selected = (gigForm.mainPhotoIndex === -1 ? 0 : gigForm.mainPhotoIndex) === i;
                          return (
                            <button key={i} type="button" onClick={() => setGig("mainPhotoIndex", i)}
                              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 ${selected ? "border-yellow-500" : "border-transparent"}`}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              {selected && <span className="absolute bottom-0 inset-x-0 bg-yellow-500 text-white text-[10px] font-bold text-center py-0.5">COVER</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Why people book you — up to 4, shown on the public About tab */}
                  <div className="mt-6 mb-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Why People Book You <span className="text-gray-400 font-normal">(up to 4 — shown on your profile's About tab)</span></label>
                    <div className="flex flex-col gap-3">
                      {gigForm.highlights.map((h, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <input value={h.label} onChange={e => setRow("highlights", i, "label", e.target.value)}
                              placeholder="e.g. Reads the room instantly" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm font-semibold" />
                            <input value={h.desc} onChange={e => setRow("highlights", i, "desc", e.target.value)}
                              placeholder="One line explaining why (optional)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                          </div>
                          {gigForm.highlights.length > 1 && (
                            <button type="button" onClick={() => removeRow("highlights", i)} className="px-2 pt-2 text-gray-400 hover:text-red-500">×</button>
                          )}
                        </div>
                      ))}
                    </div>
                    {gigForm.highlights.length < 4 && (
                      <button type="button" onClick={() => addRow("highlights", { label: "", desc: "" }, 4)}
                        className="mt-2 text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add a reason</button>
                    )}
                  </div>

                  {/* Experience & Milestones — a real career timeline, distinct from the raw
                      yearsOfExperience/totalEventsCompleted numbers shown as stats. */}
                  <hr className="my-8 border-gray-100" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Experience & Milestones</h3>
                  <p className="text-sm text-gray-500 mb-6">Your performance journey, named clients/venues, and awards — shown on your profile's About tab. Only add what you can back up.</p>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Performance Journey <span className="text-gray-400 font-normal">(up to 6)</span></label>
                    <div className="flex flex-col gap-2">
                      {gigForm.milestones.map((m, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={m.year} onChange={e => setRow("milestones", i, "year", e.target.value)}
                            placeholder="2024" className="w-28 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                          <input value={m.text} onChange={e => setRow("milestones", i, "text", e.target.value)}
                            placeholder="e.g. Performed at 30+ private celebrations" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                          {gigForm.milestones.length > 1 && (
                            <button type="button" onClick={() => removeRow("milestones", i)} className="px-3 text-gray-400 hover:text-red-500">×</button>
                          )}
                        </div>
                      ))}
                    </div>
                    {gigForm.milestones.length < 6 && (
                      <button type="button" onClick={() => addRow("milestones", { year: "", text: "" }, 6)}
                        className="mt-2 text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add a milestone</button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Notable Clients / Venues <span className="text-gray-400 font-normal">(up to 8)</span></label>
                      <div className="flex flex-col gap-2">
                        {gigForm.notableClients.map((c, i) => (
                          <div key={i} className="flex gap-2">
                            <input value={c} onChange={e => setStr("notableClients", i, e.target.value)}
                              placeholder="e.g. Taj Palace, New Delhi" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                            {gigForm.notableClients.length > 1 && (
                              <button type="button" onClick={() => removeStr("notableClients", i)} className="px-2 text-gray-400 hover:text-red-500">×</button>
                            )}
                          </div>
                        ))}
                      </div>
                      {gigForm.notableClients.length < 8 && (
                        <button type="button" onClick={() => addStr("notableClients", 8)} className="mt-2 text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add</button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Awards / Recognition <span className="text-gray-400 font-normal">(up to 5)</span></label>
                      <div className="flex flex-col gap-2">
                        {gigForm.awards.map((a, i) => (
                          <div key={i} className="flex gap-2">
                            <input value={a} onChange={e => setStr("awards", i, e.target.value)}
                              placeholder="e.g. Best Wedding Singer, Delhi Events Awards 2024" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                            {gigForm.awards.length > 1 && (
                              <button type="button" onClick={() => removeStr("awards", i)} className="px-2 text-gray-400 hover:text-red-500">×</button>
                            )}
                          </div>
                        ))}
                      </div>
                      {gigForm.awards.length < 5 && (
                        <button type="button" onClick={() => addStr("awards", 5)} className="mt-2 text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add</button>
                      )}
                    </div>
                  </div>

                  {/* Booking requirements — compact checklist shown in the public profile's sidebar */}
                  <hr className="my-8 border-gray-100" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Booking Requirements</h3>
                  <p className="text-sm text-gray-500 mb-6">What you need from the venue/customer — helps avoid mismatches after booking.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Travel</label>
                      <input value={gigForm.requirements.travel} onChange={e => setReq("travel", e.target.value)}
                        placeholder="e.g. Delhi NCR; outstation by arrangement" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Setup Time Needed (minutes)</label>
                      <input type="number" min="0" value={gigForm.requirements.setupTimeMinutes} onChange={e => setReq("setupTimeMinutes", e.target.value)}
                        placeholder="e.g. 45" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Power Requirement</label>
                      <input value={gigForm.requirements.powerRequirement} onChange={e => setReq("powerRequirement", e.target.value)}
                        placeholder="e.g. Standard 15A socket" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Space Needed</label>
                      <input value={gigForm.requirements.spaceRequirement} onChange={e => setReq("spaceRequirement", e.target.value)}
                        placeholder="e.g. Minimum 10×10 ft performance area" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Advance Booking Notice (days)</label>
                      <input type="number" min="0" value={gigForm.requirements.advanceBookingDays} onChange={e => setReq("advanceBookingDays", e.target.value)}
                        placeholder="e.g. 7" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-6 mb-5 flex-wrap">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <input type="checkbox" checked={gigForm.requirements.soundSystemProvided} onChange={e => setReq("soundSystemProvided", e.target.checked)} className="w-4 h-4" />
                      I provide my own sound system
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <input type="checkbox" checked={gigForm.requirements.stageRequired} onChange={e => setReq("stageRequired", e.target.checked)} className="w-4 h-4" />
                      I need a stage / performance area
                    </label>
                    {REQUIREMENT_FIELD_CATEGORIES.rehearsalAvailable.some(c => activeCats.includes(c)) && (
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <input type="checkbox" checked={gigForm.requirements.rehearsalAvailable} onChange={e => setReq("rehearsalAvailable", e.target.checked)} className="w-4 h-4" />
                        Rehearsal availability
                      </label>
                    )}
                  </div>

                  {/* Category-specific requirement fields — same shared `requirements`
                      object, just shown only where relevant */}
                  {(REQUIREMENT_FIELD_CATEGORIES.scriptSource.some(c => activeCats.includes(c))
                    || REQUIREMENT_FIELD_CATEGORIES.outfitArrangement.some(c => activeCats.includes(c))
                    || REQUIREMENT_FIELD_CATEGORIES.micCount.some(c => activeCats.includes(c))
                    || REQUIREMENT_FIELD_CATEGORIES.lightingRequirement.some(c => activeCats.includes(c))
                    || REQUIREMENT_FIELD_CATEGORIES.floorRequirement.some(c => activeCats.includes(c))
                    || REQUIREMENT_FIELD_CATEGORIES.costumeArrangement.some(c => activeCats.includes(c))) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      {REQUIREMENT_FIELD_CATEGORIES.scriptSource.some(c => activeCats.includes(c)) && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-2">Script Source</label>
                          <div className="flex gap-2 flex-wrap">
                            {SCRIPT_SOURCE_OPTIONS.map(opt => (
                              <button key={opt} type="button" onClick={() => setReq("scriptSource", gigForm.requirements.scriptSource === opt ? "" : opt)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${gigForm.requirements.scriptSource === opt ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-400"}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {REQUIREMENT_FIELD_CATEGORIES.outfitArrangement.some(c => activeCats.includes(c)) && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1.5">Outfit / Dress Code Arrangement</label>
                          <input value={gigForm.requirements.outfitArrangement} onChange={e => setReq("outfitArrangement", e.target.value)}
                            placeholder="e.g. I bring my own formal wear" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        </div>
                      )}
                      {REQUIREMENT_FIELD_CATEGORIES.micCount.some(c => activeCats.includes(c)) && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1.5">Microphones Needed</label>
                          <input type="number" min="0" value={gigForm.requirements.micCount} onChange={e => setReq("micCount", e.target.value)}
                            placeholder="e.g. 3" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        </div>
                      )}
                      {REQUIREMENT_FIELD_CATEGORIES.lightingRequirement.some(c => activeCats.includes(c)) && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1.5">Lighting Requirement</label>
                          <input value={gigForm.requirements.lightingRequirement} onChange={e => setReq("lightingRequirement", e.target.value)}
                            placeholder="e.g. Need at least basic stage lighting" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        </div>
                      )}
                      {REQUIREMENT_FIELD_CATEGORIES.floorRequirement.some(c => activeCats.includes(c)) && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1.5">Floor Requirement</label>
                          <input value={gigForm.requirements.floorRequirement} onChange={e => setReq("floorRequirement", e.target.value)}
                            placeholder="e.g. Flat, non-slip surface" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        </div>
                      )}
                      {REQUIREMENT_FIELD_CATEGORIES.costumeArrangement.some(c => activeCats.includes(c)) && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-600 mb-1.5">Costume Arrangement</label>
                          <input value={gigForm.requirements.costumeArrangement} onChange={e => setReq("costumeArrangement", e.target.value)}
                            placeholder="e.g. Costumes included in package" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Custom Requests Note <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea value={gigForm.requirements.customRequestsNote} onChange={e => setReq("customRequestsNote", e.target.value)} rows={2}
                      placeholder="e.g. Happy to learn a custom song with 2 weeks' notice" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm resize-none" />
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
          const label = performanceLabel(svc);
          const hints = performanceFieldHints(svc);
          const quickItems = QUICK_PERFORMANCE_ITEMS[svc] || [];
          return (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{label}</h2>
              <p className="text-sm text-gray-500 mb-6">This appears on your public profile's "{label}" tab — one row per song, segment, trick or act.</p>

              {/* Quick-add chips — each one drops in a real structured row, not a line of text */}
              {quickItems.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-3">⚡ Quick Add</div>
                  <div className="flex flex-wrap gap-2">
                    {quickItems.map((item, i) => (
                      <button key={i} type="button" onClick={() => addQuickPerformanceItem(item)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition-colors">
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 flex flex-col gap-2">
                {gigForm.performanceItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item.title} onChange={e => setRow("performanceItems", i, "title", e.target.value)}
                      placeholder={hints.title} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    <input value={item.note} onChange={e => setRow("performanceItems", i, "note", e.target.value)}
                      placeholder={hints.note} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    {gigForm.performanceItems.length > 1 && (
                      <button type="button" onClick={() => removeRow("performanceItems", i)} className="px-3 text-gray-400 hover:text-red-500">×</button>
                    )}
                  </div>
                ))}
                {gigForm.performanceItems.length < 12 && (
                  <button type="button" onClick={() => addRow("performanceItems", { title: "", note: "" }, 12)}
                    className="self-start mt-1 text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add a row</button>
                )}
              </div>

              <div className="flex justify-end">
                <button onClick={saveInfo} disabled={saving}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Packages & Pricing Tab (gig pros only) ── */}
        {tab === "packages" && GIG_PRO_TYPES.includes(profile?.serviceType) && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Packages & Pricing</h2>
            <p className="text-sm text-gray-500 mb-6">Up to 4 packages — shown as comparison cards on your public profile so customers know exactly what they're booking.</p>

            <div className="flex flex-col gap-6">
              {gigForm.packages.map((pkg, pi) => (
                <div key={pi} className="border border-gray-200 rounded-2xl p-5 relative">
                  {gigForm.packages.length > 1 && (
                    <button type="button" onClick={() => removeRow("packages", pi)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">×</button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Package Name</label>
                      <input value={pkg.name} onChange={e => setRow("packages", pi, "name", e.target.value)}
                        placeholder="e.g. Celebration Set" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Configuration <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input value={pkg.configuration} onChange={e => setRow("packages", pi, "configuration", e.target.value)}
                        placeholder="e.g. Solo, Full Band, Stage Show" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Price (₹)</label>
                        <input type="number" min="0" value={pkg.price} onChange={e => setRow("packages", pi, "price", e.target.value)}
                          placeholder="12000" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Unit</label>
                        <select value={pkg.unit} onChange={e => setRow("packages", pi, "unit", e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm bg-white">
                          <option value="per event">per event</option>
                          <option value="per hour">per hour</option>
                          <option value="per day">per day</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Duration</label>
                      <input value={pkg.duration} onChange={e => setRow("packages", pi, "duration", e.target.value)}
                        placeholder="e.g. 60 minutes" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Best For</label>
                      <input value={pkg.bestFor} onChange={e => setRow("packages", pi, "bestFor", e.target.value)}
                        placeholder="e.g. Birthday parties up to 50 guests" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">What's Included</label>
                  <div className="flex flex-col gap-1.5 mb-1">
                    {pkg.items.map((it, ii) => (
                      <div key={ii} className="flex gap-2">
                        <input value={it} onChange={e => setPkgItem(pi, ii, e.target.value)}
                          placeholder="e.g. Sound system included" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        {pkg.items.length > 1 && (
                          <button type="button" onClick={() => removePkgItem(pi, ii)} className="px-2 text-gray-400 hover:text-red-500">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pkg.items.length < 10 && (
                    <button type="button" onClick={() => addPkgItem(pi)} className="text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add item</button>
                  )}

                  {/* Price-relevant fields that used to only be expressible as freeform
                      bullet text inside "What's Included" — now real structured data. */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Number of Performers</label>
                      <input type="number" min="1" value={pkg.performerCount} onChange={e => setRow("packages", pi, "performerCount", e.target.value)}
                        placeholder="e.g. 1" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Travel Charge</label>
                      <input value={pkg.travelCharge} onChange={e => setRow("packages", pi, "travelCharge", e.target.value)}
                        placeholder="e.g. Included up to 20km" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Overtime Charge</label>
                      <input value={pkg.overtimeCharge} onChange={e => setRow("packages", pi, "overtimeCharge", e.target.value)}
                        placeholder="e.g. ₹2,000/hour beyond" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                    </div>
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Optional Add-ons <span className="text-gray-400 font-normal">(not included by default)</span></label>
                  <div className="flex flex-col gap-1.5 mb-1">
                    {pkg.addOns.map((a, ii) => (
                      <div key={ii} className="flex gap-2">
                        <input value={a} onChange={e => setPkgAddOn(pi, ii, e.target.value)}
                          placeholder="e.g. Extra hour of performance — ₹3,000" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 text-sm" />
                        {pkg.addOns.length > 1 && (
                          <button type="button" onClick={() => removePkgAddOn(pi, ii)} className="px-2 text-gray-400 hover:text-red-500">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pkg.addOns.length < 10 && (
                    <button type="button" onClick={() => addPkgAddOn(pi)} className="text-xs font-semibold text-yellow-700 hover:text-yellow-900">+ Add add-on</button>
                  )}
                </div>
              ))}
            </div>

            {gigForm.packages.length < 4 && (
              <button type="button" onClick={() => addRow("packages", { name: "", price: "", unit: "per event", duration: "", bestFor: "", items: [""], performerCount: "", travelCharge: "", overtimeCharge: "", addOns: [""], configuration: "" }, 4)}
                className="mt-5 px-5 py-2.5 border-2 border-dashed border-yellow-300 text-yellow-700 rounded-xl text-sm font-semibold hover:bg-yellow-50">
                + Add Package
              </button>
            )}

            <div className="mt-8 flex justify-end">
              <button onClick={saveInfo} disabled={saving}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                {saving ? "Saving…" : "Save Packages"}
              </button>
            </div>
          </div>
        )}

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

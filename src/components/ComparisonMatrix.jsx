import React from "react";

const fmtINR = (p) =>
  p == null || p === "" ? null : `₹${Number(p).toLocaleString("en-IN")}`;

const join = (v, sep = ", ") =>
  Array.isArray(v) && v.length ? v.join(sep) : null;

const getLocation = (v) => {
  if (v?.location) return v.location;
  if (Array.isArray(v?.locations) && v.locations.length) return join(v.locations);
  const { street, city, state } = v?.address || {};
  const parts = [street, city, state].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

const getStartingPrice = (v) =>
  fmtINR(v?.startingPrice ?? v?.minPrice ?? v?.price ?? null);
const getRating = (v) => v?.rating ?? v?.avgRating ?? v?.avgReviewScore ?? null;
const getReviews = (v) =>
  v?.reviewCount ?? v?.number_of_reviews ?? v?.totalReviews ??
  (Array.isArray(v?.clientReferences) ? v.clientReferences.length : null);
const getVerified = (v) => (v?.isVerified ?? v?.phoneVerified ? "Yes" : "No");
const getServices = (v) => {
  const svc = v?.services ?? v?.serviceCategories;
  if (Array.isArray(svc) && svc.length) return join(svc);
  return v?.serviceType ?? null;
};
const getThemes = (v) => join(v?.themes);
const getCoverage = (v) => join(v?.venueCoverage);
const getPortfolioCount = (v) =>
  Array.isArray(v?.portfolioPhotos) ? v.portfolioPhotos.length : null;
const getResponseTime = (v) => v?.responseTime ?? v?.avgResponseTime ?? null;
const getName = (v) => v?.name ?? v?.businessName ?? "Vendor";
const getTeamSize = (v) => v?.teamSize ?? null;
const getEvents = (v) => v?.totalEventsCompleted ?? null;
const getExperience = (v) => v?.yearsOfExperience ?? null;

const ROWS = [
  { label: "Location",              key: "location" },
  { label: "Starting Price",        key: "price" },
  { label: "Rating",                key: "rating" },
  { label: "Reviews",               key: "reviews" },
  { label: "Service Type",          key: "type" },
  { label: "Verified",              key: "verified" },
  { label: "Services",              key: "services" },
  { label: "Themes",                key: "themes" },
  { label: "Venue Coverage",        key: "coverage" },
  { label: "Portfolio Photos",      key: "portfolioCount" },
  { label: "Typical Response Time", key: "responseTime" },
  { label: "Team Size",             key: "teamSize" },
  { label: "Total Events Covered",  key: "events" },
  { label: "Years of Experience",   key: "experience" },
];

const ComparisonMatrix = ({ vendors = [] }) => {
  if (!vendors.length) return null;

  const vData = vendors.map((v) => ({
    _id: v?._id,
    name: getName(v),
    location: getLocation(v),
    price: getStartingPrice(v) ?? "N/A",
    rating: getRating(v),
    reviews: getReviews(v),
    type: v?.serviceType,
    verified: getVerified(v),
    services: getServices(v),
    themes: getThemes(v),
    coverage: getCoverage(v),
    portfolioCount: getPortfolioCount(v),
    responseTime: getResponseTime(v),
    teamSize: getTeamSize(v),
    events: getEvents(v),
    experience: getExperience(v),
  }));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 text-gray-400 w-36">Feature</th>
            {vData.map((v, i) => (
              <th key={v._id || i} className="text-left py-2 pr-4 font-semibold">
                {v.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ label, key }) => {
            const vals = vData.map((v) => v[key]);
            if (vals.every((val) => !val)) return null;
            return (
              <tr key={label} className="border-b">
                <th className="text-left font-medium py-3 pr-4 text-gray-600 whitespace-nowrap">
                  {label}
                </th>
                {vals.map((val, i) => (
                  <td key={i} className="py-3 pr-4">
                    {val ?? "—"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-5 flex gap-3 flex-wrap">
        {vData.map(
          (v) =>
            v._id && (
              <a key={v._id} href={`/vendor/${v._id}`} className="px-4 py-2 rounded-lg border text-sm">
                View {v.name}
              </a>
            )
        )}
      </div>
    </div>
  );
};

export default ComparisonMatrix;

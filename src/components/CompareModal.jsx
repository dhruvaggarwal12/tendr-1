import React, { useEffect, useState } from "react";
import ComparisonMatrix from "./ComparisonMatrix";
import { getVendorById } from "../apis/vendorApi"; // adjust path if needed

const Spinner = () => (
  <div className="w-full flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CCAB4A]" />
  </div>
);

const CompareModal = ({ open, onClose, vendors = [] }) => {
  const [loading, setLoading] = useState(false);
  const [fullVendors, setFullVendors] = useState(vendors);

  useEffect(() => {
    if (!open || vendors.length < 2) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const results = await Promise.all(
          vendors.map(async (v) => {
            if (!v?._id) return v;
            try {
              const detail = await getVendorById(v._id);
              return { ...v, ...detail, __full: true };
            } catch (e) {
              console.error("Vendor detail fetch failed:", e);
              return v; // fallback to shallow
            }
          })
        );

        if (!cancelled) setFullVendors(results);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, vendors]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal box */}
      <div className="relative bg-white w-[95%] max-w-5xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Compare Vendors</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {loading ? <Spinner /> : <ComparisonMatrix vendors={fullVendors} />}
      </div>
    </div>
  );
};

export default CompareModal;

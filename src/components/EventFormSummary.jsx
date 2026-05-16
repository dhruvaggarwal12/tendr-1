import { useSelector, useDispatch } from 'react-redux';
import {
  selectFormData,
  selectSelectedVendors,
  backToFormAction
} from '../redux/eventPlanningSlice';


const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const rupee = (v) => (v ? `₹${Number(v).toLocaleString('en-IN')}` : '—');

export default function EventFormSummary() {
  const f = useSelector(selectFormData);
  const selected = useSelector(selectSelectedVendors);
  const vendorProfiles = useSelector((s) => s.listingFilters.compareSelected);
  const dispatch = useDispatch();

  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 py-6 flex justify-center">
      <div className="w-full max-w-5xl rounded-3xl bg-white/95 shadow-md ring-1 ring-black/5 p-6 sm:p-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Your Event Details
          </h3>

          <button
            onClick={() => dispatch(backToFormAction())}
            className="px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition duration-200"
          >
            Edit details
          </button>
        </div>

        {/* DETAILS GRID */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Event Type */}
          <div className="border rounded-xl p-4 bg-white">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Event Type
            </dt>
            <dd className="text-base font-semibold text-gray-800 mt-1">
              {f.eventType || "—"}
            </dd>
          </div>

          {/* Guests */}
          <div className="border rounded-xl p-4 bg-white">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Guests
            </dt>
            <dd className="text-base font-semibold text-gray-800 mt-1">
              {f.guests || "—"}
            </dd>
          </div>

          {/* Budget */}
          <div className="border rounded-xl p-4 bg-white">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Budget
            </dt>
            <dd className="text-base font-semibold text-gray-800 mt-1">
              {f.budget || "—"}
            </dd>
          </div>

          {/* Location */}
          <div className="border rounded-xl p-4 bg-white">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Location
            </dt>
            <dd className="text-base font-semibold text-gray-800 mt-1">
              {f.location || "—"}
            </dd>
          </div>

          {/* Date */}
          <div className="border rounded-xl p-4 bg-white">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Date
            </dt>
            <dd className="text-base font-semibold text-gray-800 mt-1">
              {fmt(f.date)}
            </dd>
          </div>

        </dl>

        {/* VENDORS COUNT */}
        <div className="mt-5 flex gap-3 flex-wrap">
          <div className="flex-1 text-sm text-gray-700 bg-white py-3 px-4 rounded-xl border">
            <span className="font-semibold">Service categories:</span>{" "}
            {selected.length ? (
              <span className="text-gray-800 font-medium">{selected.join(", ")}</span>
            ) : (
              <span className="text-gray-500">None selected</span>
            )}
          </div>
          {vendorProfiles.length > 0 && (
            <div className="text-sm text-gray-700 bg-[#fffbeb] py-3 px-4 rounded-xl border border-[#CCAB4A]">
              <span className="font-semibold text-[#b45309]">Vendor profiles viewed:</span>{" "}
              <span className="font-medium text-gray-800">{vendorProfiles.length}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );

}

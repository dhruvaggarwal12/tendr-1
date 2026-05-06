import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../redux/listingFiltersSlice";

const ALL_SERVICE_TYPES = ["Caterer", "Photographer", "DJ", "Decorator"];

const PrimaryFilters_ListingPage = ({ onSearch = () => {}, allowedServiceTypes = [] }) => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.listingFilters);

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const serviceOptions =
    allowedServiceTypes.length > 0 ? allowedServiceTypes : ALL_SERVICE_TYPES;

  return (
    <div className="primary-filters space-y-4 sm:space-y-6">

      {/* Service Type */}
      <div className="filter-group">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Service Type
        </label>
        <select
          value={filters.serviceType}
          onChange={(e) => handleChange("serviceType", e.target.value)}
          className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CCAB4A] focus:border-[#CCAB4A] text-sm sm:text-base"
        >
          {serviceOptions.length > 1 && <option value="">All Selected</option>}
          {serviceOptions.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="filter-group">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Location
        </label>
        <select
          value={filters.locationType}
          onChange={(e) => handleChange("locationType", e.target.value)} // ✅ Redux updates
          className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CCAB4A] focus:border-[#CCAB4A] text-sm sm:text-base"
        >
          <option value="">Select Location</option>
          <option value="Delhi">Delhi</option>
          <option value="Noida">Noida</option>
          <option value="Greater Noida">Greater Noida</option>
          <option value="Ghaziabad">Ghaziabad</option>
        </select>
      </div>

      {/* Guest Count */}
      <div className="filter-group">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Number of Guests
        </label>
        <input
          type="number"
          min="1"
          value={filters.guestCount || ""}
          onChange={(e) => handleChange("guestCount", e.target.value)} // ✅ Redux updates
          placeholder="Enter guest count"
          className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CCAB4A] focus:border-[#CCAB4A] text-sm sm:text-base"
        />
      </div>

      <button
        onClick={onSearch}
        className="w-full bg-[#CCAB4A] text-white py-2 sm:py-3 px-4 rounded-lg font-semibold hover:bg-[#ab8f39] transition-colors duration-200 text-sm sm:text-base"
      >
        Search
      </button>
    </div>
  );
};

export default PrimaryFilters_ListingPage;

import React, { useState, useEffect } from "react";
import EastIcon from "@mui/icons-material/East";
import { useNavigate } from "react-router-dom";
import Separator_FilterBar from "./Separator_FilterBar";
import { getVendors } from "../apis/vendorApi";

const FilterBar = () => {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [locationType, setLocationType] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [guestCount, setGuestCount] = useState(0);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const eventOptions = [
    "Get-together",
    "Birthday",
    "Office Party",
    "Concert",
    "Anniversary",
    "Pre Wedding",
    "Rituals",
    "Festival",
    "Others",
  ];
  const locationOptions = [
    "Delhi",
    "Noida",
    "Greater Noida",
    "Ghaziabad"
  ];
  const serviceOptions = [
    "Decorator",
    "Entertainment",
    "Catering",
    "Photographer"
  ];

  const handleOptionClick = (setter, option) => {
    setter(option);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-wrapper")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    try {
      // Validate required fields
      if (!locationType || !serviceType) {
        alert("Please select both Location and Service Type to search for vendors.");
        return;
      }

      setIsSearching(true);
      console.log("Searching with filters:", { locationType, serviceType, eventType, date, guestCount });

      const filters = {
        location: locationType,
        serviceTypes: [serviceType],
        sortBy: "rankingScore",
        sortOrder: "desc",
        page: 1,
        limit: 10,
      };

      console.log("Calling getVendors with filters:", filters);
      const data = await getVendors(filters);
      console.log("Vendors data received:", data);

      navigate("/listings", {
        state: {
          eventType,
          serviceType,
          locationType,
          date,
          guestCount,
          vendors: data.vendors || [],
          pagination: data.pagination || {},
        },
      });
    } catch (error) {
      console.error("Error fetching vendors:", error);
      alert("Failed to fetch vendors. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="bardiv flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="bar w-full max-w-[1200px] h-auto min-h-[66px] bg-white rounded-full flex flex-col sm:flex-row justify-between items-center ring-[1px] ring-[#CCAB4A] shadow-[0_2px_10px_rgba(0,0,0,0.25)] p-2 sm:p-0">
          <div className="flex w-full h-full justify-between flex-col sm:flex-row gap-2 sm:gap-0">

            {/* Event Type */}
            <div className="event p-2 sm:p-3 pl-4 sm:pl-12 flex flex-col text-xs sm:text-sm rounded-full w-full sm:w-[200px] hover:bg-[#ffe69e4a] relative">
              <label className="font-semibold text-[14px] sm:text-[16px] cursor-pointer" onClick={() => setActiveDropdown("event")}>
                Event Type
              </label>
              <input
                type="text"
                value={eventType}
                onClick={() => setActiveDropdown("event")}
                placeholder="Select events"
                readOnly
                className="font-bold text-[#CCAB4A] placeholder-[#CCAB4A] outline-none bg-transparent cursor-pointer text-sm sm:text-base"
              />
              {activeDropdown === "event" && (
                <div className="dropdown-wrapper absolute left-0 top-[75px] w-[280px] sm:w-[350px] h-[200px] sm:h-[250px] bg-white rounded-3xl z-30 shadow overflow-y-auto">
                  {eventOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleOptionClick(setEventType, option)}
                      className={`cursor-pointer text-sm sm:text-lg p-2 sm:p-3 pl-6 sm:pl-10 pr-6 sm:pr-10 ml-3 sm:ml-5 mr-3 sm:mr-5 mt-1 sm:mt-2 rounded-full font-medium text-black ${
                        eventType === option ? "bg-[#ffe69e]" : "hover:bg-[#ffe79e45]"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <Separator_FilterBar />
            </div>

            {/* Service Type */}
            <div className="service p-2 sm:p-3 pl-4 sm:pl-5 flex flex-col text-xs sm:text-sm rounded-full w-full sm:w-[200px] hover:bg-[#ffe69e4a] relative">
              <label className="font-semibold text-[14px] sm:text-[16px] cursor-pointer" onClick={() => setActiveDropdown("service")}>
                Service Type
              </label>
              <input
                type="text"
                value={serviceType}
                onClick={() => setActiveDropdown("service")}
                placeholder="Select service"
                readOnly
                className="font-bold text-[#CCAB4A] placeholder-[#CCAB4A] outline-none bg-transparent cursor-pointer text-sm sm:text-base"
              />
              {activeDropdown === "service" && (
                <div className="dropdown-wrapper absolute left-0 top-[75px] w-[280px] sm:w-[350px] h-[200px] sm:h-[250px] bg-white rounded-3xl z-30 shadow overflow-y-auto">
                  {serviceOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleOptionClick(setServiceType, option)}
                      className={`cursor-pointer text-sm sm:text-lg p-2 sm:p-3 pl-6 sm:pl-10 pr-6 sm:pr-10 ml-3 sm:ml-5 mr-3 sm:mr-5 mt-1 sm:mt-2 rounded-full font-medium text-black ${
                        serviceType === option ? "bg-[#ffe69e]" : "hover:bg-[#ffe79e45]"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <Separator_FilterBar />
            </div>

            {/* Date */}
            <div className="date p-2 sm:p-3 pl-4 sm:pl-5 flex flex-col text-xs sm:text-sm rounded-full w-full sm:w-[180px] hover:bg-[#ffe69e4a] relative">
              <label className="font-semibold text-[14px] sm:text-[16px] cursor-pointer" onClick={() => setActiveDropdown("date")}>
                Date
              </label>
              <input
                type="text"
                value={date}
                onClick={() => setActiveDropdown("date")}
                placeholder="Add date"
                readOnly
                className="font-bold text-[#CCAB4A] placeholder-[#CCAB4A] outline-none bg-transparent cursor-pointer text-sm sm:text-base"
              />
              {activeDropdown === "date" && (
                <div className="dropdown-wrapper absolute left-0 top-[75px] bg-white rounded-3xl z-30 shadow p-3 sm:p-5">
                  <input
                    type="date"
                    className="text-[#CCAB4A] text-sm sm:text-md font-semibold cursor-pointer"
                    onChange={(e) => {
                      setDate(e.target.value);
                      setActiveDropdown(null);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <Separator_FilterBar />
            </div>

            {/* Location */}
            <div className="location p-2 sm:p-3 pl-4 sm:pl-5 flex flex-col text-xs sm:text-sm rounded-full w-full sm:w-[200px] hover:bg-[#ffe69e4a] relative">
              <label className="font-semibold text-[14px] sm:text-[16px] cursor-pointer" onClick={() => setActiveDropdown("location")}>
                Location
              </label>
              <input
                type="text"
                value={locationType}
                onClick={() => setActiveDropdown("location")}
                placeholder="Add location"
                readOnly
                className="font-bold text-[#CCAB4A] placeholder-[#CCAB4A] outline-none bg-transparent cursor-pointer text-sm sm:text-base"
              />
              {activeDropdown === "location" && (
                <div className="dropdown-wrapper absolute left-0 top-[75px] w-[280px] sm:w-[350px] h-[200px] sm:h-[250px] bg-white rounded-3xl z-30 shadow overflow-y-auto">
                  {locationOptions.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleOptionClick(setLocationType, option)}
                      className={`cursor-pointer text-sm sm:text-lg p-2 sm:p-3 pl-6 sm:pl-10 pr-6 sm:pr-10 ml-3 sm:ml-5 mr-3 sm:mr-5 mt-1 sm:mt-2 rounded-full font-medium text-black ${
                        locationType === option ? "bg-[#ffe69e]" : "hover:bg-[#ffe79e45]"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <Separator_FilterBar />
            </div>

            {/* Guests */}
            <div className="guests p-2 sm:p-3 pl-4 sm:pl-5 text-xs sm:text-sm flex justify-between items-center rounded-full w-full sm:w-[250px] hover:bg-[#ffe69e4a] relative">
              <div className="guests_left flex flex-col cursor-pointer w-full" onClick={() => setActiveDropdown("guests")}>
                <span className="font-semibold text-[14px] sm:text-[16px]">Guests</span>
                <span className={`${guestCount > 0 ? "font-bold" : "font-medium"} text-[#CCAB4A] text-sm sm:text-base`}>
                  {guestCount > 0 ? `${guestCount} Guest${guestCount > 1 ? "s" : ""}` : "Number of guests"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className={`arrowButton absolute right-2 w-[35px] h-[35px] sm:w-[45px] sm:h-[45px] rounded-full z-10 flex items-center justify-center transition-colors duration-200 transform hover:scale-105 active:scale-95 ${
                  isSearching 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#CCAB4A] hover:bg-[#ab8f39] active:bg-[#8b6f29]"
                }`}
              >
                {isSearching ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <EastIcon className="text-white" fontSize="medium" />
                )}
              </button>

              {activeDropdown === "guests" && (
                <div className="dropdown-wrapper absolute right-0 top-[75px] bg-white rounded-3xl z-30 shadow p-3 sm:p-5 w-[180px] sm:w-[220px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#CCAB4A] font-semibold text-sm sm:text-md">Guest count</span>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <button
                        type="button"
                        onClick={() => setGuestCount((prev) => Math.max(prev - 1, 0))}
                        className="text-lg sm:text-xl w-6 h-6 sm:w-8 sm:h-8 bg-[#ffe69e] rounded-full"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm sm:text-base">{guestCount}</span>
                      <button
                        type="button"
                        onClick={() => setGuestCount((prev) => prev + 1)}
                        className="text-lg sm:text-xl w-6 h-6 sm:w-8 sm:h-8 bg-[#ffe69e] rounded-full"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </form>
  );
};

export default FilterBar;

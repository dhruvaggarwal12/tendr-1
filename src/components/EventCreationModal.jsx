import React, { useState } from 'react';
import { 
  FiX, 
  FiCalendar, 
  FiUsers, 
  FiMapPin, 
  FiDollarSign, 
  FiPlus, 
  FiMinus,
  FiCheck,
  FiStar,
  FiCamera,
  FiMusic,
  FiCoffee,
  FiGift,
  FiAward
} from 'react-icons/fi';

const EventCreationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: '',
    attendees: '',
    budget: '',
    location: '',
    description: '',
    coordinator: ''
  });

  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [activeStep, setActiveStep] = useState(1);

  const eventTypes = [
    { id: 'diwali', name: 'Diwali/Festival Party', icon: '🎆' },
    { id: 'birthday', name: 'Monthly Birthday Event', icon: '🎂' },
    { id: 'achievement', name: 'Achievement Recognition', icon: '🏆' },
    { id: 'celebration', name: 'Team Celebration', icon: '🎉' },
    { id: 'outing', name: 'Team Outing', icon: '🚌' },
    { id: 'custom', name: 'Custom Event', icon: '✨' }
  ];

  const availableVendors = [
    {
      id: 1,
      name: "Elegant Events Catering",
      category: "catering",
      rating: 4.8,
      reviews: 127,
      price: 850,
      priceUnit: "per person",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      description: "Premium catering with international cuisine options",
      specialties: ["Italian", "Continental", "Indian"],
      availability: "Available"
    },
    {
      id: 2,
      name: "Golden Lens Photography",
      category: "photography",
      rating: 4.9,
      reviews: 89,
      price: 1200,
      priceUnit: "per event",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      description: "Professional wedding and event photography",
      specialties: ["Weddings", "Corporate Events", "Portraits"],
      availability: "Available"
    },
    {
      id: 3,
      name: "DJ Soundwave",
      category: "entertainment",
      rating: 4.7,
      reviews: 156,
      price: 600,
      priceUnit: "per event",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      description: "Professional DJ services with premium sound system",
      specialties: ["Weddings", "Corporate", "Birthday Parties"],
      availability: "Available"
    },
    {
      id: 4,
      name: "Bloom Decorations",
      category: "decoration",
      rating: 4.6,
      reviews: 98,
      price: 450,
      priceUnit: "per setup",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
      description: "Beautiful floral arrangements and event decoration",
      specialties: ["Floral Design", "Table Settings", "Lighting"],
      availability: "Available"
    }
  ];

  const availableAddons = [
    { id: 1, name: "Custom Memorabilia", price: 1100, description: "Personalized event souvenirs for attendees" },
    { id: 2, name: "Professional After Movie", price: 1100, description: "High-quality event recap video" },
    { id: 3, name: "Customized Invitation Flyer", price: 1100, description: "Designer invitation cards and flyers" },
    { id: 4, name: "Social Media Shoutout", price: 500, description: "Event promotion on social media platforms" },
    { id: 5, name: "Exclusive Photoshoot Backdrop", price: 800, description: "Custom branded photo backdrop" }
  ];

  const getVendorIcon = (category) => {
    switch (category) {
      case 'catering': return <FiUtensils className="w-4 h-4" />;
      case 'photography': return <FiCamera className="w-4 h-4" />;
      case 'entertainment': return <FiMusic className="w-4 h-4" />;
      case 'decoration': return <FiGift className="w-4 h-4" />;
      default: return <FiStar className="w-4 h-4" />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addVendor = (vendor) => {
    if (!selectedVendors.find(v => v.id === vendor.id)) {
      setSelectedVendors([...selectedVendors, { ...vendor, quantity: 1 }]);
    }
  };

  const removeVendor = (vendorId) => {
    setSelectedVendors(selectedVendors.filter(v => v.id !== vendorId));
  };

  const updateVendorQuantity = (vendorId, quantity) => {
    if (quantity === 0) {
      removeVendor(vendorId);
    } else {
      setSelectedVendors(selectedVendors.map(v => 
        v.id === vendorId ? { ...v, quantity } : v
      ));
    }
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateTotalCost = () => {
    const vendorCost = selectedVendors.reduce((total, vendor) => {
      return total + (vendor.price * vendor.quantity);
    }, 0);
    
    const addonCost = selectedAddons.reduce((total, addon) => {
      return total + addon.price;
    }, 0);
    
    return vendorCost + addonCost;
  };

  const handleSubmit = () => {
    const eventData = {
      ...formData,
      vendors: selectedVendors,
      addons: selectedAddons,
      totalCost: calculateTotalCost(),
      status: 'planning',
      createdAt: new Date().toISOString()
    };
    onSubmit(eventData);
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Event Details</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Event Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Diwali Celebration 2024"
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Event Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Event Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select Event Type</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Number of Attendees *</label>
          <input
            type="number"
            name="attendees"
            value={formData.attendees}
            onChange={handleInputChange}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., 150"
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Budget (₹) *</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., 45000"
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Office Premises"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Event Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Describe your event requirements..."
        />
      </div>
      
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Event Coordinator</label>
        <input
          type="text"
          name="coordinator"
          value={formData.coordinator}
          onChange={handleInputChange}
          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="e.g., Priya Sharma"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Select Vendors</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {availableVendors.map((vendor) => (
          <div key={vendor.id} className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1 sm:gap-2">
                {getVendorIcon(vendor.category)}
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{vendor.name}</h4>
              </div>
              <div className="flex items-center gap-1">
                <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                <span className="text-xs sm:text-sm text-gray-600">{vendor.rating}</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{vendor.description}</p>
            
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              {vendor.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs"
                >
                  {specialty}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base sm:text-lg font-bold text-orange-600">₹{vendor.price}</span>
                <span className="text-gray-600 text-xs sm:text-sm ml-1">{vendor.priceUnit}</span>
              </div>
              
              {selectedVendors.find(v => v.id === vendor.id) ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => updateVendorQuantity(vendor.id, selectedVendors.find(v => v.id === vendor.id).quantity - 1)}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"
                  >
                    <FiMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{selectedVendors.find(v => v.id === vendor.id).quantity}</span>
                  <button
                    onClick={() => updateVendorQuantity(vendor.id, selectedVendors.find(v => v.id === vendor.id).quantity + 1)}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"
                  >
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addVendor(vendor)}
                  className="bg-orange-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-xl hover:bg-orange-600 transition-colors text-xs sm:text-sm"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Select Add-ons</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {availableAddons.map((addon) => (
          <div key={addon.id} className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{addon.name}</h4>
                <p className="text-gray-600 text-xs sm:text-sm">{addon.description}</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 ml-2">
                <span className="text-base sm:text-lg font-bold text-orange-600">₹{addon.price}</span>
                <button
                  onClick={() => toggleAddon(addon)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors ${
                    selectedAddons.find(a => a.id === addon.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {selectedAddons.find(a => a.id === addon.id) ? (
                    <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Review & Confirm</h3>
      
      <div className="bg-gray-50 rounded-xl p-3 sm:p-6">
        <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Event Summary</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Event Details</h5>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Type:</strong> {formData.type}</p>
              <p><strong>Attendees:</strong> {formData.attendees}</p>
              <p><strong>Location:</strong> {formData.location}</p>
              <p><strong>Budget:</strong> ₹{formData.budget}</p>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Selected Vendors</h5>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {selectedVendors.map((vendor) => (
                <div key={vendor.id} className="flex justify-between">
                  <span className="truncate">{vendor.name} x{vendor.quantity}</span>
                  <span className="font-semibold">₹{vendor.price * vendor.quantity}</span>
                </div>
              ))}
            </div>
            
            <h5 className="font-medium text-gray-700 mb-2 mt-3 sm:mt-4 text-sm sm:text-base">Selected Add-ons</h5>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {selectedAddons.map((addon) => (
                <div key={addon.id} className="flex justify-between">
                  <span className="truncate">{addon.name}</span>
                  <span className="font-semibold">₹{addon.price}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-300 pt-2 sm:pt-4 mt-3 sm:mt-4">
              <div className="flex justify-between font-semibold text-sm sm:text-base">
                <span>Total Cost:</span>
                <span>₹{calculateTotalCost().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Event</h2>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 sm:mt-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  activeStep >= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 sm:w-16 mx-1 sm:mx-2 ${
                    activeStep > step ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-3 sm:p-6">
          {activeStep === 1 && renderStep1()}
          {activeStep === 2 && renderStep2()}
          {activeStep === 3 && renderStep3()}
          {activeStep === 4 && renderStep4()}
        </div>
        
        <div className="p-3 sm:p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className={`px-4 sm:px-6 py-2 rounded-xl transition-colors text-xs sm:text-sm ${
                activeStep === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>
            
            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-4 sm:px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-xs sm:text-sm"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 sm:px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-xs sm:text-sm"
              >
                Create Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreationModal; 

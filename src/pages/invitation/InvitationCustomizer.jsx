import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import './InvitationCustomizer.css';

const InvitationCustomizer = () => {
  const navigate = useNavigate();
  const { eventType, templateId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Host Information
    hostName: '',
    date: '',
    day: '',
    time: '',
    address: '',
    phoneNumber: '',
    alternativePhone: '',
    email: '',
    
    // Event Details
    eventTitle: '',
    eventDescription: '',
    
    // Guest List
    guests: [{ name: '', phone: '', email: '' }],
    
    // Additional Information
    additionalInfo: '',
    dressCode: '',
    rsvpDate: '',
    rsvpPhone: '',
    rsvpEmail: '',
    
    // Invitation Sending
    invitationSendDate: ''
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    // Load template data based on eventType and templateId
    // This would typically come from an API or template data
    setSelectedTemplate({
      id: templateId,
      name: 'Selected Template',
      image: 'https://via.placeholder.com/400x600/fbbf24/ffffff?text=Template+Preview'
    });
  }, [eventType, templateId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...formData.guests];
    updatedGuests[index][field] = value;
    setFormData(prev => ({
      ...prev,
      guests: updatedGuests
    }));
  };

  const addGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { name: '', phone: '', email: '' }]
    }));
  };

  const removeGuest = (index) => {
    if (formData.guests.length > 1) {
      const updatedGuests = formData.guests.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        guests: updatedGuests
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically save the data and generate the invitation
    console.log('Form Data:', formData);
    navigate(`/invitation/preview/${eventType}/${templateId}`, { state: { formData, selectedTemplate } });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Host Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Host Name *
          </label>
          <input
            type="text"
            value={formData.hostName}
            onChange={(e) => handleInputChange('hostName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter host name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.eventTitle}
            onChange={(e) => handleInputChange('eventTitle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter event title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Day of Week
          </label>
          <select
            value={formData.day}
            onChange={(e) => handleInputChange('day', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time *
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter phone number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Address *
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows="3"
          placeholder="Enter complete address where event will be organized"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Alternative Phone Number
          </label>
          <input
            type="tel"
            value={formData.alternativePhone}
            onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter alternative phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter email address"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h3>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Description
        </label>
        <textarea
          value={formData.eventDescription}
          onChange={(e) => handleInputChange('eventDescription', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows="4"
          placeholder="Describe your event (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dress Code
          </label>
          <select
            value={formData.dressCode}
            onChange={(e) => handleInputChange('dressCode', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select dress code</option>
            <option value="Casual">Casual</option>
            <option value="Smart Casual">Smart Casual</option>
            <option value="Semi-Formal">Semi-Formal</option>
            <option value="Formal">Formal</option>
            <option value="Black Tie">Black Tie</option>
            <option value="Traditional">Traditional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            RSVP Deadline
          </label>
          <input
            type="date"
            value={formData.rsvpDate}
            onChange={(e) => handleInputChange('rsvpDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Invitation Send Date *
          </label>
          <input
            type="date"
            value={formData.invitationSendDate}
            onChange={(e) => handleInputChange('invitationSendDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            When would you like to send the invitations to your guests?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            RSVP Phone Number
          </label>
          <input
            type="tel"
            value={formData.rsvpPhone}
            onChange={(e) => handleInputChange('rsvpPhone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter RSVP phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            RSVP Email
          </label>
          <input
            type="email"
            value={formData.rsvpEmail}
            onChange={(e) => handleInputChange('rsvpEmail', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter RSVP email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Information
        </label>
        <textarea
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows="3"
          placeholder="Any additional information for guests (parking, gifts, etc.)"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Guest List</h3>
        <button
          type="button"
          onClick={addGuest}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
        >
          + Add Guest
        </button>
      </div>

      <div className="space-y-4">
        {formData.guests.map((guest, index) => (
          <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Guest #{index + 1}</h4>
              {formData.guests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGuest(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guest Name *
                </label>
                <input
                  type="text"
                  value={guest.name}
                  onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter guest name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Review & Preview</h3>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">Event Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">Event Details</h5>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Event:</span> {formData.eventTitle}</p>
              <p><span className="font-medium">Host:</span> {formData.hostName}</p>
              <p><span className="font-medium">Date:</span> {formData.date} {formData.day && `(${formData.day})`}</p>
              <p><span className="font-medium">Time:</span> {formData.time}</p>
              <p><span className="font-medium">Location:</span> {formData.address}</p>
              <p><span className="font-medium">Send Date:</span> {formData.invitationSendDate ? new Date(formData.invitationSendDate).toLocaleDateString() : 'Not set'}</p>
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold text-gray-700 mb-2">Contact Information</h5>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
              {formData.alternativePhone && <p><span className="font-medium">Alt Phone:</span> {formData.alternativePhone}</p>}
              <p><span className="font-medium">Email:</span> {formData.email}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h5 className="font-semibold text-gray-700 mb-2">Guest List ({formData.guests.length} guests)</h5>
          <div className="max-h-32 overflow-y-auto">
            {formData.guests.map((guest, index) => (
              <div key={index} className="text-sm text-gray-600 py-1">
                {guest.name} {guest.phone && `(${guest.phone})`} {guest.email && `- ${guest.email}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Host Info', description: 'Basic event and host details' },
    { number: 2, title: 'Event Details', description: 'Additional event information' },
    { number: 3, title: 'Guest List', description: 'Add your guests' },
    { number: 4, title: 'Review', description: 'Review and preview' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <SEO title="Customise Invitation" description="Customise your digital invitation on Tendr." path="/invitation/customize" noIndex={true} />
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/invitation/templates/${eventType}`)}
                className="text-amber-600 hover:text-amber-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Customize Your Invitation
                </h1>
                <p className="text-lg text-gray-600">
                  Fill in the details to create your personalized invitation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-amber-500 border-amber-500 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step.number}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-semibold ${
                    currentStep >= step.number ? 'text-amber-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-amber-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/invitation/templates/${eventType}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  Generate Invitation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationCustomizer;

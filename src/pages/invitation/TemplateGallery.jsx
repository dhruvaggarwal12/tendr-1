import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import { EVENT_TYPE_DATA } from '../../data/invitationTemplates';
import './TemplateGallery.css';

const TemplateGallery = () => {
  const navigate = useNavigate();
  const { eventType } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const currentEvent = EVENT_TYPE_DATA[eventType];

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Type Not Found</h1>
          <button
            onClick={() => navigate('/invitation')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
          >
            Back to Event Types
          </button>
        </div>
      </div>
    );
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    navigate(`/invitation/customize/${eventType}/${template.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <SEO title="Invitation Templates" description="Choose an invitation template for your event on Tendr." path="/invitation/templates" noIndex={false} />
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/invitation')}
                className="text-amber-600 hover:text-amber-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {currentEvent.icon} {currentEvent.name}
                </h1>
                <p className="text-lg text-gray-600">
                  Choose from our curated collection of {currentEvent.name.toLowerCase()} templates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Select Your Template
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Click on any template to customize it with your event details, host information, and guest list.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {currentEvent.templates.map((template, index) => (
            <div
              key={template.id}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              onClick={() => handleTemplateSelect(template)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent group-hover:border-amber-300">
                {/* Template Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400/fbbf24/ffffff?text=Template+Preview';
                    }}
                  />
                </div>
                
                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      Template #{template.id}
                    </span>
                    <div className="flex items-center text-amber-600 font-semibold text-sm group-hover:text-amber-700">
                      Customize
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Template Request */}
        <div className="mt-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl shadow-lg p-8 border-2 border-amber-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Not Got Perfect for You?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find the perfect template? No worries! Tell us about your event and describe the template you're looking for. 
              We'll create custom templates just for you.
            </p>
            <button
              onClick={() => navigate(`/invitation/custom-request/${eventType}`)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Request Custom Template
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              All templates are fully customizable. You can change colors, fonts, text, and add your own images. 
              Don't worry about making the perfect choice now - you can always modify everything later!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Fully Customizable
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                High Quality
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Easy to Edit
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;

import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import './AftermovieCustomizer.css';

const AftermovieCustomizer = () => {
  const navigate = useNavigate();
  const { aftermovieType } = useParams();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [customizationData, setCustomizationData] = useState({
    style: '',
    description: '',
    textCustomization: '',
    musicPreference: '',
    colorScheme: '',
    transitionStyle: '',
    duration: ''
  });

  const aftermovieTypeData = {
    'reel': {
      name: 'REEL',
      icon: '🎬',
      description: 'Dynamic vertical videos with trending effects',
      color: 'from-purple-500 to-pink-500',
      styles: [
        { id: 'trending', name: 'Trending', description: 'Latest social media trends with dynamic transitions' },
        { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple with subtle effects' },
        { id: 'vibrant', name: 'Vibrant', description: 'Bold colors and energetic transitions' },
        { id: 'elegant', name: 'Elegant', description: 'Sophisticated and refined styling' }
      ]
    },
    'slideshow': {
      name: 'SLIDESHOW',
      icon: '📸',
      description: 'Elegant photo presentations with cinematic effects',
      color: 'from-blue-500 to-indigo-500',
      styles: [
        { id: 'cinematic', name: 'Cinematic', description: 'Movie-like transitions and effects' },
        { id: 'classic', name: 'Classic', description: 'Traditional slideshow with smooth transitions' },
        { id: 'modern', name: 'Modern', description: 'Contemporary design with sleek animations' },
        { id: 'romantic', name: 'Romantic', description: 'Soft and dreamy with gentle effects' }
      ]
    }
  };

  const currentType = aftermovieTypeData[aftermovieType];

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    if (files.length > 0 && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
    if (files.length > 0 && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleDeleteFile = (indexToDelete) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleAddMoreFiles = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleInputChange = (field, value) => {
    setCustomizationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateAftermovie = () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Your aftermovie is being processed! We will notify you when it\'s ready for download.');
      navigate('/aftermovie');
    }, 3000);
  };

  if (!currentType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aftermovie Type Not Found</h1>
          <button
            onClick={() => navigate('/aftermovie')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Back to Aftermovie Creator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <SEO title="Aftermovie Customiser" description="Customise your event aftermovie on Tendr." path="/aftermovie/customize" noIndex={true} />
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/aftermovie')}
                className="text-purple-600 hover:text-purple-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create {currentType.icon} {currentType.name}
                </h1>
                <p className="text-lg text-gray-600">
                  {currentType.description}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of 3
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Step 1: File Upload */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Upload Your Event Photos & Videos
                </h2>
                <p className="text-gray-600">
                  Upload your event memories and we'll create a stunning {currentType.name.toLowerCase()} for you.
                </p>
              </div>

              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center mb-8 hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drag & Drop Your Files Here
                </h3>
                <p className="text-gray-600 mb-4">
                  Or click to browse and select your photos and videos
                </p>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                  Choose Files
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Supports JPG, PNG, MP4, MOV files up to 100MB each
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploadedFiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Selected Files ({uploadedFiles.length})</h3>
                    <button
                      onClick={handleAddMoreFiles}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add More</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedFiles.slice(0, 8).map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🎥</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                    {uploadedFiles.length > 8 && (
                      <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-600">+{uploadedFiles.length - 8} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Style Selection */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Choose Your Style
                </h2>
                <p className="text-gray-600">
                  Select the style that best matches your event and preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {currentType.styles.map((style) => (
                  <div
                    key={style.id}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      customizationData.style === style.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => handleInputChange('style', style.id)}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{style.name}</h3>
                    <p className="text-gray-600">{style.description}</p>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Describe Your Vision
                </label>
                <textarea
                  value={customizationData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us more about the type of reel/slideshow you want. What mood, theme, or specific effects are you looking for?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* Step 3: Customization */}
          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Customize Your {currentType.name}
                </h2>
                <p className="text-gray-600">
                  Add the final touches to make your aftermovie perfect.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Text Customization
                  </label>
                  <textarea
                    value={customizationData.textCustomization}
                    onChange={(e) => handleInputChange('textCustomization', e.target.value)}
                    placeholder="Any specific text, captions, or messages you want to include?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Music Preference
                  </label>
                  <select
                    value={customizationData.musicPreference}
                    onChange={(e) => handleInputChange('musicPreference', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select music style</option>
                    <option value="upbeat">Upbeat & Energetic</option>
                    <option value="romantic">Romantic & Soft</option>
                    <option value="classical">Classical & Elegant</option>
                    <option value="modern">Modern & Trendy</option>
                    <option value="custom">I'll provide my own music</option>
                    <option value="none">No music</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Color Scheme
                    </label>
                    <select
                      value={customizationData.colorScheme}
                      onChange={(e) => handleInputChange('colorScheme', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Auto (based on your photos)</option>
                      <option value="warm">Warm tones (oranges, reds)</option>
                      <option value="cool">Cool tones (blues, greens)</option>
                      <option value="neutral">Neutral (grays, beiges)</option>
                      <option value="vibrant">Vibrant (bright colors)</option>
                      <option value="monochrome">Black & White</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Transition Style
                    </label>
                    <select
                      value={customizationData.transitionStyle}
                      onChange={(e) => handleInputChange('transitionStyle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Auto (based on style)</option>
                      <option value="smooth">Smooth & Gentle</option>
                      <option value="dynamic">Dynamic & Fast</option>
                      <option value="creative">Creative & Unique</option>
                      <option value="minimal">Minimal & Simple</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Preferred Duration
                  </label>
                  <select
                    value={customizationData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Auto (based on content)</option>
                    {currentType.name === 'REEL' ? (
                      <>
                        <option value="15">15 seconds</option>
                        <option value="30">30 seconds</option>
                        <option value="45">45 seconds</option>
                        <option value="60">60 seconds</option>
                      </>
                    ) : (
                      <>
                        <option value="2">2 minutes</option>
                        <option value="3">3 minutes</option>
                        <option value="4">4 minutes</option>
                        <option value="5">5 minutes</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 2 && !customizationData.style}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleCreateAftermovie}
                disabled={isProcessing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Your {currentType.name}...</span>
                  </>
                ) : (
                  <>
                    <span>Create My {currentType.name}</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AftermovieCustomizer;

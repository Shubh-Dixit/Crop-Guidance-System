import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { getFarmingTip } from '../services/geminiService';
import { getCurrentWeather } from '../services/weatherService';
import Footer from '../components/Footer';
import FloatingChatBot from '../components/FloatingChatBot';
import { 
  Sprout, 
  Cloud, 
  TrendingUp, 
  TestTube,
  Globe,
  ChevronDown,
  Leaf,
  Sun,
  User,
  Bell,
  BookOpen,
  Clock,
  AlertTriangle,
  Droplets,
  Wind,
  ArrowRight,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useTranslation } from "react-i18next";

const HomePage: React.FC = () => {
  const { farmerProfile } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const [currentLanguageCode, setCurrentLanguageCode] = useState<string>(currentLanguage?.code || 'en');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  
  const [weatherData, setWeatherData] = useState({
    temp: 0,
    humidity: 0,
    windSpeed: 0,
    condition: '',
    icon: '',
    loading: true,
    error: null as string | null
  });
  
  const [farmingTip, setFarmingTip] = useState({
    content: '',
    loading: true,
    error: null as string | null
  });

  // Fetch weather data when component mounts
  useEffect(() => {
    const fetchWeatherAndTip = async () => {
      if (!farmerProfile?.farmLocation) return;
      
      try {
        // First, fetch weather data
        if (!farmerProfile.farmLocation.coordinates) {
          throw new Error('Farm location coordinates not available');
        }
        const weatherData = await getCurrentWeather(
          farmerProfile.farmLocation.coordinates.latitude,
          farmerProfile.farmLocation.coordinates.longitude
        );
        setWeatherData({
          temp: Math.round(weatherData.main.temp),
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
          condition: weatherData.weather[0]?.main || 'Clear',
          icon: `https://openweathermap.org/img/wn/${weatherData.weather[0]?.icon}@2x.png`,
          loading: false,
          error: null
        });
        
        // Get current season based on month
        const month = new Date().getMonth();
        const season = month >= 2 && month <= 4 ? 'spring' : 
                      month >= 5 && month <= 7 ? 'summer' :
                      month >= 8 && month <= 10 ? 'autumn' : 'winter';
        
        // Fetch farming tip
        const locationName = farmerProfile.farmLocation.district || 'your region';
        const tip = await getFarmingTip(locationName, season);
        setFarmingTip({
          content: tip,
          loading: false,
          error: null
        });
        
      } catch (error) {
        console.error('Error:', error);
        setWeatherData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load weather data'
        }));
        
        setFarmingTip(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load farming tip'
        }));
      }
    };

    fetchWeatherAndTip();
  }, [farmerProfile?.farmLocation]);

  const farmingTips = [
    { id: 1, title: 'Optimal Irrigation Timing', content: 'Water your crops early morning or late evening to reduce evaporation losses.', category: 'Irrigation' },
    { id: 2, title: 'Soil pH Management', content: 'Test soil pH regularly and maintain it between 6.0-7.0 for most crops.', category: 'Soil Health' },
    { id: 3, title: 'Crop Rotation Benefits', content: 'Rotate crops annually to prevent soil depletion and reduce pest problems.', category: 'Crop Management' }
  ];

  const quickActions = [
    {
      title: 'Soil Analysis',
      description: 'Test your soil health and get recommendations',
      icon: TestTube,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      path: '/soil-analysis'
    },
    {
      title: 'Weather',
      description: 'Get local weather forecasts and alerts',
      icon: Cloud,
      color: 'from-blue-500 to-sky-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/weather'
    },
    {
      title: 'Recommendations',
      description: 'Personalized crop suggestions for your farm',
      icon: Sprout,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      path: '/recommendations'
    },
    {
      title: 'Market Insights',
      description: 'Current prices and market trends',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/market-insights'
    },
    {
      title: 'Disease Detection',
      description: 'Identify plant diseases from images',
      icon: Activity,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      path: '/disease-detection'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-xl">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CropWise</h1>
                <p className="text-sm text-gray-600">Smart Farming Solutions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg border border-green-200 transition-colors"
                >
                  <Globe className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {languages.find(lang => lang.code === currentLanguageCode)?.nativeName || 'English'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang);
                          setCurrentLanguageCode(lang.code);
                          i18n.changeLanguage(lang.code);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${currentLanguageCode === lang.code ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {lang.nativeName} ({lang.name})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Profile Button */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{farmerProfile?.displayName}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sun className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {farmerProfile?.displayName}!
            </h2>
            <Sprout className="h-8 w-8 text-green-500 ml-3" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized crop recommendations, soil insights, and market data to make informed farming decisions
          </p>
        </div>

        {/* Today's Farming Tip */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 mb-8 border border-green-100">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Today's Farming Tip</h2>
          </div>
          
          {farmingTip.loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : farmingTip.error ? (
            <p className="text-gray-600 italic">{farmingTip.error}</p>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-green-100">
              <p className="text-gray-800">
                <span className="text-green-600 font-medium">💡 Tip: </span>
                {farmingTip.content}
              </p>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
          
          <div className="mt-3 text-sm text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>AI-generated tip based on your location and season</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate(action.path)}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className={`${action.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {action.description}
                    </p>
                    <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-lg text-sm font-medium group-hover:shadow-lg transition-shadow`}>
                      Get Started
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disease Detection Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Plant Health Check</h2>
            <button 
              onClick={() => navigate('/disease-detection')}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Activity className="h-4 w-4" />
              <span>Check Plant Health</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Quickly identify plant diseases</h3>
              <p className="text-gray-600">
                Upload a photo of your plant leaves and our AI will analyze it for potential diseases. Get instant results with treatment recommendations.
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Instant disease detection</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Detailed treatment recommendations</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Prevention tips for healthy plants</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Example */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <img 
                  className="h-40 w-40 object-cover mx-auto mb-3 rounded-lg" 
                  src="/plant-placeholder.png" 
                  alt="Plant disease detection" 
                  width={160} 
                  height={160} 
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDFkMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTYiIHg9IjIiIHk9IjQiIHJ4PSIyIi8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjEwLjUiIHI9IjIuNSIvPgo8cGF0aCBkPSJNMTUuNjQgMTMuN2wtMy4yOSAzLjI5Yy0uMTQuMTQtLjMzLjIyLS41My4yMmgtMGMtLjIgMC0uMzktLjA4LS41My0uMjJMNy41OSAxNCIvPgo8L3N2Zz4=';
                  }}
                />
                <p className="text-sm text-gray-500">Example: Healthy vs. Diseased Leaf</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Weather</h2>
          {weatherData.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : weatherData.error ? (
            <div className="text-center py-4 text-red-500">
              {weatherData.error}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  {weatherData.icon ? (
                    <img src={weatherData.icon} alt={weatherData.condition} className="h-12 w-12 mr-4" />
                  ) : (
                    <Cloud className="h-12 w-12 text-blue-500 mr-4" />
                  )}
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{weatherData.temp}°C</p>
                    <p className="text-gray-600 capitalize">{weatherData.condition.toLowerCase()}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Humidity:</span> {weatherData.humidity}%
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Wind:</span> {Math.round(weatherData.windSpeed * 3.6)} km/h
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Farming Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 text-green-600 mr-2" />
              Today's Farming Tips
            </h3>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {farmingTips.map((tip) => (
              <div key={tip.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{tip.category}</span>
                </div>
                <p className="text-sm text-gray-600">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts and Notifications */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Weather Alert</h3>
              <p className="text-sm text-red-700 mb-2">Heavy rainfall expected in your area tomorrow. Consider covering sensitive crops and adjusting irrigation schedules.</p>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center">
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Crop Calendar</h4>
              <p className="text-sm text-gray-600">Track sowing, harvesting, and seasonal activities</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TestTube className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Expert Advice</h4>
              <p className="text-sm text-gray-600">Connect with agricultural specialists and experts</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Yield Tracking</h4>
              <p className="text-sm text-gray-600">Monitor and analyze your harvest performance</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Floating Chat Bot */}
      <FloatingChatBot />
    </div>
  );
};

export default HomePage;

// WeatherForecast.tsx  (FULL FIXED VERSION)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import {
  ArrowLeft,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Moon
} from 'lucide-react';

import Footer from './Footer';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    feelsLike: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rainfall: number;
    humidity: number;
  }>;
  alerts: any[];
  location: string;
}

//
// ICON MAPPER
//
const mapIcon = (id: number, icon: string) => {
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'rain';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'fog';
  if (id === 800) return icon.includes('n') ? 'moon' : 'sunny';
  if (id > 800) return 'cloudy';
  return 'sunny';
};

const WeatherIcon = ({ condition, size = 24 }: any) => {
  const props = { size };

  switch (condition.toLowerCase()) {
    case 'sunny': case 'clear': return <Sun {...props} className="text-yellow-500" />;
    case 'moon': return <Moon {...props} className="text-gray-600" />;
    case 'cloudy': case 'clouds': return <Cloud {...props} className="text-gray-400" />;
    case 'rain': case 'rainy': return <CloudRain {...props} className="text-blue-400" />;
    case 'snow': return <CloudSnow {...props} className="text-blue-200" />;
    case 'thunderstorm': return <Zap {...props} className="text-yellow-400" />;
    case 'fog': case 'mist': return <Droplets {...props} className="text-gray-300" />;
    default: return <Sun {...props} className="text-yellow-500" />;
  }
};

//
// MAIN COMPONENT
//
const WeatherForecast = ({ onBack }: any) => {
  const navigate = useNavigate();
  const { farmerProfile } = useAuth();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!farmerProfile?.farmLocation?.coordinates) {
          setError("No location found. Please update your farm location.");
          return;
        }

        const { latitude, longitude } = farmerProfile.farmLocation.coordinates;

        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          setError("Invalid location saved in profile.");
          return;
        }

        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

if (!apiKey) {
  setError("Weather API key missing. Please add VITE_WEATHER_API_KEY in .env ");
  return;
}


        // API URLs
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        // Fetch current weather
        const currentRes = await fetch(currentUrl);
        if (!currentRes.ok) throw new Error("Failed current weather");

        const currentJson = await currentRes.json();

        const currentWeather = {
          temp: Math.round(currentJson.main.temp),
          condition: currentJson.weather[0].main,
          icon: mapIcon(currentJson.weather[0].id, currentJson.weather[0].icon),
          humidity: currentJson.main.humidity,
          windSpeed: Math.round(currentJson.wind.speed * 3.6),
          visibility: currentJson.visibility / 1000,
          feelsLike: Math.round(currentJson.main.feels_like)
        };

        // Fetch forecast (safe mode)
        let forecastJson = null;
        try {
          const forecastRes = await fetch(forecastUrl);
          if (forecastRes.ok) {
            forecastJson = await forecastRes.json();
          } else {
            console.warn("Forecast failed:", await forecastRes.text());
          }
        } catch {
          console.warn("Forecast request crashed.");
        }

        let dailyForecast: any[] = [];

        if (forecastJson?.list) {
          dailyForecast = forecastJson.list.reduce((acc: any[], item: any) => {
            const date = new Date(item.dt * 1000);
            const d = date.toISOString().split("T")[0];
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

            if (!acc.find(x => x.date === d)) {
              acc.push({
                date: d,
                day: d === new Date().toISOString().split("T")[0] ? "Today" : dayName,
                high: Math.round(item.main.temp_max),
                low: Math.round(item.main.temp_min),
                condition: item.weather[0].main,
                icon: mapIcon(item.weather[0].id, item.weather[0].icon),
                rainfall: item.rain ? Math.round(item.rain["3h"] || 0) : 0,
                humidity: item.main.humidity
              });
            }

            return acc;
          }, []).slice(0, 7);
        }

        setWeatherData({
          current: currentWeather,
          forecast: dailyForecast,
          alerts: [], // free tier doesn't provide alerts
          location: `${currentJson.name}, ${currentJson.sys.country}`
        });

      } catch (e: any) {
        console.error(e);
        setError("Failed to fetch weather data.");
      } finally {
        setLoading(false);
        setLastUpdated(new Date());
      }
    };

    fetchWeather();
  }, [farmerProfile]);


  //
  // LOADING UI
  //
  if (loading && !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  //
  // ERROR UI
  //
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-700">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  //
  // MAIN WEATHER UI
  //
  const w = weatherData!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => onBack ? onBack() : navigate('/')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-800">Weather Forecast</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {w.location}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Updated</p>
            <p className="text-sm text-gray-700">{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>


      {/* CURRENT WEATHER */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            
            <div>
              <h2 className="text-3xl font-bold">{w.current.temp}°C</h2>
              <p className="text-blue-100">{w.current.condition}</p>

              <div className="mt-4 space-y-1 text-sm">
                <p><Thermometer className="inline h-4" /> Feels like {w.current.feelsLike}°C</p>
                <p><Droplets className="inline h-4" /> Humidity {w.current.humidity}%</p>
                <p><Wind className="inline h-4" /> Wind {w.current.windSpeed} km/h</p>
              </div>
            </div>

            <WeatherIcon condition={w.current.icon} size={75} />
          </div>
        </div>


        {/* FORECAST */}
        {w.forecast.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-md">
            <div className="bg-blue-500 text-white px-4 py-3 rounded-t-xl">
              <h3 className="text-lg font-semibold">7-Day Forecast</h3>
            </div>

            <div className="p-4 space-y-3">
              {w.forecast.map((d, i) => (
                <div key={i} className="flex justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{d.day}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <WeatherIcon condition={d.icon} size={30} />
                    <span className="text-gray-700">{d.condition}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">{d.high}° / {d.low}°</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default WeatherForecast;

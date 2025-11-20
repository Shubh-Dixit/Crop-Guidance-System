import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Filter,
  ChevronDown,
  Loader2,
  Store,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  fetchMarketData,
  MarketData as APIMarketData,
} from "../services/marketService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Footer from "./Footer";

interface MarketInsightsProps {
  onBack?: () => void;
}

interface FilterState {
  state: string;
  district: string;
  market: string;
  commodity: string;
  limit: number;
  offset: number;
  searchQuery: string;
}

const DEFAULT_FILTERS: FilterState = {
  state: "",
  district: "",
  market: "",
  commodity: "",
  limit: 20,
  offset: 0,
  searchQuery: "",
};

// ✅ Static list of all Indian states / UTs for the State dropdown
const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const MarketInsights: React.FC<MarketInsightsProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const [marketData, setMarketData] = useState<APIMarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [districts, setDistricts] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);

  // ------- Helper: derive “smart” dropdown options from current data -------
  const updateFilterOptions = (data: APIMarketData[], currentFilters: FilterState) => {
    // Filter stepwise using current filters for cascading effect
    const byState = currentFilters.state
      ? data.filter((d) => d.state === currentFilters.state)
      : data;

    const byDistrict = currentFilters.district
      ? byState.filter((d) => d.district === currentFilters.district)
      : byState;

    const byMarket = currentFilters.market
      ? byDistrict.filter((d) => d.market === currentFilters.market)
      : byDistrict;

    const uniqueDistricts = Array.from(
      new Set(byState.map((d) => d.district).filter(Boolean))
    ).sort();

    const uniqueMarkets = Array.from(
      new Set(byDistrict.map((d) => d.market).filter(Boolean))
    ).sort();

    const uniqueCommodities = Array.from(
      new Set(byMarket.map((d) => d.commodity).filter(Boolean))
    ).sort();

    setDistricts(uniqueDistricts);
    setMarkets(uniqueMarkets);
    setCommodities(uniqueCommodities);
  };

  // ------- Fetch data whenever filters change -------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiFilters: any = {
          limit: filters.limit,
          offset: filters.offset,
        };

        if (filters.state) apiFilters.state = filters.state;
        if (filters.district) apiFilters.district = filters.district;
        if (filters.market) apiFilters.market = filters.market;
        if (filters.commodity) apiFilters.commodity = filters.commodity;

        const data = await fetchMarketData(apiFilters);

        // Local search on client (market / commodity / district / state)
        let records = data;
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          records = records.filter((item) => {
            return (
              item.market?.toLowerCase().includes(q) ||
              item.commodity?.toLowerCase().includes(q) ||
              item.district?.toLowerCase().includes(q) ||
              item.state?.toLowerCase().includes(q)
            );
          });
        }

        setMarketData(records);
        updateFilterOptions(records, filters);
      } catch (err) {
        console.error("Error fetching market data:", err);
        setError("Failed to load market data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // ------- Handle filter changes -------
  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters((prev) => {
      const updated: FilterState = {
        ...prev,
        [key]: value,
      };

      // Reset dependent filters when parent changes
      if (key === "state") {
        updated.district = "";
        updated.market = "";
        updated.commodity = "";
      } else if (key === "district") {
        updated.market = "";
        updated.commodity = "";
      } else if (key === "market") {
        updated.commodity = "";
      }

      // Reset pagination on filter change
      if (key !== "offset") {
        updated.offset = 0;
      }

      return updated;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      searchQuery: value,
      offset: 0,
    }));
  };

  const refreshData = () => {
    setFilters((prev) => ({
      ...prev,
      offset: 0,
    }));
  };

  // ------- Pagination helpers -------
  const pageSize = filters.limit;
  const currentPage = Math.floor(filters.offset / pageSize) + 1;
  const canGoPrev = filters.offset > 0;
  // If we received fewer than pageSize rows, probably last page
  const canGoNext = marketData.length === pageSize;

  const goNextPage = () => {
    if (!canGoNext) return;
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const goPrevPage = () => {
    if (!canGoPrev) return;
    setFilters((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  // ------- Build chart data for price trend -------
  const chartData = useMemo(() => {
    if (!marketData.length) return [];

    let series = marketData;

    if (filters.commodity) {
      series = series.filter((d) => d.commodity === filters.commodity);
    }
    if (filters.market) {
      series = series.filter((d) => d.market === filters.market);
    }

    const sanitized = series
      .filter((d) => d.arrival_date && d.modal_price)
      .map((d) => ({
        date: d.arrival_date,
        price: Number(d.modal_price),
        market: d.market,
        commodity: d.commodity,
      }))
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    // Show recent up to 20 points
    return sanitized.slice(-20);
  }, [marketData, filters.market, filters.commodity]);

  // ------- Simple “AI-style” insight about prices -------
  const priceInsight = useMemo(() => {
    if (!marketData.length) return "No data available for the current filters.";

    const prices = marketData
      .map((d) => Number(d.modal_price))
      .filter((p) => !isNaN(p));

    if (!prices.length) return "No price information available in this result set.";

    const avg =
      prices.reduce((sum, p) => sum + p, 0) / Math.max(1, prices.length);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const minRec = marketData.find(
      (d) => Number(d.modal_price) === minPrice
    );
    const maxRec = marketData.find(
      (d) => Number(d.modal_price) === maxPrice
    );

    let context = "";
    if (filters.commodity) {
      context += `for ${filters.commodity}`;
    }
    if (filters.state) {
      context += context ? ` in ${filters.state}` : `in ${filters.state}`;
    }

    const direction =
      maxPrice > avg * 1.1
        ? "higher than usual"
        : minPrice < avg * 0.9
        ? "lower than usual"
        : "around the typical range";

    return (
      `Average modal price ${context || "overall"} is around ₹${avg
        .toFixed(0)
        .toLocaleString()}. ` +
      `Current prices look ${direction}. ` +
      (maxRec
        ? `Highest price is ₹${maxPrice.toLocaleString()} for ${
            maxRec.commodity
          } at ${maxRec.market}, ${maxRec.district}. `
        : "") +
      (minRec
        ? `Lowest price is ₹${minPrice.toLocaleString()} for ${
            minRec.commodity
          } at ${minRec.market}, ${minRec.district}.`
        : "")
    );
  }, [marketData, filters.commodity, filters.state]);

  // ------- Loading / Error states -------
  if (loading && marketData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => (onBack ? onBack() : navigate("/"))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Market Insights
                </h1>
                <p className="text-sm text-gray-600">
                  Current mandi prices and smart insights
                </p>
              </div>
            </div>

            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by market, commodity, district or state (e.g., Kanpur, Wheat, Delhi)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filters.searchQuery}
                onChange={handleSearchChange}
              />
              {filters.searchQuery && (
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, searchQuery: "" }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700"
              >
                <Filter className="h-4 w-4" />
                <span>Filter Options</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) =>
                      handleFilterChange("state", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All States</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={filters.district}
                    onChange={(e) =>
                      handleFilterChange("district", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Districts</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Market */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market
                  </label>
                  <select
                    value={filters.market}
                    onChange={(e) =>
                      handleFilterChange("market", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Markets</option>
                    {markets.map((market) => (
                      <option key={market} value={market}>
                        {market}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commodity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commodity
                  </label>
                  <select
                    value={filters.commodity}
                    onChange={(e) =>
                      handleFilterChange("commodity", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Commodities</option>
                    {commodities.map((commodity) => (
                      <option key={commodity} value={commodity}>
                        {commodity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights + Trend Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Insight Card */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-green-100 p-4 flex flex-col">
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-900">
                Smart Price Insight
              </h3>
            </div>
            <p className="text-sm text-gray-700 flex-1">{priceInsight}</p>
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Recent Modal Price Trend
                </h3>
              </div>
              <span className="text-xs text-gray-500">
                {filters.commodity
                  ? `Commodity: ${filters.commodity}`
                  : "All commodities"}
              </span>
            </div>
            {chartData.length > 1 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(v) => `₹${v}`}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: any) => [`₹${value}`, "Modal Price"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Modal Price (₹/q)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                Not enough data points to draw a trend. Try removing some
                filters or changing commodity/market.
              </div>
            )}
          </div>
        </div>

        {/* Market Data Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {filters.state
                    ? `Markets in ${filters.state}`
                    : "Current Market Prices"}
                </h3>
                <p className="text-blue-100 text-sm">
                  Live prices from major markets across India
                </p>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Store className="h-4 w-4" />
                <span className="text-sm">
                  {marketData.length} row{marketData.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commodity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variety
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modal Price (₹/q)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-gray-500 text-sm"
                    >
                      No records found for these filters. Try clearing some
                      filters or changing the search term.
                    </td>
                  </tr>
                ) : (
                  marketData.map((item, idx) => (
                    <tr key={`${item.market}-${item.commodity}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.state || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.district || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.market || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.commodity || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.variety || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹
                        {item.modal_price
                          ? Number(item.modal_price).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.arrival_date || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Page {currentPage} · Showing up to {pageSize} rows
            </div>
            <div className="flex space-x-2">
              <button
                onClick={goPrevPage}
                disabled={!canGoPrev}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={goNextPage}
                disabled={!canGoNext}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MarketInsights;

import React, { useState } from 'react';
import { SearchParams } from '../types';
import { Search, MapPin, Globe, Briefcase, ListFilter } from 'lucide-react';

interface LeadFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSearch, isLoading }) => {
  const [formData, setFormData] = useState<SearchParams>({
    city: '',
    country: '',
    keyword: '',
    limit: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' ? parseInt(value, 10) : value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Search className="w-5 h-5 text-purple-600" />
        Define Your Search
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        
        {/* Keyword */}
        <div className="lg:col-span-4 space-y-1">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" /> Niche or Keyword
          </label>
          <input
            required
            type="text"
            name="keyword"
            value={formData.keyword}
            onChange={handleChange}
            placeholder="e.g. Dentists, Coffee Shops"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
        </div>

        {/* City */}
        <div className="lg:col-span-3 space-y-1">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> City
          </label>
          <input
            required
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Madrid"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
        </div>

        {/* Country */}
        <div className="lg:col-span-3 space-y-1">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Country
          </label>
          <input
            required
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g. Spain"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
        </div>

        {/* Limit */}
        <div className="lg:col-span-2 space-y-1">
          <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
            <ListFilter className="w-3.5 h-3.5" /> Max Results
          </label>
          <select
            name="limit"
            value={formData.limit}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="lg:col-span-12 mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg text-slate-900 font-bold shadow-md transition-all flex justify-center items-center gap-2
              ${isLoading 
                ? 'bg-amber-200 cursor-not-allowed text-slate-500' 
                : 'bg-[#FFC20E] hover:bg-[#FDB913] hover:shadow-lg active:transform active:scale-[0.99]'
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Find Leads'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
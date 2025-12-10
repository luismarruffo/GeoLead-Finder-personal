import React, { useState } from 'react';
import { SearchParams } from '../types';
import { Search, MapPin, Globe, Briefcase, ListFilter, MessageSquare, AlertCircle } from 'lucide-react';

interface LeadFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSearch, isLoading }) => {
  const [formData, setFormData] = useState<SearchParams>({
    city: '',
    country: '',
    keyword: '',
    limit: 10,
    instructions: ''
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation Logic:
    // Option A: Keyword AND City are present
    const hasStructuredData = formData.keyword.trim() !== '' && formData.city.trim() !== '';
    // Option B: Instructions are present
    const hasInstructions = formData.instructions && formData.instructions.trim() !== '';

    if (!hasStructuredData && !hasInstructions) {
      setValidationError("Please fill in either the 'Keyword & City' fields OR the 'Search Prompt' to start.");
      return;
    }

    onSearch(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' ? parseInt(value, 10) : value
    }));
    // Clear error when user types
    if (validationError) setValidationError(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-600" />
          Define Your Search
        </h2>

        {/* Global Setting: Max Results */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <ListFilter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-600">Max Results:</span>
          <select
            name="limit"
            value={formData.limit}
            onChange={handleChange}
            className="bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer"
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
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* OPTION 1: Structured Search */}
        <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 focus-within:border-purple-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Option 1: Search by Details</div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Niche or Keyword */}
            <div className="md:col-span-5 space-y-1">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Niche or Keyword
              </label>
              <input
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                placeholder="e.g. Dentists"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            {/* City */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Madrid"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            {/* Country */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. Spain"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* OR Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* OPTION 2: Prompt Search */}
        <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 focus-within:border-purple-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Option 2: Search by Custom Prompt</div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Describe what you are looking for
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="e.g. Find large department stores in Panama that have many employees. Do not include Doit Center or Novey."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {validationError}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-2">
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
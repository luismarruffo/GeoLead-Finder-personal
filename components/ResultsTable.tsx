import React from 'react';
import { Lead } from '../types';
import { Download, ExternalLink, MapPin, Phone, Mail, Globe, Trash2, Sparkles, Tag, Layers } from 'lucide-react';

interface ResultsTableProps {
  leads: Lead[];
  onClear: () => void;
  selectedLeads: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (selected: boolean) => void;
  onEnrich: () => void;
  isEnriching: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ 
  leads, 
  onClear, 
  selectedLeads, 
  onToggleSelect, 
  onToggleAll,
  onEnrich,
  isEnriching
}) => {
  if (leads.length === 0) return null;

  const allSelected = leads.length > 0 && selectedLeads.size === leads.length;
  const hasSelection = selectedLeads.size > 0;

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Keywords', 'Email', 'Phone', 'Website', 'Address', 'Maps Link'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => {
        // Escape quotes and wrap in quotes for CSV safety
        const safe = (str: string) => `"${str.replace(/"/g, '""')}"`;
        return [
          safe(lead.name),
          safe(lead.category),
          safe(lead.keywords),
          safe(lead.email),
          safe(lead.phone),
          safe(lead.website),
          safe(lead.address),
          safe(lead.mapsLink)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Total Leads: <span className="text-purple-600 font-bold">{leads.length}</span>
          </h3>
          {hasSelection && (
            <span className="text-sm px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium border border-purple-100">
              {selectedLeads.size} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Enrich Button - Always visible now */}
          <button
            onClick={onEnrich}
            disabled={!hasSelection || isEnriching}
            title={!hasSelection ? "Select leads from the list to enrich" : "Find missing Email and Website for selected leads"}
            className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-all shadow-sm
              ${!hasSelection || isEnriching
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'
              }`}
          >
            {isEnriching ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className={`w-4 h-4 ${!hasSelection ? 'text-slate-500' : 'text-white'}`} />
            )}
            {isEnriching ? 'Enriching...' : 'Enrich Selected'}
          </button>

          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <th className="p-4 w-12 border-b border-slate-200 text-center">
                <input 
                  type="checkbox" 
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  title="Select All"
                />
              </th>
              <th className="p-4 border-b border-slate-200">Company</th>
              <th className="p-4 border-b border-slate-200">Details</th>
              <th className="p-4 border-b border-slate-200">Contact Info</th>
              <th className="p-4 border-b border-slate-200">Website</th>
              <th className="p-4 border-b border-slate-200">Location</th>
              <th className="p-4 border-b border-slate-200 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr 
                key={lead.id} 
                className={`hover:bg-slate-50 transition-colors ${selectedLeads.has(lead.id) ? 'bg-purple-50/40' : ''}`}
              >
                <td className="p-4 align-top text-center">
                   <input 
                    type="checkbox" 
                    checked={selectedLeads.has(lead.id)}
                    onChange={() => onToggleSelect(lead.id)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer mt-1"
                  />
                </td>
                <td className="p-4 align-top">
                  <div className="font-semibold text-slate-900">{lead.name}</div>
                </td>
                
                {/* Category & Keywords */}
                <td className="p-4 align-top max-w-xs">
                  {lead.category && (
                    <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-slate-700">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      {lead.category}
                    </div>
                  )}
                  {lead.keywords && (
                    <div className="flex flex-wrap gap-1">
                      {lead.keywords.split(',').map((kw, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                <td className="p-4 align-top space-y-1">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      <a href={`mailto:${lead.email}`} className="hover:text-purple-600 hover:underline break-all">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="whitespace-nowrap">{lead.phone}</span>
                    </div>
                  )}
                  {!lead.email && !lead.phone && (
                    <span className="text-xs text-slate-400 italic">No contact info found</span>
                  )}
                </td>
                <td className="p-4 align-top">
                   {lead.website ? (
                    <a 
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-purple-100 hover:text-purple-700 transition-colors whitespace-nowrap"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Visit Site
                    </a>
                   ) : (
                     <span className="text-xs text-slate-400">-</span>
                   )}
                </td>
                <td className="p-4 align-top">
                  <div className="flex items-start gap-2 text-sm text-slate-600 min-w-[150px]">
                    <MapPin className="w-3.5 h-3.5 text-red-400 mt-1 flex-shrink-0" />
                    <span className="line-clamp-2">{lead.address}</span>
                  </div>
                </td>
                <td className="p-4 align-top text-center">
                  {lead.mapsLink && (
                    <a
                      href={lead.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                      title="View on Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
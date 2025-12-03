import React, { useState } from 'react';
import { LeadForm } from './components/LeadForm';
import { ResultsTable } from './components/ResultsTable';
import { findLeads, enrichLeads } from './services/geminiService';
import { Lead, SearchParams } from './types';
import { Linkedin, Instagram } from 'lucide-react';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    // Note: We do NOT clear leads here to allow cumulative search

    try {
      const result = await findLeads(params);
      
      if (result.leads.length === 0) {
        setError("We couldn't parse any leads from the search results. Please try refining your keywords or location.");
      } else {
        // Add new leads to the list, filtering out potential duplicates based on name
        setLeads(prevLeads => {
          const existingNames = new Set(prevLeads.map(l => l.name.toLowerCase().trim()));
          const uniqueNewLeads = result.leads.filter(
            newLead => !existingNames.has(newLead.name.toLowerCase().trim())
          );
          return [...uniqueNewLeads, ...prevLeads]; // Add new results to the top
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrichLeads = async () => {
    if (selectedLeadIds.size === 0) return;
    
    setEnriching(true);
    setError(null);

    const leadsToEnrich = leads.filter(lead => selectedLeadIds.has(lead.id));

    try {
      const enrichedData = await enrichLeads(leadsToEnrich);
      
      // Update leads with new info
      setLeads(prevLeads => prevLeads.map(lead => {
        const enrichment = enrichedData.find(e => e.id === lead.id);
        if (enrichment) {
          return {
            ...lead,
            // Only update if we found something new and it's not empty
            email: enrichment.email && enrichment.email !== 'N/A' ? enrichment.email : lead.email,
            website: enrichment.website && enrichment.website !== 'N/A' ? enrichment.website : lead.website,
          };
        }
        return lead;
      }));

      // Clear selection after enrichment
      setSelectedLeadIds(new Set());

    } catch (err) {
      setError("Failed to enrich selected leads. Please try again.");
    } finally {
      setEnriching(false);
    }
  };

  const handleClearResults = () => {
    setLeads([]);
    setSelectedLeadIds(new Set());
    setError(null);
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = (shouldSelect: boolean) => {
    if (shouldSelect) {
      setSelectedLeadIds(new Set(leads.map(l => l.id)));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://agenciawestland.com/wp-content/uploads/2023/09/logo-w-sh-e1697316799783.png" 
              alt="Agencia Westland" 
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Find Business Leads in Seconds
            </h2>
            <p className="text-slate-600 text-lg">
              Generate target lists with emails, phones, and locations using AI-powered search.
            </p>
          </div>

          <LeadForm onSearch={handleSearch} isLoading={loading} />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <ResultsTable 
            leads={leads} 
            onClear={handleClearResults} 
            selectedLeads={selectedLeadIds}
            onToggleSelect={toggleSelectLead}
            onToggleAll={toggleSelectAll}
            onEnrich={handleEnrichLeads}
            isEnriching={enriching}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex flex-col mb-6">
                <img 
                  src="https://agenciawestland.com/wp-content/uploads/2023/09/logo-w-sh-e1697316799783.png" 
                  alt="Agencia Westland" 
                  className="h-8 w-auto object-contain self-start"
                />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                Consultora tecnológica especializada en transformación operativa y comercial. Diseñamos y construimos ecosistemas digitales con Agentes de IA.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-purple-400 hover:bg-slate-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-pink-500 hover:bg-slate-700 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Services Column */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Servicios</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">AI Voice Agents</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Automatización de Flujos</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Agentes Híbridos</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Consultoría de Procesos</li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Contacto</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>Panamá, Nuevo Arraiján</li>
                <li>+507 6172-2643</li>
                <li>luis@agenciawestland.com</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2025 Agencia Westland. Todos los derechos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-purple-400 transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
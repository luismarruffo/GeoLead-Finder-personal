import { GoogleGenAI } from "@google/genai";
import { SearchParams, ParseResult, Lead } from "../types";
import { parseMarkdownTable, parseEnrichmentTable, EnrichmentResult } from "../utils/markdownParser";

// Initialize GenAI client
// We create a new instance per call to strictly follow guidelines and ensure environment variable access is fresh
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findLeads = async (params: SearchParams): Promise<ParseResult> => {
  const ai = getAIClient();

  const prompt = `
    Find EXACTLY ${params.limit} REAL, existing businesses related to "${params.keyword}" in ${params.city}, ${params.country}.
    
    CRITICAL INSTRUCTIONS:
    1. You MUST search using Google Maps and Google Search to find real, existing businesses.
    2. DO NOT invent or hallunicate contact information. If you cannot find a specific email or phone number for a business, write "N/A".
    3. You must provide as many valid results as requested (${params.limit}), but only if they exist. Do not make up fake businesses to fill the quota.
    
    For each business, try to find:
    1. Business Name
    2. Specific Business Category (e.g. "Dental Clinic", "Italian Restaurant")
    3. 3 Related Keywords describing their services (comma separated)
    4. Email Address (if publicly available)
    5. Phone Number
    6. Website URL (if available)
    7. Full Address
    8. A Google Maps Link

    CRITICAL OUTPUT FORMAT:
    Provide the result STRICTLY as a Markdown table.
    The table headers MUST be exactly: | Name | Category | Keywords | Email | Phone | Website | Address | Maps Link |
    
    Do not add any conversational text before or after the table. Just the table.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // We use both search and maps to get best coverage of contact info + location
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        // We cannot use responseMimeType: 'application/json' with tools, 
        // so we rely on the prompt to enforce Markdown table structure.
      },
    });

    const text = response.text || "";
    
    // Parse the markdown text into structured data
    const leads = parseMarkdownTable(text);

    return {
      leads,
      rawText: text
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch leads. Please check your API key and try again.");
  }
};

export const enrichLeads = async (leadsToEnrich: Lead[]): Promise<EnrichmentResult[]> => {
  const ai = getAIClient();

  // Create a context list for the AI
  const businessList = leadsToEnrich.map(l => `- ID: ${l.id}\n  Name: ${l.name}\n  Address: ${l.address}`).join('\n');

  const prompt = `
    You are an expert lead researcher. I have a list of businesses that are missing contact info.
    Your task is to perform a deep investigation for EACH business to find their **Official Website** and **Contact Email**.

    List of Businesses to Enrich:
    ${businessList}

    EXECUTION STEPS FOR EACH BUSINESS:
    1. **CHECK GOOGLE MAPS LISTING (Primary Source)**: 
       - Use the Google Maps tool to find the specific business listing using its Name and Address. 
       - **CRITICAL**: Check the "Website" field in the Google Maps place card/listing. If it exists, EXTRACT IT. This is the most reliable source.
    2. **GOOGLE SEARCH (Secondary Source)**: 
       - If you found a website on Maps, search specifically for that domain's contact email (e.g. "site:example.com email contact").
       - If NO website was found on Maps, perform a standard Google Search for the business name to find their site or Facebook/Instagram page.
    3. **Social Media**: If a website is not found, check for a Facebook or Instagram page in the search results, as they often contain the email.

    OUTPUT FORMAT:
    Return a Markdown table with EXACTLY these columns: | ID | Email | Website |
    
    CONSTRAINTS:
    - The ID MUST match the ID provided in the input list exactly.
    - If you find a website, provide the full URL.
    - If you cannot find an email/website after checking Maps and Search, write "N/A".
    - Do not invent data. Only return what you find.

    Output just the Markdown table.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // ENABLE GOOGLE MAPS to access business listings directly
        tools: [{ googleSearch: {} }, { googleMaps: {} }], 
      },
    });

    const text = response.text || "";
    return parseEnrichmentTable(text);

  } catch (error) {
    console.error("Gemini Enrichment Error:", error);
    throw new Error("Failed to enrich leads.");
  }
};
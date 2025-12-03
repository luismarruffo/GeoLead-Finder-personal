import { Lead } from '../types';

export interface EnrichmentResult {
  id: string;
  email: string;
  website: string;
}

export const parseMarkdownTable = (markdown: string): Lead[] => {
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  const leads: Lead[] = [];
  
  // Find the start of the table (header row)
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    // Check for Name and Category in header to identify the correct table
    if (lines[i].includes('|') && lines[i].toLowerCase().includes('name') && lines[i].toLowerCase().includes('category')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return [];

  // Iterate through rows after the separator line (header + 1 is usually separator)
  for (let i = headerIndex + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;

    const cols = line.split('|').map(c => c.trim()).filter((_, index, arr) => index > 0 && index < arr.length - 1);
    
    // We expect 8 columns now: Name | Category | Keywords | Email | Phone | Website | Address | Maps Link
    if (cols.length >= 8) {
      
      const name = cleanCell(cols[0]);
      const category = cleanCell(cols[1]);
      const keywords = cleanCell(cols[2]);
      const email = cleanCell(cols[3]);
      const phone = cleanCell(cols[4]);
      let website = cleanCell(cols[5]);
      const address = cleanCell(cols[6]);
      let mapsLink = cleanCell(cols[7]);

      // Attempt to extract URL from markdown link syntax [Link](url) for Maps
      const mapsMatch = mapsLink.match(/\((https?:\/\/[^\)]+)\)/);
      if (mapsMatch && mapsMatch[1]) {
        mapsLink = mapsMatch[1];
      }

      // Attempt to extract URL from markdown link syntax [Link](url) for Website
      const webMatch = website.match(/\((https?:\/\/[^\)]+)\)/);
      if (webMatch && webMatch[1]) {
        website = webMatch[1];
      }

      leads.push({
        id: crypto.randomUUID(),
        name,
        category: category === 'N/A' || category === '-' ? '' : category,
        keywords: keywords === 'N/A' || keywords === '-' ? '' : keywords,
        email: email === 'N/A' || email === '-' ? '' : email,
        phone: phone === 'N/A' || phone === '-' ? '' : phone,
        website: website === 'N/A' || website === '-' ? '' : website,
        address,
        mapsLink
      });
    }
  }

  return leads;
};

export const parseEnrichmentTable = (markdown: string): EnrichmentResult[] => {
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  const results: EnrichmentResult[] = [];
  
  // Find the start of the table (header row)
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    // Look for ID, Email, Website headers
    if (lines[i].includes('|') && lines[i].toLowerCase().includes('id') && lines[i].toLowerCase().includes('website')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return [];

  for (let i = headerIndex + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;

    // Expected format: | ID | Email | Website |
    const cols = line.split('|').map(c => c.trim()).filter((_, index, arr) => index > 0 && index < arr.length - 1);
    
    if (cols.length >= 3) {
      const id = cleanCell(cols[0]);
      const email = cleanCell(cols[1]);
      let website = cleanCell(cols[2]);

      // Extract URL from markdown link if present
      const webMatch = website.match(/\((https?:\/\/[^\)]+)\)/);
      if (webMatch && webMatch[1]) {
        website = webMatch[1];
      }

      results.push({
        id,
        email: email === 'N/A' || email === '-' ? '' : email,
        website: website === 'N/A' || website === '-' ? '' : website,
      });
    }
  }

  return results;
};

const cleanCell = (cell: string): string => {
  return cell.replace(/\*\*/g, '').trim(); // Remove bold markdown
};
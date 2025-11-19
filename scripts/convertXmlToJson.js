const fs = require('fs');
const path = require('path');

// Read XML file
const xmlContent = fs.readFileSync(path.join(__dirname, '../corp.xml'), 'utf8');

// Simple XML parser for this specific structure
const companies = [];
const listMatches = xmlContent.matchAll(/<list>([\s\S]*?)<\/list>/g);

for (const match of listMatches) {
  const listContent = match[1];
  const corp_code = listContent.match(/<corp_code>(.*?)<\/corp_code>/)?.[1] || '';
  const corp_name = listContent.match(/<corp_name>(.*?)<\/corp_name>/)?.[1] || '';
  const corp_eng_name = listContent.match(/<corp_eng_name>(.*?)<\/corp_eng_name>/)?.[1] || '';
  const stock_code = listContent.match(/<stock_code>(.*?)<\/stock_code>/)?.[1] || '';
  const modify_date = listContent.match(/<modify_date>(.*?)<\/modify_date>/)?.[1] || '';
  
  if (corp_code && corp_name) {
    companies.push({
      corp_code: corp_code.trim(),
      corp_name: corp_name.trim(),
      corp_eng_name: corp_eng_name.trim(),
      stock_code: stock_code.trim(),
      modify_date: modify_date.trim(),
    });
  }
}

// Create public/data directory if it doesn't exist
const dataDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write JSON file
fs.writeFileSync(
  path.join(dataDir, 'corp.json'),
  JSON.stringify(companies, null, 2),
  'utf8'
);

console.log(`Successfully converted ${companies.length} companies to JSON`);


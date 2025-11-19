interface CorpData {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string;
  stock_code: string;
  modify_date: string;
}

export function parseCorpXml(xmlContent: string): CorpData[] {
  const companies: CorpData[] = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  const lists = xmlDoc.getElementsByTagName('list');
  
  for (let i = 0; i < lists.length; i++) {
    const list = lists[i];
    const corp_code = list.getElementsByTagName('corp_code')[0]?.textContent || '';
    const corp_name = list.getElementsByTagName('corp_name')[0]?.textContent || '';
    const corp_eng_name = list.getElementsByTagName('corp_eng_name')[0]?.textContent || '';
    const stock_code = list.getElementsByTagName('stock_code')[0]?.textContent || '';
    const modify_date = list.getElementsByTagName('modify_date')[0]?.textContent || '';
    
    if (corp_code && corp_name) {
      companies.push({
        corp_code,
        corp_name,
        corp_eng_name,
        stock_code,
        modify_date,
      });
    }
  }
  
  return companies;
}


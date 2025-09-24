import type { Transaction } from '@/types';

// format Excel date (dd-mm-yyyy or m/d/yyyy) to yyyy-mm-dd
function formatDate(dateStr: string): string {
  dateStr = dateStr.trim();
  if (!dateStr) return '';

  if (dateStr.includes('-')) {
    const [d, m, y] = dateStr.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else if (dateStr.includes('/')) {
    const [m, d, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return dateStr;
}

// parse pasted CSV or tab-separated text
export function parseCSVText(text: string): Transaction[] {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.toLowerCase().startsWith('date'));

  const transactions: Transaction[] = lines.map(line => {
    const cols = line.split(/\t|,/);
    const [dateRaw, totalRaw, inOutRaw, descriptionRaw, savingsRaw] = cols;

    const inOut = inOutRaw?.trim().toUpperCase() === 'COME' ? 'COME' : 'GO';

    return {
      id: `${Math.random().toString(36).slice(2, 9)}-${Date.now()}`,
      date: formatDate(dateRaw),
      amount: Number(totalRaw) || 0,
      inOut,
      type: descriptionRaw?.trim() || '',
      savings: savingsRaw ? Number(savingsRaw) : undefined,
    };
  });

  return transactions;
}

// parse uploaded file (CSV only)
export async function parseFile(file: File): Promise<Transaction[]> {
  const text = await file.text();
  return parseCSVText(text);
}

//import type { Transaction } from '../types';
// import * as XLSX from 'xlsx';

// /**
//  * Try to normalize rows parsed from CSV/XLSX into Transaction[]
//  * Accepts either CSV text or an array-of-objects like from XLSX utils.
//  */
// function normalizeRows(rawRows: any[]): Transaction[] {
//   const out: Transaction[] = [];
//   for (const r of rawRows) {
//     // Make a best-effort fetch from common column names
//     const dateRaw = r.date ?? r.Date ?? r['Date '] ?? r['date'] ?? r['DATE'] ?? r['Date of'];
//     const totalRaw = r.total ?? r.Total ?? r.amount ?? r.Amount ?? r['total '] ?? r['Total '];
//     const inOut = r.type ?? r.Type ?? r['in/out'] ?? r['in_out'] ?? r['IN/OUT'] ?? r['type'];
//     const note = r.note ?? r.Note ?? r.notes ?? r.remarks ?? r.description ?? r[''];
//     const savingsRaw = r.savings ?? r.Savings ?? r.SAVED ?? r['saved'];
//     // parse date
//     let dateIso = '';
//     if (dateRaw) {
//       // If Excel date serial number => XLSX may convert to JS date, else string
//       if (typeof dateRaw === 'number') {
//         // XLSX date -> JS Date via Excel epoch (sheetjs already gives date when cellDates true)
//         const d = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
//         dateIso = d.toISOString().slice(0, 10);
//       } else {
//         // Try parse common separators
//         const parsed = new Date(dateRaw);
//         if (!isNaN(parsed.getTime())) dateIso = parsed.toISOString().slice(0, 10);
//         else {
//           // try dd-mm-yyyy or d/m/yyyy etc
//           const m = /(\d{1,2})[\/\-\.\s](\d{1,2})[\/\-\.\s](\d{2,4})/.exec(String(dateRaw));
//           if (m) {
//             let dd = m[1].padStart(2, '0');
//             let mm = m[2].padStart(2, '0');
//             let yyyy = m[3].length === 2 ? '20' + m[3] : m[3];
//             dateIso = `${yyyy}-${mm}-${dd}`;
//           } else {
//             dateIso = new Date().toISOString().slice(0, 10);
//           }
//         }
//       }
//     } else {
//       dateIso = new Date().toISOString().slice(0, 10);
//     }

//     let amount = 0;
//     if (typeof totalRaw === 'number') amount = totalRaw;
//     else if (typeof totalRaw === 'string') {
//       // strip commas and currency symbols
//       const cleaned = totalRaw.replace(/[₹,$\s]/g, '').replace(/,/g, '');
//       amount = Number(cleaned) || 0;
//     } else amount = 0;

//     const savings = Number(savingsRaw) || undefined;

//     out.push({
//       id: `${dateIso}-${Math.random().toString(36).slice(2, 9)}`,
//       date: dateIso,
//       amount,
//       type: String(inOut ?? '').trim(),
//       note: String(note ?? '').trim(),
//       savings,
//     });
//   }
//   return out;
// }

// /**
//  * Parse uploaded file (.xlsx/.xls/.csv) content (File object). Returns Transaction[].
//  */
// export async function parseFile(file: File): Promise<Transaction[]> {
//   const data = await file.arrayBuffer();
//   const wb = XLSX.read(data, { type: 'array' });
//   const sheetName = wb.SheetNames[0];
//   const ws = wb.Sheets[sheetName];
//   const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
//   return normalizeRows(raw as any[]);
// }

// /**
//  * Parse pasted CSV/text content (string)
//  */
// export function parseCSVText(text: string): Transaction[] {
//   // use sheetjs to parse CSV string
//   const wb = XLSX.read(text, { type: 'string' });
//   const sheetName = wb.SheetNames[0];
//   const ws = wb.Sheets[sheetName];
//   const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
//   return normalizeRows(raw as any[]);
// }

// /**
//  * Helper: if you already have an array-of-arrays or array-of-objects
//  */
// export function parseTransactionsFromCSVorArray(value: any): Transaction[] {
//   if (!value) return [];
//   if (typeof value === 'string') return parseCSVText(value);
//   if (Array.isArray(value)) {
//     // array of objects -> normalize
//     if (value.length > 0 && typeof value[0] === 'object') return normalizeRows(value);
//   }
//   return [];
// }

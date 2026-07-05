const fs = require('fs');

let envUrl = '';
let envKey = '';

try {
  const envLocal = fs.readFileSync('.env.local', 'utf8');
  envLocal.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) envUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) envKey = line.split('=')[1].trim().replace(/['"]/g, '');
  });
} catch (e) {
  console.log("Error reading .env.local", e);
}

const https = require('https');
const url = new URL(envUrl + '/rest/v1/transactions?select=*');

const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: 'GET',
  headers: {
    'apikey': envKey,
    'Authorization': 'Bearer ' + envKey
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    const transactions = JSON.parse(data);
    let total = 0;
    let homeTotal = 0;
    let keuanganJamaahTotal = 0;
    let today = new Date();
    today.setHours(23, 59, 59, 999);
    
    for (let t of transactions) {
      if (t.type === 'in') homeTotal += t.amount;
      if (t.type === 'out') homeTotal -= t.amount;
      
      let tDate = new Date(t.date);
      if (tDate <= today) {
        if (t.type === 'in') keuanganJamaahTotal += t.amount;
        if (t.type === 'out') keuanganJamaahTotal -= t.amount;
      }
    }
    
    console.log("Total Transactions:", transactions.length);
    console.log("Home Total (all time):", homeTotal);
    console.log("Keuangan Jamaah Total (up to today):", keuanganJamaahTotal);
    
    for (let t of transactions) {
        console.log(`${t.date} - ${t.type} - ${t.amount} - ${t.description}`);
    }
  });
});
req.end();

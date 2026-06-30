const fs = require('fs');

const parishes = JSON.parse(fs.readFileSync('current_catholic_parishes.json', 'utf8'));

const keywords = ['aliabad', 'alirajpet', 'alwal', 'ammuguda', 'armoor'];

const matches = parishes.filter(p => 
  keywords.some(k => 
    (p.name && p.name.toLowerCase().includes(k)) || 
    (p.city && p.city.toLowerCase().includes(k)) ||
    (p.address && p.address.toLowerCase().includes(k))
  )
);

console.log(JSON.stringify(matches.map(m => ({
  id: m.id, name: m.name, city: m.city, churchType: m.churchType
})), null, 2));

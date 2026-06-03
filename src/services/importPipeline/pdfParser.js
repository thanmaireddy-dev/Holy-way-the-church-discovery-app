const fs = require('fs');
const pdf = require('pdf-parse');

const parsePDF = async (pdfPath) => {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  const text = data.text;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const churches = [];
  let currentChurch = null;
  
  const timeRegex = /(\d{2}\.\d{2}\s*(?:a\.m\.?|p\.m\.?|n\.n\.?))/i;
  
  const isHeaderFooter = (line) => {
    const upper = line.toUpperCase();
    return upper.includes('ARCHDIOCESE') || 
           upper.includes('ORDO') || 
           upper.includes('SUNDAY MASS TIMINGS') ||
           /^\d+$/.test(line); // Page numbers
  };
  
  const parseLanguages = (langStr) => {
    let s = langStr.replace(/[()]/g, '').trim();
    if (!s) return [];
    if (s.toLowerCase().includes('english/') && s.toLowerCase().includes('telugu')) {
      return ['English', 'Telugu'];
    }
    const parts = s.split(/&|\/|,| and /i).map(p => p.trim()).filter(p => p.length > 0);
    // Normalize basic ones
    return parts.map(p => {
      const lower = p.toLowerCase();
      if (lower.includes('eng')) return 'English';
      if (lower.includes('tel')) return 'Telugu';
      if (lower.includes('tam')) return 'Tamil';
      if (lower.includes('hin')) return 'Hindi';
      if (lower.includes('mal')) return 'Malayalam';
      return p;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (isHeaderFooter(line)) continue;
    
    // Check if new parish
    const parishMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (parishMatch) {
      if (currentChurch) {
        churches.push(currentChurch);
      }
      
      currentChurch = {
        id: parishMatch[1],
        parish: '',
        name: '',
        massTimings: { sunday: [] }
      };
      
      let rest = parishMatch[2];
      const tMatch = rest.match(timeRegex);
      if (tMatch) {
        currentChurch.parish = rest.substring(0, tMatch.index).trim();
        let timeStr = tMatch[1];
        // Convert 06.30 a.m. to 06:30 AM
        let cleanTime = timeStr.replace(/\./g, ':').replace(/a:m:/i, 'AM').replace(/p:m:/i, 'PM').replace(/n:n:/i, 'PM').replace(/a\s*m\s*\.?/i, 'AM').replace(/p\s*m\s*\.?/i, 'PM');
        if(cleanTime.includes('AM') === false && cleanTime.includes('PM') === false) {
           if(timeStr.toLowerCase().includes('a.m')) cleanTime += ' AM';
           else cleanTime += ' PM';
        }
        
        let langStr = rest.substring(tMatch.index + tMatch[0].length).trim();
        const langs = parseLanguages(langStr);
        currentChurch.massTimings.sunday.push({
          time: cleanTime,
          languages: langs
        });
      } else {
        currentChurch.parish = rest.trim();
      }
      continue;
    }
    
    if (currentChurch) {
      const tMatch = line.match(timeRegex);
      if (tMatch) {
        let beforeTime = line.substring(0, tMatch.index).trim();
        let timeStr = tMatch[1];
        let langStr = line.substring(tMatch.index + tMatch[0].length).trim();
        
        // Sometimes language wraps to next line. Check if next line is a short language word.
        if (i + 1 < lines.length) {
            let nextLine = lines[i+1];
            if (!isHeaderFooter(nextLine) && !nextLine.match(/^(\d+)\.\s+/) && !nextLine.match(timeRegex)) {
                if (['English', 'Telugu', 'Tamil', 'Hindi', 'Malayalam'].includes(nextLine.trim())) {
                    langStr += " " + nextLine.trim();
                    i++; // skip next line
                }
            }
        }
        
        let cleanTime = timeStr.replace('.', ':').toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ');
        if (!cleanTime.includes('AM') && !cleanTime.includes('PM') && !cleanTime.includes('NN')) {
             if(timeStr.toLowerCase().includes('a')) cleanTime += ' AM';
             if(timeStr.toLowerCase().includes('p')) cleanTime += ' PM';
        }
        cleanTime = cleanTime.replace(' AMM', ' AM').replace(' PMM', ' PM').replace(' NN', ' PM'); // basic fix
        // ensure format hh:mm AM/PM
        let timeParts = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if(timeParts) {
            cleanTime = `${timeParts[1].padStart(2, '0')}:${timeParts[2]} ${timeParts[3].toUpperCase()}`;
        }
        
        const langs = parseLanguages(langStr);
        
        if (beforeTime && !currentChurch.name && !beforeTime.toLowerCase().includes('substation') && !beforeTime.toLowerCase().includes('chapel')) {
          currentChurch.name = beforeTime;
        }
        
        // Determine category (sunday, weekday, saturday) based on beforeTime
        let category = 'sunday';
        const lowerNote = beforeTime.toLowerCase();
        if (lowerNote.includes('saturday') || lowerNote.includes('sat')) {
           category = 'saturday';
        } else if (lowerNote.includes('monday') || lowerNote.includes('tuesday') || lowerNote.includes('wednesday') || lowerNote.includes('thursday') || lowerNote.includes('friday') || lowerNote.includes('weekday') || lowerNote.includes('everyday')) {
           category = 'weekday';
        }
        
        // Make sure arrays exist
        if (!currentChurch.massTimings[category]) {
           currentChurch.massTimings[category] = [];
        }

        currentChurch.massTimings[category].push({
          time: cleanTime,
          languages: langs,
          ...(beforeTime && currentChurch.name !== beforeTime ? { note: beforeTime } : {})
        });
      } else {
        // No time. Could be church name if we don't have one.
        if (!currentChurch.name && (line.toLowerCase().includes('church') || line.toLowerCase().includes('shrine') || line.toLowerCase().includes('cathedral') || line.toLowerCase().includes('basilica'))) {
          currentChurch.name = line;
        } else if (!currentChurch.name && line.length > 3 && line.length < 50) {
           // fallback
           currentChurch.name = line;
        }
      }
    }
  }
  
  if (currentChurch) {
    churches.push(currentChurch);
  }
  
  return churches;
};

module.exports = { parsePDF };

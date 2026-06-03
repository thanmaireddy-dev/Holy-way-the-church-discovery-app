/**
 * Parse a time string like "09:00 AM" into hours and minutes.
 */
const parseTime = (timing) => {
  if (!timing) return null;
  const timeStr = typeof timing === 'string' ? timing : timing.time;
  if (!timeStr || typeof timeStr.split !== 'function') return null;

  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return null;

  let [hours, minutes] = time.split(':').map(Number);
  
  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes };
};

/**
 * Get the church status based on device time.
 * Returns an object: { label: string, color: string }
 */
export const getChurchStatus = (massTimings) => {
  if (!massTimings) return { label: '🔴 No Active Service', color: '#8b0000' };

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  let todayTimings = [];
  if (day === 0) {
    todayTimings = massTimings.sunday || [];
  } else if (day === 6) {
    todayTimings = massTimings.saturday || [];
  } else {
    todayTimings = massTimings.weekday || [];
  }

  for (const timing of todayTimings) {
    const parsed = parseTime(timing);
    if (!parsed) continue;

    const { hours, minutes } = parsed;
    const massTotalMinutes = hours * 60 + minutes;

    const diff = massTotalMinutes - currentTotalMinutes;

    // If within 30 minutes before start
    if (diff > 0 && diff <= 30) {
      return { label: '🟡 Starts Soon', color: '#b8860b' }; // Dark goldenrod
    }
    
    // If started within the last 60 minutes
    if (diff <= 0 && diff >= -60) {
      return { label: '🟢 Live Now', color: '#2e8b57' }; // Sea green
    }
  }

  return { label: '🔴 No Active Service', color: '#8b0000' }; // Dark red
};

/**
 * Format an array of timings into a readable string.
 * Supports both legacy string arrays ["06:00 AM"] and new object arrays [{time: "06:00 AM", languages: ["English"]}].
 */
export const formatTimings = (timings) => {
  if (!Array.isArray(timings)) return 'Not available';
  return timings.map(t => {
    if (typeof t === 'string') return t;
    if (!t || !t.time) return '';
    let str = t.time;
    if (Array.isArray(t.languages) && t.languages.length > 0) {
      str += ` (${t.languages.join(', ')})`;
    }
    if (t.note) {
      str += ` ${t.note}`;
    }
    return str;
  }).filter(Boolean).join('\n');
};

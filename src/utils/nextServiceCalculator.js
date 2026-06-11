/**
 * Utility to calculate the next available church service or mass
 * safely handling denomination-specific terminology and time parsing.
 */

const parseTimeStr = (timing) => {
  if (!timing) return null;
  const timeStr = typeof timing === 'string' ? timing : timing.time;
  if (!timeStr || typeof timeStr.split !== 'function') return null;

  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return null;

  const parts = time.split(':');
  if (parts.length !== 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) return null;

  if (modifier.toUpperCase() === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes, original: timeStr };
};

export const getNextAvailableSchedule = (church) => {
  const isCatholic = church?.denomination === 'Catholic';
  const term = isCatholic ? 'Mass' : 'Service';

  if (!church?.massTimings) {
    return `${term} schedule unavailable`;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const getTimingsForDay = (dayIndex) => {
    if (dayIndex === 0) return church.massTimings.sunday || [];
    if (dayIndex === 6) return church.massTimings.saturday || [];
    return church.massTimings.weekday || [];
  };

  // Check today up to exactly 1 week later (offset 0 to 7)
  for (let offset = 0; offset <= 7; offset++) {
    const targetDay = (currentDay + offset) % 7;
    const timings = getTimingsForDay(targetDay);
    
    if (!Array.isArray(timings) || timings.length === 0) continue;

    const parsedTimings = timings
      .map(parseTimeStr)
      .filter(Boolean)
      .sort((a, b) => (a.hours * 60 + a.minutes) - (b.hours * 60 + b.minutes));

    for (const pt of parsedTimings) {
      const ptTotalMinutes = pt.hours * 60 + pt.minutes;
      
      if (offset === 0) {
        // Today: Must be strictly in the future
        if (ptTotalMinutes > currentTotalMinutes) {
          return `Next ${term}: Today ${pt.original}`;
        }
      } else {
        // Future day: Pick the earliest chronological time
        let dayStr = '';
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        if (offset === 1) {
          dayStr = 'Tomorrow';
        } else if (offset === 7) {
          dayStr = `Next ${daysOfWeek[targetDay]}`;
        } else {
          dayStr = daysOfWeek[targetDay];
        }
        return `Next ${term}: ${dayStr} ${pt.original}`;
      }
    }
  }

  return `${term} schedule unavailable`;
};

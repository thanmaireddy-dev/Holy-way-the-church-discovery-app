const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};

/**
 * Parses a string like "September 8" or "8 August" and returns details
 * about the feast date relative to today.
 * Unparseable formats return null.
 */
export const getFeastCountdown = (feastDayStr) => {
  if (!feastDayStr || typeof feastDayStr !== 'string') return null;
  
  const match = feastDayStr.match(/([a-zA-Z]+)\s+(\d+)|(\d+)\s+([a-zA-Z]+)/);
  if (!match) return null; 

  let monthStr, dayStr;
  if (match[1] && match[2]) {
    monthStr = match[1];
    dayStr = match[2];
  } else {
    dayStr = match[3];
    monthStr = match[4];
  }

  const monthIndex = MONTHS[monthStr.toLowerCase()];
  if (monthIndex === undefined) return null;

  const day = parseInt(dayStr, 10);
  if (isNaN(day) || day < 1 || day > 31) return null;

  const now = new Date();
  const currentYear = now.getFullYear();

  const feastDate = new Date(currentYear, monthIndex, day);
  feastDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = feastDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Capitalize month properly
  const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase();

  return {
    feastDate, // Date object for Google Calendar
    daysRemaining: diffDays,
    isToday: diffDays === 0,
    isTomorrow: diffDays === 1,
    hasPassed: diffDays < 0,
    formattedDate: `${day} ${capitalizedMonth}`
  };
};

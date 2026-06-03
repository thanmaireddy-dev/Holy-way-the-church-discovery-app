const validateChurches = (churches) => {
  const valid = [];
  const errors = [];

  churches.forEach((church, index) => {
    let isValid = true;
    let churchErrors = [];

    if (!church.name && !church.parish) {
      isValid = false;
      churchErrors.push("Missing both church name and parish name.");
    }

    if (!church.massTimings || !church.massTimings.sunday || church.massTimings.sunday.length === 0) {
      isValid = false;
      churchErrors.push("No Sunday Mass timings found.");
    }

    if (church.massTimings && church.massTimings.sunday) {
      const seenTimes = new Set();
      const uniqueSundays = [];
      church.massTimings.sunday.forEach(timing => {
        if (!timing.time.match(/^\d{2}:\d{2}\s+(AM|PM)$/i)) {
          isValid = false;
          churchErrors.push(`Invalid time format: ${timing.time}`);
        }
        
        const sig = `${timing.time}-${timing.languages.join(',')}`;
        if (!seenTimes.has(sig)) {
          seenTimes.add(sig);
          uniqueSundays.push(timing);
        }
      });
      church.massTimings.sunday = uniqueSundays;
    }

    if (isValid) {
      valid.push(church);
    } else {
      errors.push({ id: church.id, name: church.name || church.parish, errors: churchErrors });
    }
  });

  return { valid, errors };
};

module.exports = { validateChurches };

/**
 * Returns the appropriate terminology for church service timings based on the denomination.
 * 
 * @param {string} denomination - The denomination of the church.
 * @returns {string} - The respectful and authentic terminology.
 */
export const getTimingLabel = (denomination) => {
  if (denomination && denomination.toLowerCase() === 'catholic') {
    return 'Mass Timings';
  }
  return 'Service Timings';
};

/**
 * Returns the local require statement for the church image.
 * This is a temporary solution until remote storage is implemented.
 */
export const getChurchImage = (imageName) => {
  if (typeof imageName === 'string' && imageName.startsWith('http')) {
    return { uri: imageName };
  }
  switch (imageName) {
    case 'basilica':
      return require('../../assets/churches/basilica.png');
    case 'cathedral':
      return require('../../assets/churches/cathedral.png');
    case 'shrine':
      return require('../../assets/churches/shrine.png');
    case 'parish':
      return require('../../assets/churches/parish.png');
    case 'church_interior':
      return require('../../assets/churches/church_interior.png');
    case 'church_exterior':
      return require('../../assets/churches/church_exterior.png');
    default:
      return require('../../assets/churches/parish.png');
  }
};

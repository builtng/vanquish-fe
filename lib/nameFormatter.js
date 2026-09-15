/**
 * Utility function to format names with appropriate prefixes
 * @param {string} name - The person's name
 * @param {string} type - The type: 'client', 'tc', 'qc', 'counsellor', 'coach'
 * @returns {string} - Formatted name with prefix
 */
export function formatName(name, type) {
  if (!name) return name;
  
  const nameTrimmed = name.trim();
  
  switch (type) {
    case 'client':
      return `Client ${nameTrimmed}`;
    case 'tc':
    case 'trainee':
      return `TC ${nameTrimmed}`;
    case 'qc':
    case 'counsellor':
    case 'qualified':
      return `QC ${nameTrimmed}`;
    case 'coach':
      return `Coach ${nameTrimmed}`;
    default:
      return nameTrimmed;
  }
}

/**
 * Determines the prefix type based on counsellor type and service
 * @param {string} counsellorType - 'Trainee' or 'Qualified'
 * @param {string} serviceType - Service type (optional)
 * @returns {string} - Type for formatName function
 */
export function getCounsellorPrefixType(counsellorType, serviceType) {
  if (serviceType && serviceType.toLowerCase().includes('coaching')) {
    return 'coach';
  }
  
  if (counsellorType === 'Qualified') {
    return 'qc';
  }
  
  return 'tc';
}


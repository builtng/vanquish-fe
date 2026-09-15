/**
 * Utility function to format names with appropriate prefixes
 * @param {string} name - The person's name
 * @param {string} type - The type: 'client', 'tc', 'qc', 'counsellor', 'coach'
 * @returns {string} - Formatted name with prefix
 */
export function formatName(name, type) {
  if (!name) return name;
  
  // Strip any existing prefix first so we don't duplicate or retain old prefix
  const cleanName = name.trim().replace(/^(TC|QC|Client|Coach|Counsellor)\s+/i, '');
  
  const cleanType = (type || '').toLowerCase().trim();

  switch (cleanType) {
    case 'client':
      return `Client ${cleanName}`;
    case 'tc':
    case 'trainee':
      return `TC ${cleanName}`;
    case 'qc':
    case 'counsellor':
    case 'qualified':
      return `QC ${cleanName}`;
    case 'coach':
      return `Coach ${cleanName}`;
    default:
      return cleanName;
  }
}

/**
 * Determines the prefix type based on counsellor type and service
 * @param {string|object} counsellorType - 'Trainee', 'Qualified', or counsellor object
 * @param {string} serviceType - Service type (optional)
 * @returns {string} - Type for formatName function ('tc', 'qc', 'coach')
 */
export function getCounsellorPrefixType(counsellorType, serviceType) {
  let cType = '';
  let sType = serviceType;

  if (counsellorType && typeof counsellorType === 'object') {
    cType = counsellorType.counsellor_type || counsellorType.counsellorType || counsellorType.type || '';
    if (!sType) {
      sType = counsellorType.serviceType || counsellorType.service_type;
    }
  } else if (typeof counsellorType === 'string') {
    cType = counsellorType;
  }

  const cleanSType = (typeof sType === 'string' ? sType.toLowerCase().trim() : '');
  if (cleanSType.includes('coaching')) {
    return 'coach';
  }

  const cleanCType = (typeof cType === 'string' ? cType.toLowerCase().trim() : '');
  if (cleanCType === 'qualified' || cleanCType === 'qc') {
    return 'qc';
  }

  if (cleanSType && cleanSType !== 'low cost' && !cleanSType.includes('low cost')) {
    return 'qc';
  }

  return 'tc';
}

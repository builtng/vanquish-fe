/**
 * Format time slot from compact format to readable format
 * @param {string} timeSlot - Time slot in format like "10am-1050am" or "2pm-250pm"
 * @returns {string} - Formatted time like "10:00am-10:50am" or "2:00pm-2:50pm"
 */
export function formatTimeSlot(timeSlot) {
  if (!timeSlot) return '';
  
  // Handle already formatted times
  if (timeSlot.includes(':')) return timeSlot;
  
  // Split the time range
  const parts = timeSlot.split('-');
  if (parts.length !== 2) return timeSlot;
  
  const formatTime = (time) => {
    // Extract am/pm
    const isPM = time.toLowerCase().includes('pm');
    const isAM = time.toLowerCase().includes('am');
    const period = isPM ? 'pm' : 'am';
    
    // Remove am/pm to get just the numbers
    const numStr = time.toLowerCase().replace('am', '').replace('pm', '');
    
    // Handle different formats
    if (numStr.length <= 2) {
      // Just hour: "10" -> "10:00"
      return `${numStr}:00${period}`;
    } else if (numStr.length === 3) {
      // Hour + single minute digit: "150" -> "1:50"
      return `${numStr[0]}:${numStr.slice(1)}${period}`;
    } else if (numStr.length === 4) {
      // Hour + minutes: "1050" -> "10:50"
      return `${numStr.slice(0, 2)}:${numStr.slice(2)}${period}`;
    }
    
    return time;
  };
  
  const startTime = formatTime(parts[0]);
  const endTime = formatTime(parts[1]);
  
  return `${startTime}-${endTime}`;
}

/**
 * Format time slot to display format with uppercase AM/PM
 * @param {string} timeSlot - Time slot in format like "10am-1050am"
 * @returns {string} - Formatted time like "10:00 AM - 10:50 AM"
 */
export function formatTimeSlotDisplay(timeSlot) {
  const formatted = formatTimeSlot(timeSlot);
  if (!formatted) return '';
  
  // Split and format with uppercase AM/PM and space
  return formatted
    .replace('am', ' AM')
    .replace('pm', ' PM')
    .replace('-', ' - ');
}

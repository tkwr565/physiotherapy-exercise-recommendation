/**
 * Utility functions shared across the application
 */

// Generate a UUID v4
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Format date/time
export function formatDateTime(date) {
  return new Date(date).toLocaleString();
}

// Validate UUID format
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Show error message
export function showError(message) {
  alert(message);
}

// Show success message
export function showSuccess(message) {
  alert(message);
}

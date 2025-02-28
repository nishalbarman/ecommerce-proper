module.exports = function generateUniqueID(prefix) {
  // Get the current timestamp and date
  const now = new Date();
  const timestamp = now.getTime(); // Current timestamp in milliseconds
  const year = now.getFullYear(); // Current year

  // Combine the prefix, timestamp, and year to create the unique ID
  const uniqueID = `${prefix}-${timestamp}/${year}`;

  return uniqueID;
}

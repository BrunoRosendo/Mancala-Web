/**
 * Runs an array of functions with the given arguments.
 * Return false if any of them returns false and true otherwise.
 */
const asyncEvery = (arr) => async (...args) => {
  for (let func of arr) {
    if (!await func(...args)) return false;
  }

  return true;
}

module.exports = {
  asyncEvery,
}

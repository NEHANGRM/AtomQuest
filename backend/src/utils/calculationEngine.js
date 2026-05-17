/**
 * Automatic Progress Calculation Engine
 * Applies predefined logic based on Goal UoM types and directions.
 * 
 * Rules:
 * 1. Numeric/Percentage (Higher is better): (Achievement / Target) * 100
 * 2. Numeric/Percentage (Lower is better): (Target / Achievement) * 100
 * 3. Timeline: Based on logical completion state.
 * 4. Zero-based: If achievement == 0 -> 100%, Else -> 0%
 * 
 * @param {Object} goal - The Goal object containing uomType, target, direction
 * @param {Number} actualValue - The actual achieved value reported by the employee
 * @param {String} status - The status reported ('Not Started', 'On Track', 'Completed')
 * @returns {Number} Calculated Progress Score (0-100)
 */
const calculateProgress = (goal, actualValue, status) => {
  let score = 0;
  
  if (!goal) return 0;
  
  const target = Number(goal.target);
  const actual = Number(actualValue);

  switch (goal.uomType) {
    case 'Numeric':
    case 'Percentage':
      if (goal.direction === 'Lower') {
        // Lower is better (e.g. Reduce costs to 50k. Actual is 60k. 50/60 * 100 = 83%)
        if (actual <= 0 && target <= 0) score = 100; // Edge case for negative/0
        else score = (target / actual) * 100;
      } else {
        // Higher is better (e.g. Sales to 100k. Actual is 50k. 50/100 * 100 = 50%)
        if (target === 0) score = actual > 0 ? 100 : 0;
        else score = (actual / target) * 100;
      }
      break;

    case 'Zero-based':
      // Zero-based (e.g. Zero fatalities, Zero bugs)
      score = actual === 0 ? 100 : 0;
      break;

    case 'Timeline':
      // Timeline-based is generally subjective or binary based on status
      if (status === 'Completed') score = 100;
      else if (status === 'On Track') score = 50;
      else score = 0;
      break;

    default:
      score = 0;
  }

  // Cap score between 0 and 100 to prevent weird charting
  if (score > 100) return 100;
  if (score < 0 || isNaN(score)) return 0;
  
  // Return rounded to nearest whole number
  return Math.round(score);
};

module.exports = { calculateProgress };

/**
 * Age-gating helpers for the DripCast birthday gate.
 *
 * Adulthood here means 17+ (the app's App Store age rating). All
 * comparisons use UTC calendar dates so the result never shifts with the
 * server's local timezone.
 */

const ADULT_AGE = 17;

/**
 * Returns true when `dob` (a Date, date string, or timestamp) makes the
 * person at least 17 years old today. Missing or unparseable values are
 * treated as NOT adult — the safe default for users who never set a DOB.
 */
function isAdultDob(dob) {
  if (!dob) return false;
  const birth = dob instanceof Date ? dob : new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;

  const now = new Date();
  // Latest birthdate (UTC) that is still 17+ today.
  const cutoff = Date.UTC(
    now.getUTCFullYear() - ADULT_AGE,
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const birthDay = Date.UTC(
    birth.getUTCFullYear(),
    birth.getUTCMonth(),
    birth.getUTCDate(),
  );
  return birthDay <= cutoff;
}

module.exports = { isAdultDob, ADULT_AGE };

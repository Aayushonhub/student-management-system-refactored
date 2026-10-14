/* ==========================================================
   config.js
   RESPONSIBILITY : Single home for configuration and business-rule
                    constants (storage key, pass mark, thresholds,
                    grade boundaries, limits, dropdown options).
   DEPENDS ON     : nothing
   MUST NOT USE   : DOM, LocalStorage, any other module
   ========================================================== */

const Config = (function () {

  const PASS_MARK = 40;

  return Object.freeze({
    STORAGE_KEY: "sms_students",

    // Business rules
    PASS_MARK: PASS_MARK,
    LOW_ATTENDANCE_THRESHOLD: 75,
    // The lowest passing grade (C) starts at the pass mark, so the two can never disagree.
    GRADE_BOUNDARIES: Object.freeze({ A: 80, B: 60, C: PASS_MARK }),
    TOP_PERFORMERS_COUNT: 3,

    // Validation limits
    MARKS_MIN: 0,
    MARKS_MAX: 100,
    ATTENDANCE_MIN: 0,
    ATTENDANCE_MAX: 100,
    NAME_PATTERN: /^[A-Za-z][A-Za-z .'-]*$/,

    // Dropdown options
    BRANCH_OPTIONS: Object.freeze([
      "Computer Engineering",
      "Information Technology",
      "Electronics and Telecommunication",
      "Mechanical Engineering",
      "Civil Engineering"
    ]),
    SEMESTER_OPTIONS: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8])
  });

})();

/* ==========================================================
   validator.js
   RESPONSIBILITY : Validation rules for student form input.
                    Everything it needs is passed in as arguments.
   DEPENDS ON     : Config (limits, allowed branches and semesters)
   MUST NOT USE   : DOM, LocalStorage, UI state, other services
   ========================================================== */

const Validator = (function () {

  /**
   * values           raw form text: { rollNo, name, branch, semester, marks, attendance }
   * existingStudents the current student list (for the roll-number check)
   * editingId        id of the student being edited, or null when adding
   * returns          an object of error messages keyed roll/name/branch/semester/marks/attendance.
   *                  An empty object means the input is valid.
   */
  function validateStudent(values, existingStudents, editingId) {
    const errors = {};

    if (values.rollNo === "") {
      errors.roll = "Enter a roll number.";
    } else {
      const wanted = values.rollNo.toLowerCase();
      const duplicate = existingStudents.some(
        (s) => s.rollNo.toLowerCase() === wanted && s.id !== editingId
      );
      if (duplicate) errors.roll = "This roll number already exists.";
    }

    if (values.name === "") {
      errors.name = "Enter the student's name.";
    } else if (!Config.NAME_PATTERN.test(values.name)) {
      errors.name = "Use letters, spaces and . ' - only.";
    }

    if (values.branch === "") {
      errors.branch = "Select a branch.";
    } else if (!Config.BRANCH_OPTIONS.includes(values.branch)) {
      errors.branch = "Select a branch from the list.";
    }

    if (values.semester === "") {
      errors.semester = "Select a semester.";
    } else if (!Config.SEMESTER_OPTIONS.includes(Number(values.semester))) {
      errors.semester = "Select a semester from the list.";
    }

    const marksError = validateNumber(values.marks, Config.MARKS_MIN, Config.MARKS_MAX, "Marks");
    if (marksError) errors.marks = marksError;

    const attendanceError = validateNumber(values.attendance, Config.ATTENDANCE_MIN, Config.ATTENDANCE_MAX, "Attendance");
    if (attendanceError) errors.attendance = attendanceError;

    return errors;
  }

  function validateNumber(text, min, max, label) {
    if (text === "" || isNaN(Number(text))) {
      return "Enter " + label.toLowerCase() + " as a number.";
    }
    const value = Number(text);
    if (value < min || value > max) {
      return label + " must be between " + min + " and " + max + ".";
    }
    return "";
  }

  function hasErrors(errors) {
    return Object.keys(errors).length > 0;
  }

  return Object.freeze({ validateStudent, hasErrors });

})();

/* ==========================================================
   statsCalculator.js
   RESPONSIBILITY : Calculations and business rules: averages, pass/fail,
                    low attendance, grades, branch summary, top performers.
                    The pass, low-attendance and grade rules live HERE only,
                    expressed through Config values.
   DEPENDS ON     : Config
   MUST NOT USE   : DOM, LocalStorage, UI, other services
   ========================================================== */

const StatsCalculator = (function () {

  // ----- Rules -----
  function isPassing(student) {
    return student.marks >= Config.PASS_MARK;
  }

  function isLowAttendance(student) {
    return student.attendance < Config.LOW_ATTENDANCE_THRESHOLD;
  }

  function getGrade(marks) {
    const boundaries = Config.GRADE_BOUNDARIES;
    if (marks >= boundaries.A) return "A";
    if (marks >= boundaries.B) return "B";
    if (marks >= boundaries.C) return "C";
    return "F";
  }

  // ----- Calculations -----
  function calculateAverageMarks(list) {
    if (list.length === 0) return 0;
    const total = list.reduce((sum, s) => sum + s.marks, 0);
    return total / list.length;
  }

  function calculateAverageAttendance(list) {
    if (list.length === 0) return 0;
    const total = list.reduce((sum, s) => sum + s.attendance, 0);
    return total / list.length;
  }

  function countPassing(list) {
    return list.filter(isPassing).length;
  }

  function getLowAttendanceStudents(list) {
    return list.filter(isLowAttendance);
  }

  function getDashboardStats(list) {
    return {
      total: list.length,
      averageMarks: calculateAverageMarks(list),
      averageAttendance: calculateAverageAttendance(list),
      passing: countPassing(list)
    };
  }

  function getBranchSummary(list) {
    const branches = [...new Set(list.map((s) => s.branch))].sort();
    return branches.map((branch) => {
      const group = list.filter((s) => s.branch === branch);
      return {
        branch: branch,
        count: group.length,
        avgMarks: calculateAverageMarks(group),
        avgAttendance: calculateAverageAttendance(group),
        passing: countPassing(group)
      };
    });
  }

  function getTopPerformers(list, limit) {
    return [...list].sort((a, b) => b.marks - a.marks).slice(0, limit);
  }

  return Object.freeze({
    isPassing,
    isLowAttendance,
    getGrade,
    calculateAverageMarks,
    calculateAverageAttendance,
    countPassing,
    getLowAttendanceStudents,
    getDashboardStats,
    getBranchSummary,
    getTopPerformers
  });

})();

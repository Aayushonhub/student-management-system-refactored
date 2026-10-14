/* ==========================================================
   reportService.js
   RESPONSIBILITY : Builds report CONTENT (the CSV text). It does not
                    download anything; the UI layer does that.
   DEPENDS ON     : StatsCalculator (grade and pass rules)
   MUST NOT USE   : DOM, Blob/download code, toasts, LocalStorage
   ========================================================== */

const ReportService = (function () {

  const FILE_NAME = "student-report.csv";
  const MIME_TYPE = "text/csv;charset=utf-8;";
  const HEADERS = ["Roll No", "Name", "Branch", "Semester", "Marks", "Attendance (%)", "Grade", "Result"];

  function quote(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
  }

  function buildStudentCsv(students) {
    const rows = [HEADERS];

    students.forEach((s) => {
      rows.push([
        s.rollNo, s.name, s.branch, s.semester, s.marks, s.attendance,
        StatsCalculator.getGrade(s.marks),
        StatsCalculator.isPassing(s) ? "Pass" : "Fail"
      ]);
    });

    return rows.map((row) => row.map(quote).join(",")).join("\n");
  }

  return Object.freeze({ FILE_NAME, MIME_TYPE, buildStudentCsv });

})();

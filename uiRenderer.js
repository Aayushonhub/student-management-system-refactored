/* ==========================================================
   uiRenderer.js
   RESPONSIBILITY : Draws data into the page (dashboard, student table,
                    reports). Everything it shows is passed in as arguments.
   DEPENDS ON     : Config (threshold text), StatsCalculator (isPassing and
                    isLowAttendance, used only to pick row styling)
   MUST NOT USE   : LocalStorage, CRUD, validation, saving, toasts,
                    UIController
   ========================================================== */

const UIRenderer = (function () {

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML.replace(/"/g, "&quot;");
  }

  function formatNumber(value) {
    return (Math.round(value * 10) / 10).toString();
  }

  /**
   * stats                  { total, averageMarks, averageAttendance, passing }
   * lowAttendanceStudents  students below the attendance threshold
   */
  function renderDashboard(stats, lowAttendanceStudents) {
    document.getElementById("stat-total").textContent = stats.total;
    document.getElementById("stat-marks").textContent = formatNumber(stats.averageMarks);
    document.getElementById("stat-attendance").textContent = formatNumber(stats.averageAttendance) + "%";
    document.getElementById("stat-passing").textContent = stats.passing;

    const box = document.getElementById("low-attendance-list");

    if (stats.total === 0) {
      box.innerHTML = '<p class="empty-inline">No students yet. Add a student to see attendance alerts.</p>';
    } else if (lowAttendanceStudents.length === 0) {
      box.innerHTML = '<p class="empty-inline">Every student is at ' + Config.LOW_ATTENDANCE_THRESHOLD +
        '% attendance or above.</p>';
    } else {
      box.innerHTML = '<ul class="mini-list">' + lowAttendanceStudents.map((s) =>
        '<li><div class="who"><strong>' + escapeHtml(s.name) + '</strong>' +
        '<small>Roll ' + escapeHtml(s.rollNo) + ', ' + escapeHtml(s.branch) + '</small></div>' +
        '<span class="chip chip-fail">' + formatNumber(s.attendance) + '%</span></li>'
      ).join("") + '</ul>';
    }
  }

  /**
   * visibleStudents  students to show (already filtered by the caller)
   * totalCount       number of students in the system (for the count text)
   * searchQuery      the trimmed search text ("" when not searching)
   * highlightId      id of a row to flash, or null
   */
  function renderTable(visibleStudents, totalCount, searchQuery, highlightId) {
    const body = document.getElementById("student-table-body");
    const tableWrap = document.getElementById("table-wrap");
    const empty = document.getElementById("empty-state");
    const count = document.getElementById("result-count");
    const searching = searchQuery !== "";

    if (totalCount === 0) {
      count.textContent = "";
    } else if (!searching) {
      count.textContent = totalCount + (totalCount === 1 ? " student" : " students");
    } else {
      count.textContent = visibleStudents.length + " of " + totalCount + " shown";
    }

    if (visibleStudents.length === 0) {
      tableWrap.hidden = true;
      empty.hidden = false;
      if (totalCount === 0) {
        empty.innerHTML = '<h3>No students yet</h3><p>Add your first student to start tracking marks and attendance.</p>' +
          '<button class="btn btn-primary" data-action="add-student">Add student</button>';
      } else {
        empty.innerHTML = '<h3>No matching students</h3><p>Nothing matches "' + escapeHtml(searchQuery) +
          '". Try a different name, roll number or branch.</p>';
      }
      body.innerHTML = "";
      return;
    }

    tableWrap.hidden = false;
    empty.hidden = true;

    body.innerHTML = visibleStudents.map((s) => {
      const passed = StatsCalculator.isPassing(s);
      const lowAtt = StatsCalculator.isLowAttendance(s);
      const rowClass = s.id === highlightId ? ' class="row-new"' : "";
      return '<tr' + rowClass + '>' +
        '<td>' + escapeHtml(s.rollNo) + '</td>' +
        '<td class="name-cell">' + escapeHtml(s.name) + '</td>' +
        '<td>' + escapeHtml(s.branch) + '</td>' +
        '<td class="num">' + s.semester + '</td>' +
        '<td class="num">' + formatNumber(s.marks) + '</td>' +
        '<td><div class="att"><span class="att-num">' + formatNumber(s.attendance) + '%</span>' +
          '<div class="att-bar' + (lowAtt ? ' low' : '') + '"><span style="width:' + s.attendance + '%"></span></div></div></td>' +
        '<td><span class="chip ' + (passed ? 'chip-pass' : 'chip-fail') + '">' + (passed ? 'Pass' : 'Fail') + '</span></td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-small btn-edit" data-action="edit-student" data-id="' + escapeHtml(s.id) + '">Edit</button>' +
          '<button class="btn btn-small btn-delete" data-action="delete-student" data-id="' + escapeHtml(s.id) + '">Delete</button>' +
        '</div></td>' +
        '</tr>';
    }).join("");
  }

  /**
   * branchSummary  [{ branch, count, avgMarks, avgAttendance, passing }]
   * topPerformers  students already ranked by the caller
   */
  function renderReports(branchSummary, topPerformers) {
    const body = document.getElementById("branch-report-body");

    if (branchSummary.length === 0) {
      body.innerHTML = '<tr><td colspan="5" class="empty-inline">No data yet. Add students to generate a report.</td></tr>';
    } else {
      body.innerHTML = branchSummary.map((row) =>
        '<tr><td class="name-cell">' + escapeHtml(row.branch) + '</td>' +
        '<td class="num">' + row.count + '</td>' +
        '<td class="num">' + formatNumber(row.avgMarks) + '</td>' +
        '<td class="num">' + formatNumber(row.avgAttendance) + '%</td>' +
        '<td class="num">' + row.passing + ' of ' + row.count + '</td></tr>'
      ).join("");
    }

    const box = document.getElementById("top-performers-list");
    if (topPerformers.length === 0) {
      box.innerHTML = '<p class="empty-inline">No students yet.</p>';
    } else {
      box.innerHTML = '<ul class="mini-list">' + topPerformers.map((s) =>
        '<li><div class="who"><strong>' + escapeHtml(s.name) + '</strong>' +
        '<small>' + escapeHtml(s.branch) + ', semester ' + s.semester + '</small></div>' +
        '<span class="chip chip-pass">' + formatNumber(s.marks) + ' marks</span></li>'
      ).join("") + '</ul>';
    }
  }

  /** view: everything the three screens need, prepared by main.js */
  function renderAll(view) {
    renderDashboard(view.stats, view.lowAttendanceStudents);
    renderTable(view.visibleStudents, view.totalCount, view.searchQuery, view.highlightId);
    renderReports(view.branchSummary, view.topPerformers);
  }

  return Object.freeze({ renderAll, renderDashboard, renderTable, renderReports, escapeHtml, formatNumber });

})();

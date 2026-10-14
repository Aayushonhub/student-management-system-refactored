/* ==========================================================
   main.js
   RESPONSIBILITY : Composition root. Owns the application state (which
                    student is being edited, which is waiting to be deleted,
                    the search text) and runs each workflow by calling the
                    other modules in the right order:
                      validate -> change data -> save -> redraw -> tell the user.
   DEPENDS ON     : every other module (this is the only place that knows all of them)
   MUST NOT USE   : document / localStorage directly. All of that goes through
                    UIController and StorageService.
   ========================================================== */

(function () {

  // ---------------------------------------------------------
  // Application state
  // ---------------------------------------------------------
  let editingId = null;       // id of the student in the edit form, or null when adding
  let pendingDeleteId = null; // id of the student waiting for delete confirmation
  let searchQuery = "";       // trimmed search text as typed by the user

  // ---------------------------------------------------------
  // Start-up
  // ---------------------------------------------------------
  function init() {
    UIController.populateStaticContent();
    loadStudents();
    UIController.bindEvents({
      onAddStudent: openAddForm,
      onEditStudent: openEditForm,
      onDeleteStudent: askDelete,
      onSearch: handleSearch,
      onSubmit: handleFormSubmit,
      onCloseStudentModal: closeStudentForm,
      onCancelDelete: closeConfirm,
      onConfirmDelete: confirmDelete,
      onExportCsv: exportCsv,
      onEscape: handleEscape
    });
    refreshAll(null);
  }

  /** Loads saved students. First launch (nothing saved) gets the sample students. */
  function loadStudents() {
    const result = StorageService.load();

    if (!result.found) {
      StudentService.setStudents(StudentService.getSampleStudents());
      persist();
      return;
    }
    // Saved but unreadable data starts as an empty list, as in the original app.
    StudentService.setStudents(result.students);
  }

  // ---------------------------------------------------------
  // Save and redraw helpers
  // ---------------------------------------------------------
  function persist() {
    const result = StorageService.save(StudentService.getAllStudents());
    if (!result.ok) UIController.showToast("Could not save data to the browser.");
  }

  /** highlightId: id of a row to flash once (the student just added), or null. */
  function refreshAll(highlightId) {
    const all = StudentService.getAllStudents();
    UIRenderer.renderAll({
      stats: StatsCalculator.getDashboardStats(all),
      lowAttendanceStudents: StatsCalculator.getLowAttendanceStudents(all),
      visibleStudents: StudentService.searchStudents(searchQuery),
      totalCount: StudentService.countStudents(),
      searchQuery: searchQuery,
      highlightId: highlightId,
      branchSummary: StatsCalculator.getBranchSummary(all),
      topPerformers: StatsCalculator.getTopPerformers(all, Config.TOP_PERFORMERS_COUNT)
    });
  }

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------
  function handleSearch(text) {
    searchQuery = text.trim();
    UIRenderer.renderTable(
      StudentService.searchStudents(searchQuery),
      StudentService.countStudents(),
      searchQuery,
      null
    );
  }

  // ---------------------------------------------------------
  // Add / edit
  // ---------------------------------------------------------
  function openAddForm() {
    editingId = null;
    UIController.showStudentModal({ title: "Add student", saveLabel: "Save student", student: null });
  }

  function openEditForm(id) {
    const student = StudentService.findStudent(id);
    if (!student) return;

    editingId = id;
    UIController.showStudentModal({ title: "Edit student", saveLabel: "Update student", student: student });
  }

  function closeStudentForm() {
    UIController.closeStudentModal();
    editingId = null;
  }

  function handleFormSubmit() {
    const values = UIController.readFormValues();
    const errors = Validator.validateStudent(values, StudentService.getAllStudents(), editingId);
    UIController.showFormErrors(errors);
    if (Validator.hasErrors(errors)) return;

    const clean = StudentService.normalizeInput(values);

    if (editingId === null) {
      const added = StudentService.addStudent(clean);
      persist();
      refreshAll(added.id);
      UIController.showToast("Student added.");
    } else {
      const updated = StudentService.updateStudent(editingId, clean);
      if (updated !== null) {
        persist();
        refreshAll(null);
        UIController.showToast("Student updated.");
      }
    }
    closeStudentForm();
  }

  // ---------------------------------------------------------
  // Delete
  // ---------------------------------------------------------
  function askDelete(id) {
    const student = StudentService.findStudent(id);
    if (!student) return;

    pendingDeleteId = id;
    UIController.showConfirm(
      "This will permanently remove " + student.name + " (roll " + student.rollNo + "). This cannot be undone."
    );
  }

  function confirmDelete() {
    if (pendingDeleteId !== null) {
      StudentService.deleteStudent(pendingDeleteId);
      persist();
      refreshAll(null);
      UIController.showToast("Student deleted.");
    }
    closeConfirm();
  }

  function closeConfirm() {
    UIController.closeConfirm();
    pendingDeleteId = null;
  }

  // ---------------------------------------------------------
  // Report export
  // ---------------------------------------------------------
  function exportCsv() {
    if (StudentService.countStudents() === 0) {
      UIController.showToast("There are no students to export.");
      return;
    }

    const csv = ReportService.buildStudentCsv(StudentService.getAllStudents());
    UIController.downloadTextFile(ReportService.FILE_NAME, csv, ReportService.MIME_TYPE);
    UIController.showToast("Report downloaded.");
  }

  // ---------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------
  function handleEscape() {
    closeStudentForm();
    closeConfirm();
  }

  // ---------------------------------------------------------
  // Go
  // ---------------------------------------------------------
  UIController.onReady(init);

})();

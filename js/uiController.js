/* ==========================================================
   uiController.js
   RESPONSIBILITY : Everything the user touches: DOM event listeners, reading
                    the form, showing form errors, modals, navigation, toast
                    messages and triggering the CSV file download.
                    It reports what the user did through callbacks given to
                    bindEvents(); it never decides what happens next.
   DEPENDS ON     : Config (to fill the dropdowns and the threshold text)
   MUST NOT USE   : LocalStorage, StudentService, Validator, StatsCalculator,
                    ReportService, StorageService, UIRenderer, main.js
   ========================================================== */

const UIController = (function () {

  const TOAST_DURATION_MS = 2400;
  const MODAL_FOCUS_DELAY_MS = 50;
  const FORM_FIELDS = ["roll", "name", "branch", "semester", "marks", "attendance"];

  let toastTimer = null;

  function byId(id) {
    return document.getElementById(id);
  }

  // ---------------------------------------------------------
  // One-time page set-up
  // ---------------------------------------------------------

  /** Runs callback once the page structure exists (now, or when it finishes loading). */
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  /** Fills the dropdowns and the threshold text from Config, so index.html holds no rules. */
  function populateStaticContent() {
    const branchSelect = byId("f-branch");
    Config.BRANCH_OPTIONS.forEach((branch) => {
      const option = document.createElement("option");
      option.textContent = branch;
      branchSelect.appendChild(option);
    });

    const semesterSelect = byId("f-semester");
    Config.SEMESTER_OPTIONS.forEach((semester) => {
      const option = document.createElement("option");
      option.value = String(semester);
      option.textContent = String(semester);
      semesterSelect.appendChild(option);
    });

    byId("low-att-threshold").textContent = Config.LOW_ATTENDANCE_THRESHOLD;
  }

  /**
   * Attaches every listener in the app (replaces all inline handlers).
   * handlers: { onAddStudent, onEditStudent(id), onDeleteStudent(id), onSearch(text),
   *             onSubmit, onCloseStudentModal, onCancelDelete, onConfirmDelete,
   *             onExportCsv, onEscape }
   * Buttons are matched by their data-action attribute using ONE delegated click
   * listener, so rows that are redrawn later keep working.
   */
  function bindEvents(handlers) {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;

      switch (target.dataset.action) {
        case "navigate":            showView(target.dataset.view); break;
        case "add-student":         handlers.onAddStudent(); break;
        case "edit-student":        handlers.onEditStudent(target.dataset.id); break;
        case "delete-student":      handlers.onDeleteStudent(target.dataset.id); break;
        case "export-csv":          handlers.onExportCsv(); break;
        case "close-student-modal": handlers.onCloseStudentModal(); break;
        case "cancel-delete":       handlers.onCancelDelete(); break;
        case "confirm-delete":      handlers.onConfirmDelete(); break;
      }
    });

    byId("search-input").addEventListener("input", (event) => {
      handlers.onSearch(event.target.value);
    });

    byId("student-form").addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.onSubmit();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") handlers.onEscape();
    });
  }

  // ---------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------
  function showView(name) {
    document.querySelectorAll(".view").forEach((section) => {
      section.classList.toggle("active", section.id === "view-" + name);
    });
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === name);
    });
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------
  // Add / edit form
  // ---------------------------------------------------------

  /** Returns the raw (trimmed) text of every form field. Does not validate. */
  function readFormValues() {
    return {
      rollNo: byId("f-roll").value.trim(),
      name: byId("f-name").value.trim().replace(/\s+/g, " "),
      branch: byId("f-branch").value,
      semester: byId("f-semester").value,
      marks: byId("f-marks").value.trim(),
      attendance: byId("f-attendance").value.trim()
    };
  }

  /** errors: { roll, name, branch, semester, marks, attendance } messages (missing key = no error). */
  function showFormErrors(errors) {
    FORM_FIELDS.forEach((key) => {
      const message = errors[key] || "";
      byId("err-" + key).textContent = message;
      byId("f-" + key).parentElement.classList.toggle("invalid", message !== "");
    });

    const firstBad = FORM_FIELDS.find((key) => errors[key]);
    if (firstBad) byId("f-" + firstBad).focus();
  }

  /**
   * options: { title, saveLabel, student }
   *   student = null  -> blank form (add)
   *   student = {...} -> form pre-filled with that record (edit)
   */
  function showStudentModal(options) {
    byId("modal-title").textContent = options.title;
    byId("save-btn").textContent = options.saveLabel;

    if (options.student === null) {
      byId("student-form").reset();
    } else {
      const s = options.student;
      byId("f-roll").value = s.rollNo;
      byId("f-name").value = s.name;
      byId("f-branch").value = s.branch;
      byId("f-semester").value = String(s.semester);
      byId("f-marks").value = s.marks;
      byId("f-attendance").value = s.attendance;
    }

    showFormErrors({});
    openOverlay("student-modal");
    setTimeout(() => byId("f-roll").focus(), MODAL_FOCUS_DELAY_MS);
  }

  function closeStudentModal() {
    closeOverlay("student-modal");
  }

  // ---------------------------------------------------------
  // Delete confirmation
  // ---------------------------------------------------------
  function showConfirm(message) {
    byId("confirm-text").textContent = message;
    openOverlay("confirm-modal");
  }

  function closeConfirm() {
    closeOverlay("confirm-modal");
  }

  // ---------------------------------------------------------
  // Shared overlay helpers
  // ---------------------------------------------------------
  function openOverlay(id) {
    const overlay = byId(id);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeOverlay(id) {
    const overlay = byId(id);
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
  }

  // ---------------------------------------------------------
  // Toast
  // ---------------------------------------------------------
  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), TOAST_DURATION_MS);
  }

  // ---------------------------------------------------------
  // File download (the report service only supplies the text)
  // ---------------------------------------------------------
  function downloadTextFile(fileName, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  return Object.freeze({
    onReady,
    populateStaticContent,
    bindEvents,
    showView,
    readFormValues,
    showFormErrors,
    showStudentModal,
    closeStudentModal,
    showConfirm,
    closeConfirm,
    showToast,
    downloadTextFile
  });

})();

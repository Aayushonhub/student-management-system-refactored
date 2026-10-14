/* ==========================================================
   storageService.js
   RESPONSIBILITY : Reading and writing the student list in LocalStorage.
                    Failures are RETURNED as results; this module never
                    shows messages itself.
   DEPENDS ON     : Config (storage key)
   MUST NOT USE   : DOM, rendering, toasts, validation, student rules
   ========================================================== */

const StorageService = (function () {

  /**
   * Result shape: { ok, found, students, error? }
   *   found = false -> nothing saved yet (first launch)
   *   ok    = false -> storage was unavailable or the saved data was unreadable
   */
  function load() {
    let raw;
    try {
      raw = localStorage.getItem(Config.STORAGE_KEY);
    } catch (error) {
      return { ok: false, found: false, students: [], error: "Browser storage is not available." };
    }

    if (raw === null) {
      return { ok: true, found: false, students: [] };
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { ok: true, found: true, students: parsed };
      }
      return { ok: false, found: true, students: [], error: "Saved data has an unexpected format." };
    } catch (error) {
      return { ok: false, found: true, students: [], error: "Saved data could not be read." };
    }
  }

  /** Result shape: { ok, error? } */
  function save(students) {
    try {
      localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(students));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not write to browser storage." };
    }
  }

  return Object.freeze({ load, save });

})();

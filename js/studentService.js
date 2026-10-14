/* ==========================================================
   studentService.js
   RESPONSIBILITY : Owns the in-memory student list: create, read, update,
                    delete, search, sample data and input normalisation.
   DEPENDS ON     : nothing
   MUST NOT USE   : DOM, LocalStorage, rendering, toasts
   NOTE           : It never saves or renders. main.js decides what happens
                    after a change.
   ========================================================== */

const StudentService = (function () {

  // The only mutable state in this module (private to it).
  let students = [];

  function copy(student) {
    return Object.assign({}, student);
  }

  function generateId() {
    return "s" + Date.now() + Math.floor(Math.random() * 1000);
  }

  function getSampleStudents() {
    return [
      { id: "s1", rollNo: "01", name: "Riya Patil",   branch: "Computer Engineering",              semester: 4, marks: 86,   attendance: 92 },
      { id: "s2", rollNo: "02", name: "Karan Mehta",  branch: "Information Technology",            semester: 4, marks: 72.5, attendance: 81 },
      { id: "s3", rollNo: "03", name: "Sneha Iyer",   branch: "Electronics and Telecommunication", semester: 6, marks: 58,   attendance: 74 },
      { id: "s4", rollNo: "04", name: "Arjun Nair",   branch: "Mechanical Engineering",            semester: 2, marks: 35,   attendance: 62 },
      { id: "s5", rollNo: "05", name: "Pooja Desai",  branch: "Computer Engineering",              semester: 6, marks: 91,   attendance: 96 },
      { id: "s6", rollNo: "06", name: "Rahul Shinde", branch: "Civil Engineering",                 semester: 8, marks: 47,   attendance: 69 }
    ];
  }

  /** Turns validated raw form text into a clean, typed student record (no id). */
  function normalizeInput(values) {
    return {
      rollNo: values.rollNo,
      name: values.name.replace(/\s+/g, " "),
      branch: values.branch,
      semester: Number(values.semester),
      marks: Number(values.marks),
      attendance: Number(values.attendance)
    };
  }

  function setStudents(list) {
    students = list.map(copy);
  }

  function getAllStudents() {
    return students.map(copy);
  }

  function countStudents() {
    return students.length;
  }

  function findStudent(id) {
    const found = students.find((s) => s.id === id);
    return found ? copy(found) : null;
  }

  function addStudent(values) {
    const student = Object.assign({ id: generateId() }, values);
    students.push(student);
    return copy(student);
  }

  /** Returns the updated student, or null if the id does not exist. */
  function updateStudent(id, values) {
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return null;
    students[index] = Object.assign({ id: id }, values);
    return copy(students[index]);
  }

  /** Returns true if a student was removed. */
  function deleteStudent(id) {
    const before = students.length;
    students = students.filter((s) => s.id !== id);
    return students.length < before;
  }

  /** Matches name, roll number or branch, case-insensitively. Empty query returns everyone. */
  function searchStudents(query) {
    const q = String(query).trim().toLowerCase();
    if (q === "") return getAllStudents();
    return students
      .filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.branch.toLowerCase().includes(q)
      )
      .map(copy);
  }

  return Object.freeze({
    getSampleStudents,
    normalizeInput,
    setStudents,
    getAllStudents,
    countStudents,
    findStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    searchStudents
  });

})();

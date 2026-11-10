
import { useEffect, useState } from "react";
import { getClasses, createHold } from "./api";
import "./App.css";

function App() {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [hold, setHold] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);


useEffect(() => {
  async function loadClasses() {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      setClassesError(error.message);
    } finally {
      setClassesLoading(false);
    }
  }

  loadClasses();
}, []);


  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>School Admission</h1>
            <p>Admission Management System</p>
          </div>
        </div>
        <span className="header-label">Student Portal</span>
      </header>

      <main className="container">
        <section className="welcome">
          <p className="eyebrow">ADMISSIONS 2027</p>
          <h2>Start your admission journey</h2>
          <p>
            Explore available classes and reserve your seat.
            Complete your information to get started.
          </p>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h3>Student Information</h3>
              <p>Enter your details to continue.</p>
            </div>
            <span className="step-label">STEP 1</span>
          </div>

          <form
           onSubmit={async (event) => {
  event.preventDefault();
  setFormError("");
  setHold(null);

  if (!selectedClassId) {
    setFormError("Please select a class first.");
    return;
  }

  try {
    setSubmitting(true);

    const result = await createHold(
      selectedClassId,
      studentId,
      {
        fullName: studentName,
        dateOfBirth,
        guardianName,
        guardianPhone,
      }
    );

    setHold(result);
  } catch (error) {
    setFormError(error.message);
  } finally {
    setSubmitting(false);
  }
}}
          >
            <div className="form-grid">
              <div className="field">
                <label htmlFor="studentId">
                  Birth Registration Number
                </label>
                <input
                  id="studentId"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="Enter birth registration number"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="studentName">Student Full Name</label>
                <input
                  id="studentName"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="guardianName">Guardian Name</label>
                <input
                  id="guardianName"
                  value={guardianName}
                  onChange={(event) => setGuardianName(event.target.value)}
                  placeholder="Enter guardian's name"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="guardianPhone">Guardian Phone</label>
                <input
                  id="guardianPhone"
                  type="tel"
                  value={guardianPhone}
                  onChange={(event) => setGuardianPhone(event.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
            </div>

            <button
  type="submit"
  className="primary-button"
  disabled={submitting}
>
  {submitting ? "Processing..." : "Reserve My Seat"}
</button>
          </form>

{formError && (
  <p className="error-message">{formError}</p>
)}

{hold && (
  <div className="success-message">
    <h4>Seat Reserved Successfully!</h4>
    <p>Hold ID: {hold.id}</p>
    <p>Status: {hold.status}</p>
    <p>Expires: {hold.expiresAt}</p>
  </div>
)}

        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h3>Available Classes</h3>
              <p>Choose a class and shift for admission.</p>
            </div>
          </div>

          {classesLoading && <p>Loading classes...</p>}

{classesError && (
  <p className="error-message">{classesError}</p>
)}

{!classesLoading && !classesError && classes.length === 0 && (
  <p>No classes are available yet.</p>
)}

{!classesLoading && !classesError && classes.length > 0 && (
  <div className="class-list">
    {classes.map((schoolClass) => (
      <div className="class-card" key={schoolClass.id}>
  <div>
    <h4>{schoolClass.name}</h4>
    <p>{schoolClass.shift} Shift</p>
  </div>

  <span className="seat-count">
    {schoolClass.totalSeats} seats
  </span>

  <button
    type="button"
    onClick={() => setSelectedClassId(String(schoolClass.id))}
  >
    {selectedClassId === String(schoolClass.id)
      ? "Selected"
      : "Select Class"}
  </button>
</div>

    ))}

  </div>
)}
{selectedClassId && (
  <p>
    Selected class ID: {selectedClassId}
  </p>
)}
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h3>My Admissions</h3>
              <p>View your seat reservations and admission status.</p>
            </div>
          </div>

          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <p>No admission records displayed yet.</p>
            <span>Your holds will appear here after we connect the API.</span>
          </div>
        </section>

        <footer>
          School Admission System · Student Portal
        </footer>
      </main>
    </div>
  );
}

export default App;

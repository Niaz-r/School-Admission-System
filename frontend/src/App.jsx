import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import {
  getClasses,
  createHold,
  getMyHolds,
  createClass,
} from "./api";

import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [classes, setClasses] = useState([]);


  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
const [className, setClassName] = useState("");
const [classShift, setClassShift] = useState("Morning");
const [totalSeats, setTotalSeats] = useState("");
const [adminMessage, setAdminMessage] = useState("");
const [adminError, setAdminError] = useState("");
const [adminSubmitting, setAdminSubmitting] = useState(false);

  const [hold, setHold] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myHolds, setMyHolds] = useState([]);
  const [holdsLoading, setHoldsLoading] = useState(false);
  const [holdsError, setHoldsError] = useState("");


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

async function loadMyAdmissions() {
  if (!studentId.trim()) {
    setHoldsError("Enter your Birth Registration Number first.");
    return;
  }

  try {
    setHoldsLoading(true);
    setHoldsError("");

    const records = await getMyHolds(studentId);
    setMyHolds(records);
  } catch (error) {
    setHoldsError(error.message);
  } finally {
    setHoldsLoading(false);
  }
}



async function handleCreateClass(event) {
  event.preventDefault();

  setAdminMessage("");
  setAdminError("");

  if (!className.trim() || !totalSeats || Number(totalSeats) <= 0) {
    setAdminError("Please enter a class name and a valid seat number.");
    return;
  }

  try {
    setAdminSubmitting(true);

    await createClass({
      name: className.trim(),
      shift: classShift,
      totalSeats: Number(totalSeats),
    });

    setAdminMessage("Class created successfully.");

    setClassName("");
    setClassShift("Morning");
    setTotalSeats("");

    const updatedClasses = await getClasses();
    setClasses(updatedClasses);
  } catch (error) {
    setAdminError(error.message);
  } finally {
    setAdminSubmitting(false);
  }
}


   if (currentPage === "home") {
    return (
      <HomePage
        onAdmissionClick={() => setCurrentPage("admission")}
        onAdminClick={() => setCurrentPage("admin")}
      />
    );
  }

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
        <button
  type="button"
  className="primary-button"
  onClick={() => setCurrentPage("home")}
>
  Home
</button>
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
    const records = await getMyHolds(studentId);
setMyHolds(records);
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
      <button
  type="button"
  className="primary-button"
  onClick={loadMyAdmissions}
  disabled={holdsLoading}
>
  {holdsLoading ? "Loading..." : "Load My Admissions"}
</button>
    </div>
  </div>

  {holdsLoading && <p>Loading admission records...</p>}

  {holdsError && (
    <p className="error-message">{holdsError}</p>
  )}

  {!holdsLoading && !holdsError && myHolds.length === 0 && (
    <div className="empty-state">
      <div className="empty-icon">▤</div>
      <p>No admission records found.</p>
      <span>Your reservations will appear here.</span>
    </div>
  )}

  {myHolds.length > 0 && (
    <div className="class-list">
      {myHolds.map((item) => (
        <div className="class-card" key={item.id}>
          <div>
            <h4>Admission Reservation</h4>
            <p>Status: {item.status}</p>
            <p>Hold ID: {item.id}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

        <footer>
          School Admission System · Student Portal
        </footer>
      </main>
    </div>
  );
}

export default App;

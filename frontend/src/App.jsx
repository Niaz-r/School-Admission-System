import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import AdminPage from "./AdminPage";
import AdminPanel from "./AdminPanel";
import {
  getClasses,
  createHold,
  getMyHolds,
  confirmHold,
} from "./api";

import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [studentId, setStudentId] = useState("");
  const [admissionsStudentId, setAdmissionsStudentId] = useState("");
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
  if (!/^\d{17}$/.test(admissionsStudentId.trim())) {
    setHoldsError("Enter a valid 17-digit Birth Registration Number.");
    setMyHolds([]);
    return;
  }

  try {
    setHoldsLoading(true);
    setHoldsError("");

    const records = await getMyHolds(admissionsStudentId.trim());
    setMyHolds(records);
  } catch (error) {
    setHoldsError(error.message);
    setMyHolds([]);
  } finally {
    setHoldsLoading(false);
  }
}

async function handlePayment(holdId = hold.id, ownerStudentId = studentId) {
  try {
    setFormError("");

    const result = await confirmHold(holdId, ownerStudentId);

    setHold((previous) =>
      previous && previous.id === holdId
        ? { ...previous, ...result }
        : previous
    );

    const updatedHolds = await getMyHolds(ownerStudentId);
    setMyHolds(updatedHolds);
  } catch (error) {
    setFormError(error.message);
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

  if (currentPage === "admin") {
  return (
    <AdminPage
      onBack={() => setCurrentPage("home")}
      onLogin={() => setCurrentPage("admin-panel")}
    />
  );
}

if (currentPage === "admin-panel") {
  return (
    <AdminPanel
      onHome={() => setCurrentPage("home")}
    />
  );
}

  return (
    <div className="app">
      <header className="header">
        <div
  className="brand"
  onClick={() => setCurrentPage("home")}
  role="button"
  tabIndex={0}
  style={{ cursor: "pointer" }}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      setCurrentPage("home");
    }
  }}
>
  <div className="brand-icon">S</div>
  <div>
    <h1>School Admission</h1>
    <p>Admission Management System</p>
  </div>
</div>
       
<div className="header-actions">
  <button
    type="button"
    className="primary-button"
    onClick={() => setCurrentPage("home")}
  >
    Home
  </button>

  <button
    type="button"
    className="primary-button"
    onClick={() => setCurrentPage("admin")}
  >
    Admin
  </button>
</div>

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
  id="admissionForm"
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

        
          </form>

{formError && (
  <p className="error-message">{formError}</p>
)}


{hold && (
  <div className="modal-overlay">
    <div className="reservation-modal">
      <button
        type="button"
        className="modal-close"
        onClick={() => setHold(null)}
        aria-label="Close popup"
      >
        ×
      </button>

      <div className="success-icon">✓</div>

      <h2>Seat Reserved Successfully!</h2>
      <p className="modal-description">
        Your seat has been temporarily reserved.
      </p>

      <div className="reservation-details">
        <p><strong>Hold ID:</strong> {hold.id}</p>
        <p><strong>Status:</strong> {hold.status}</p>
        <p><strong>Expires:</strong> {hold.expiresAt}</p>
      </div>

      {hold.status === "HELD" && (
        <button
          type="button"
          className="primary-button modal-payment-button"
          onClick={() => handlePayment(hold.id, studentId)}
        >
          Pay Admission Fee
        </button>
      )}

      {hold.status === "CONFIRMED" && (
        <p className="success-message">
          Payment successful! Your admission is confirmed.
        </p>
      )}
    </div>
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

 <div className="seat-count">
  <p>Total: {schoolClass.totalSeats}</p>
  <p>Held: {schoolClass.heldSeats}</p>
  <p>Confirmed: {schoolClass.confirmedSeats}</p>
  <p>Available: {schoolClass.availableSeats}</p>
</div>

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

{(
  <button
    type="submit"
    form="admissionForm"
    className="primary-button"
    disabled={submitting}
  >
    {submitting ? "Processing..." : "Reserve My Seat"}
  </button>
)}
        </section>



        <section className="panel">
  <div className="section-heading">
    <div>
      <h3>My Admissions</h3>
      <p>View your seat reservations and admission status.</p>
      <div className="field">
  <label htmlFor="admissionsStudentId">
    Birth Registration Number
  </label>
  <input
    id="admissionsStudentId"
    value={admissionsStudentId}
    onChange={(event) => setAdmissionsStudentId(event.target.value)}
    placeholder="Enter your 17-digit number"
    maxLength={17}
  />
</div>
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

      {item.status === "HELD" && (
        <>
          <button
            type="button"
            className="primary-button"
            onClick={() => handlePayment(item.id, admissionsStudentId.trim())}
          >
            Pay Admission Fee
          </button>
        </>
      )}
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

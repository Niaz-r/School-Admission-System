import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import AdminPage from "./AdminPage";
import AdminPanel from "./AdminPanel";
import {
  getClasses,
  createHold,
  getMyHolds,
  confirmHold,
   cancelHold,
} from "./api";

import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [studentId, setStudentId] = useState("");
  const admissionsStudentId = studentId;
  const setAdmissionsStudentId = setStudentId;
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
useEffect(() => {
  if (!/^\d{17}$/.test(studentId.trim())) {
    setMyHolds([]);
    setHoldsError("");
    return;
  }

  loadMyAdmissions();
}, [studentId]);


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
    const updatedClasses = await getClasses();
setClasses(updatedClasses);
  } catch (error) {
    setFormError(error.message);
  }
}


async function handleCancel(holdId, ownerStudentId) {
  try {
    setFormError("");

    await cancelHold(holdId, ownerStudentId);

    setHold((previous) =>
      previous && previous.id === holdId
        ? { ...previous, status: "CANCELLED" }
        : previous
    );

    const updatedHolds = await getMyHolds(ownerStudentId);
    setMyHolds(updatedHolds);

    const updatedClasses = await getClasses();
    setClasses(updatedClasses);
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
  <div className="brand-icon">O</div>
<div>
  <h1>Onnorokom Projukti School</h1>
  <p>Online School Admission Portal</p>
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
         <p className="eyebrow">ADMISSION OPEN 2027</p>
<h2>ভর্তি কার্যক্রম চলছে — Admission Open!</h2>
<p>
  Onnorokom Projukti School-এ আপনার সন্তানের ভর্তি আবেদন সম্পন্ন করুন।
  Explore available classes and reserve your seat.
</p>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h3>শিক্ষার্থীর তথ্য · Student Information</h3>
<p>ভর্তির আবেদন সম্পন্ন করতে নিচের তথ্যগুলো পূরণ করুন।</p>
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
const updatedClasses = await getClasses();
setClasses(updatedClasses);
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
                  জন্ম নিবন্ধন নম্বর · Birth Registration Number
                </label>
                <input
                  id="studentId"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="১৭ সংখ্যার জন্ম নিবন্ধন নম্বর লিখুন"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="studentName">শিক্ষার্থীর পূর্ণ নাম · Student Full Name</label>
                <input
                  id="studentName"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="dateOfBirth">জন্ম তারিখ · Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="guardianName">অভিভাবকের নাম · Guardian Name</label>
                <input
                  id="guardianName"
                  value={guardianName}
                  onChange={(event) => setGuardianName(event.target.value)}
                  placeholder="Enter guardian's name"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="guardianPhone">অভিভাবকের মোবাইল · Guardian Phone</label>
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
         ভর্তি ফি প্রদান করুন · Pay Admission Fee
        </button>
 
      )}

      {hold.status === "HELD" && (
  <button
    type="button"
    className="cancel-button"
    onClick={() => handleCancel(hold.id, studentId)}
  >
    আসন বাতিল করুন · Cancel Reservation
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
             <h3>শ্রেণিসমূহ · Available Classes</h3>
<p>ভর্তির জন্য আপনার পছন্দের শ্রেণি ও শিফট নির্বাচন করুন।</p>
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
  <p>মোট আসন · Total: {schoolClass.totalSeats}</p>
  <p>সাময়িক সংরক্ষিত · Held: {schoolClass.heldSeats}</p>
  <p>নিশ্চিত ভর্তি · Confirmed: {schoolClass.confirmedSeats}</p>
  <p>খালি আসন · Available: {schoolClass.availableSeats}</p>
</div>

  <button
  type="button"
  className={
    selectedClassId === String(schoolClass.id)
      ? "selected-class-button"
      : ""
  }
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
    {submitting ? "প্রক্রিয়াধীন..." : "আসন সংরক্ষণ করুন · Reserve My Seat"}
  </button>
)}
        </section>



        <section className="panel">
  <div className="section-heading">
    <div>
     <h3>আমার ভর্তি আবেদনসমূহ · My Admissions</h3>
      <p>আপনার ভর্তি আবেদনের অবস্থা দেখুন ও পরিচালনা করুন।</p>
      <div className="field">
  <label htmlFor="admissionsStudentId">
    জন্ম নিবন্ধন নম্বর · Birth Registration Number
  </label>
  <input
    id="admissionsStudentId"
    value={admissionsStudentId}
    onChange={(event) => setAdmissionsStudentId(event.target.value)}
   placeholder="১৭ সংখ্যার জন্ম নিবন্ধন নম্বর লিখুন"
    maxLength={17}
  />
</div>
      <button
  type="button"
  className="primary-button"
  onClick={loadMyAdmissions}
  disabled={holdsLoading}
>
  {holdsLoading ? "লোড হচ্ছে..." : "ভর্তির আবেদন দেখুন · Load My Admissions"}
</button>
    </div>
  </div>

 {holdsLoading && <p>ভর্তির তথ্য লোড হচ্ছে...</p>}

  {holdsError && (
    <p className="error-message">{holdsError}</p>
  )}

  {!holdsLoading && !holdsError && myHolds.length === 0 && (
    <div className="empty-state">
      <div className="empty-icon">▤</div>
     <p>কোনো ভর্তি আবেদন পাওয়া যায়নি।</p>
<span>আপনার সংরক্ষিত আসনের তথ্য এখানে দেখা যাবে।</span>
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
            ভর্তি ফি প্রদান করুন · Pay Admission Fee
          </button>
        </>
      )}

      {item.status === "HELD" && (
  <button
    type="button"
    className="cancel-button"
    onClick={() =>
      handleCancel(item.id, admissionsStudentId.trim())
    }
  >
    আসন বাতিল করুন · Cancel Reservation
  </button>
)}
    </div>
  </div>
))}
    </div>
  )}
</section>

     <footer>
  Onnorokom Projukti School · অনন্যরকম প্রযুক্তি স্কুল · Student Portal
</footer>
      </main>
    </div>
  );
}

export default App;

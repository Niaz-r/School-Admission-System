
import { useEffect, useState } from "react";
import { getClasses, createClass } from "./api";

function AdminPanel({ onHome }) {
  const [className, setClassName] = useState("");
  const [classShift, setClassShift] = useState("Morning");
  const [totalSeats, setTotalSeats] = useState("");

  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses();
        setClasses(data);
      } catch (error) {
        setAdminError(error.message);
      }
    }

    loadClasses();
  }, []);

  async function handleCreateClass(event) {
    event.preventDefault();

    setAdminMessage("");
    setAdminError("");

    if (
      !className.trim() ||
      !totalSeats ||
      Number(totalSeats) <= 0
    ) {
      setAdminError(
        "Please enter a class name and valid seat number."
      );
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

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>School Admission</h1>
            <p>Administration Panel</p>
          </div>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onHome}
        >
          Home
        </button>
      </header>

      <main className="container">
        <section className="welcome">
          <p className="eyebrow">ADMINISTRATION</p>
          <h2>Admin Dashboard</h2>
          <p>Manage school classes and admission seats.</p>
        </section>

        <section className="panel">
          <h3>Create a Class</h3>
          <p>Set the class name, shift and total seats.</p>

          <form onSubmit={handleCreateClass}>
            <div className="field">
              <label htmlFor="className">Class Name</label>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(event) =>
                  setClassName(event.target.value)
                }
                placeholder="Example: Class 6"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="classShift">Shift</label>
              <select
                id="classShift"
                value={classShift}
                onChange={(event) =>
                  setClassShift(event.target.value)
                }
              >
                <option value="Morning">Morning</option>
                <option value="Day">Day</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="totalSeats">Total Seats</label>
              <input
                id="totalSeats"
                type="number"
                min="1"
                value={totalSeats}
                onChange={(event) =>
                  setTotalSeats(event.target.value)
                }
                placeholder="Example: 50"
                required
              />
            </div>

            {adminError && (
              <p className="error-message">{adminError}</p>
            )}

            {adminMessage && (
              <p className="success-message">{adminMessage}</p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={adminSubmitting}
            >
              {adminSubmitting ? "Creating..." : "Create Class"}
            </button>
          </form>
        </section>

        <section className="panel">
          <h3>Manage Classes</h3>
          <p>View all available admission classes.</p>

          {classes.length === 0 && (
            <p>No classes have been created yet.</p>
          )}

          {classes.length > 0 && (
            <div className="class-list">
              {classes.map((schoolClass) => (
                <div
                  className="class-card"
                  key={schoolClass.id}
                >
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

                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminPanel;

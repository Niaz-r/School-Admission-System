
import { useState } from "react";

function AdminPage({ onBack, onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password === "admin123") {
      setError("");
      onLogin();
    } else {
      setError("Incorrect password. Please try again.");
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>School Admission</h1>
            <p>Admin Access</p>
          </div>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onBack}
        >
          Home
        </button>
      </header>

      <main className="container">
        <section className="panel">
          <h2>Admin Access</h2>
          <p>Enter the admin password to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="adminPassword">Password</label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <p className="error-message">{error}</p>
            )}

            <button type="submit" className="primary-button">
              Open Admin Panel
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdminPage;

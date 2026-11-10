
function HomePage({ onAdmissionClick, onAdminClick }) {
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
          onClick={onAdminClick}
        >
          Admin
        </button>
      </header>

      <main className="container">
        <section className="welcome">
          <p className="eyebrow">WELCOME</p>

          <h2>Welcome to Our School</h2>

          <p>
            Discover our school and begin your admission journey.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={onAdmissionClick}
          >
            Admission
          </button>
        </section>
      </main>
    </div>
  );
}

export default HomePage;

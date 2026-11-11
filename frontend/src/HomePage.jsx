
function HomePage({ onAdmissionClick, onAdminClick }) {
  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">O</div>

          <div>
            <h1>Onnorokom Projukti School</h1>
<p>Online School Admission Portal</p>
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
          <p className="eyebrow">ADMISSION OPEN 2027</p>

<h2>ভর্তি কার্যক্রম চলছে — Admission Open!</h2>

<p>
  Onnorokom Projukti School-এ ভর্তি কার্যক্রম চলছে।
  আজই আপনার সন্তানের Admission Application সম্পন্ন করুন।
</p>

          <button
            type="button"
            className="primary-button"
            onClick={onAdmissionClick}
          >
            ভর্তি আবেদন করুন
          </button>
        </section>

        <section className="school-banner">
  <img
    src="/banner.jpeg"
    alt="Onnorokom Projukti School"
  />
</section>
      </main>
    </div>
  );
}

export default HomePage;

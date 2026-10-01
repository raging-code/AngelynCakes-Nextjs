/* Simple top bar for the /faq page: logo + a clear way back to the main site. */
export default function FaqNav() {
  return (
    <nav className="nav-root" aria-label="Main">
      <div className="nav-inner">
        <a href="/" className="logo-wrap">
          <div className="logo-box">
            <img src="/images/logo-sm.webp" alt="Angelyn's Cakes logo" decoding="async" loading="eager" />
          </div>
          <span className="logo-text">Angelyn's Cakes</span>
        </a>
        <a href="/" className="btn-ghost fq-back">
          <span aria-hidden="true">←</span>
          <span className="fq-long">Back to Angelyn's Cakes</span>
          <span className="fq-short">Back</span>
        </a>
      </div>
    </nav>
  );
}

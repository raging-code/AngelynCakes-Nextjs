import { OCCASIONS, FAQ } from '../lib/seo';

/* Visible, crawlable text that matches what people search for
   ("wedding cakes", "birthday cakes", "debut cakes", "cakes in Manila"...).
   Server component: renders to plain HTML at build time. */
export default function Occasions() {
  return (
    <section className="section" id="occasions" style={{ background: 'var(--bg-alt)' }}>
      <div className="section-inner">
        <h2 className="section-title" style={{ marginBottom: '1.1rem' }}>
          Custom Cakes for<br />
          <em>Every Occasion</em>
        </h2>
        <p className="seo-intro">
          Looking for wedding cakes, birthday cakes, debut cakes or christening cakes in Manila? Angelyn's Cakes designs
          every cake to order, handcrafted for weddings, birthdays, anniversaries, graduations, corporate events and
          private parties across Metro Manila.
        </p>

        <div className="seo-grid">
          {OCCASIONS.map((o) => (
            <article className="seo-card" key={o.title}>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </article>
          ))}
        </div>

        <h2 id="faq" className="seo-faq-title">Frequently asked questions</h2>
        <div className="seo-faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <a href="#contact" className="btn-cta" style={{ fontSize: '0.8rem', padding: '14px 28px', display: 'inline-flex' }}>
            Book a Consultation →
          </a>
        </div>
      </div>
    </section>
  );
}

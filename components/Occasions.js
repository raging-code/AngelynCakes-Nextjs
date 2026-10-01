import { OCCASIONS } from '../lib/seo';

/* Short, crawlable intro on the home page. The full occasions list and the FAQ live on /faq. */
export default function Occasions() {
  return (
    <section className="section" id="occasions" style={{ background: 'var(--bg-alt)' }}>
      <div className="section-inner">
        <h2 className="section-title" style={{ marginBottom: '1.1rem' }}>
          Custom Cakes for<br />
          <em>Every Occasion</em>
        </h2>
        <p className="seo-intro">
          Looking for wedding cakes, birthday cakes, debut cakes or christening cakes in Metro Manila? Angelyn's Cakes
          designs every cake to order, handcrafted for weddings, birthdays, anniversaries, graduations, corporate events
          and private parties in Pasay City, Makati, Manila, Quezon City and across Metro Manila.
        </p>
        <ul className="fq-chips">
          {OCCASIONS.map((o) => (
            <li key={o.title}><a href="/faq#occasions">{o.title}</a></li>
          ))}
        </ul>
        <div style={{ marginTop: '2rem' }}>
          <a href="/faq" className="btn-ghost" style={{ fontSize: '0.78rem' }}>Occasions &amp; FAQ →</a>
        </div>
      </div>
    </section>
  );
}

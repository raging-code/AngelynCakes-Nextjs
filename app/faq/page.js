import FaqNav from '../../components/FaqNav';
import Footer from '../../components/Footer';
import { OCCASIONS, FAQ, METRO_CITIES, FAQ_JSON_LD } from '../../lib/seo';

export const metadata = {
  title: "Custom Cake Occasions & FAQ in Metro Manila | Angelyn's Cakes",
  description:
    "Answers about ordering custom wedding, birthday, debut and christening cakes from Angelyn's Cakes (Angelyn Cakes, Angelyns Cake) in Pasay City. Serving all of Metro Manila.",
  alternates: { canonical: 'https://www.angelynscake.com/faq' },
};

const pad = (i) => (i + 1 < 10 ? '0' : '') + (i + 1);

export default function FaqPage() {
  return (
    <>
      <FaqNav />
      <main className="fq-main">
        <section className="fq-sec" id="occasions">
          <div className="fq-in">
            <span className="fq-eye">Occasions</span>
            <h1 className="fq-title">
              Custom Cakes for<br />
              <em>Every Occasion</em>
            </h1>
            <p className="fq-lead">
              Looking for wedding cakes, birthday cakes, debut cakes or christening cakes in Metro Manila? Angelyn's Cakes
              designs every cake to order, handcrafted for weddings, birthdays, anniversaries, graduations, corporate
              events and private parties.
            </p>

            <div className="fq-list">
              {OCCASIONS.map((o, i) => (
                <article className="fq-row" key={o.title}>
                  <span className="fq-n">{pad(i)}</span>
                  <h2>{o.title}</h2>
                  <p>{o.text}</p>
                  <span className="fq-ar" aria-hidden="true">→</span>
                </article>
              ))}
            </div>

            <div className="fq-areas" id="areas">
              <span className="fq-eye">Where we serve</span>
              <p>Based in Pasay City, creating custom cakes for celebrations across all of Metro Manila.</p>
              <ul className="fq-cities">
                {METRO_CITIES.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="fq-faq" id="faq">
              <div>
                <span className="fq-eye">FAQ</span>
                <h2 className="fq-h2">Frequently asked questions</h2>
                <a href="/#contact" className="btn-cta fq-cta">Book a Consultation</a>
              </div>
              <div>
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="fq-bottom">
              <a href="/" className="btn-ghost">← Back to Angelyn's Cakes</a>
            </div>
          </div>
        </section>
        <Footer />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
    </>
  );
}

export default function About() {
  return (
    <>
      <section className="section" id="about" style={{ "background": "var(--bg)" }}>
        <div className="section-inner">
          <div className="about-layout">
            <div className="about-photo-col">
              <img src="/images/founder.webp" alt="Angelyn, founder and head baker" className="founder-photo" loading="lazy" decoding="async"/>
            </div>
            <div className="about-text-col">
              <span className="section-eyebrow">About Us</span>
              <h2 className="section-title" style={{ "marginBottom": "1.35rem" }}>More Than<br/><em>a Bakery.</em></h2>
              <p style={{ "fontSize": "0.95rem", "fontWeight": "300", "color": "var(--text-mid)", "lineHeight": "1.85", "marginBottom": "1.1rem" }}>Angelyn's story began at just 13 years old, in a small bakery in her hometown province, where she first discovered her love for baking. What started as simple curiosity quickly grew into a true passion for craftsmanship, creativity, and the joy that beautifully made cakes bring to people's lives.</p>
              <p style={{ "fontSize": "0.95rem", "fontWeight": "300", "color": "var(--text-mid)", "lineHeight": "1.85", "marginBottom": "1.1rem" }}>Determined to turn that passion into a lifelong career, she pursued a diploma in HRM and continued honing her skills in the world of baking and hospitality. With hard work, heart, and unwavering dedication, she and her family eventually founded Angelyn's Cake — personally bringing custom creations straight to their clients' homes in the early days of the business.</p>
              <p style={{ "fontSize": "0.95rem", "fontWeight": "300", "color": "var(--text-mid)", "lineHeight": "1.85", "marginBottom": "1.1rem" }}>Committed to continuous growth and innovation, Angelyn and her team regularly travel to the United States and the United Kingdom to attend international cake conventions, specialized trainings, and industry workshops. These experiences allow them to refine their artistry, stay inspired by global trends, and bring world-class techniques back home to their clients.</p>
              <p style={{ "fontSize": "0.95rem", "fontWeight": "300", "color": "var(--text-mid)", "lineHeight": "1.85", "marginBottom": "1.1rem" }}>Over the years, that humble beginning blossomed into something far greater. Today, Angelyn's Cake proudly welcomes clients into its own showroom, creating bespoke cakes for weddings, celebrations, and meaningful occasions across Metro Manila.</p>
              <p style={{ "fontSize": "0.95rem", "fontWeight": "300", "color": "var(--text-mid)", "lineHeight": "1.85", "marginBottom": "1.75rem" }}>Behind every cake is the same warmth and sincerity that started it all — a young girl with a dream, a love for baking, and a desire to make people smile through every handcrafted creation.</p>
              <a href="#contact" className="btn-cta" style={{ "fontSize": "0.8rem", "padding": "14px 28px", "display": "inline-flex" }}>Commission Your Cake →</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import LazyMap from './LazyMap';

export default function Showroom() {
  return (
    <>
      <section className="section" id="showroom" style={{ "background": "var(--bg)" }}>
        <div className="section-inner">
          <div style={{ "marginBottom": "2.75rem" }}>
            <h2 className="section-title">Visit the<br/><em>Showroom</em></h2>
            <p className="showroom-tagline">Come see where every cake begins its story.</p>
          </div>
          <div style={{ "display": "grid", "gridTemplateColumns": "1fr", "gap": "1.5rem" }}>
            <div className="showroom-widget">
              <div className="sw-section">
                <div className="status-open"><span className="status-dot"></span> Open · Makati Studio</div>
                <p style={{ "fontFamily": "'Playfair Display',serif", "fontSize": "1.35rem", "fontWeight": "700", "color": "var(--text)", "marginBottom": "0.25rem" }}>537D Gen J Lacuna</p>
                <p style={{ "fontSize": "0.9rem", "color": "var(--text-mid)", "marginBottom": "0.9rem" }}>Barangay Bangkal, Makati City</p>
                <p style={{ "fontSize": "0.875rem", "color": "var(--text-dim)" }}>🕐 Daily · <strong style={{ "color": "var(--text)" }}>7:30 AM – 6:00 PM</strong></p>
                <a href="https://maps.google.com/?q=537D+Gen+J+Lacuna+Bangkal+Makati" target="_blank" rel="noopener" className="btn-dir">📍 Get Directions ↗</a>
              </div>
              <div className="sw-appt">
                <p style={{ "fontFamily": "'Playfair Display',serif", "fontSize": "1.1rem", "fontWeight": "700", "fontStyle": "italic", "color": "#fff", "marginBottom": "0.4rem" }}>🌸 By Appointment Only</p>
                <p style={{ "fontSize": "0.88rem", "color": "rgba(255,255,255,0.85)", "lineHeight": "1.6", "marginBottom": "1.1rem" }}>We want to give you our full attention. Please call or book ahead so we can prepare an experience just for you — tea, tastings, and all.</p>
                <div style={{ "display": "flex", "flexWrap": "wrap", "gap": "0.65rem" }}>
                  <a href="#contact" className="btn-appt">📅 &nbsp;Book a Visit</a>
                  <a href="viber://chat?number=%2B639178152578" className="btn-appt-viber"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.003 0C5.376 0 0 5.376 0 12.003c0 2.407.715 4.647 1.944 6.524L.671 23.329l4.937-1.577A11.963 11.963 0 0012.003 24C18.627 24 24 18.624 24 12.003 24 5.376 18.627 0 12.003 0zm5.849 16.604c-.236.658-1.38 1.257-1.912 1.338-.488.073-1.107.105-1.787-.112a16.66 16.66 0 01-1.617-.598c-2.847-1.226-4.706-4.064-4.849-4.252-.14-.19-1.145-1.52-1.145-2.903s.666-2.002.965-2.326c.3-.325.65-.406.867-.406.218 0 .434.002.624.01.203.01.473-.077.74.566.278.657.944 2.303.944 2.466 0 .164-.081.366-.163.53-.082.162-.244.406-.407.61-.162.2-.34.415-.18.704.16.29.712 1.173 1.53 1.9 1.052.938 1.94 1.228 2.21 1.362.27.136.427.113.587-.068.162-.181.692-.81.877-1.09.183-.277.365-.23.61-.138.244.091 1.556.734 1.822.869.265.133.44.2.505.31.063.108.063.624-.172 1.283z"/></svg> 0917 815 2578</a>
                  <a href="tel:+639178152578" className="btn-appt">📱 &nbsp;0917 815 2578</a>
                </div>
              </div>
              <div className="sw-notice">
                <span style={{ "fontSize": "0.9rem", "flexShrink": "0", "marginTop": "1px" }}>ℹ️</span>
                <p style={{ "fontSize": "0.8rem", "color": "var(--text-dim)", "lineHeight": "1.6" }}>Pasay showroom (60 Russel Ave) is temporarily closed for renovations.</p>
              </div>
            </div>
            <LazyMap />
          </div>
        </div>
      </section>
    </>
  );
}

export default function Footer() {
  return (
    <>
      <footer className="footer-root">
        <div className="footer-inner">
          <div style={{ "display": "flex", "flexDirection": "column", "gap": "2rem", "alignItems": "flex-start" }}>
            <div><p className="footer-logo">Angelyn<em>'s</em> Cakes</p><p style={{ "fontFamily": "'Playfair Display',serif", "fontStyle": "italic", "fontSize": "0.9rem", "color": "rgba(255,255,255,0.35)", "marginTop": "0.35rem" }}>Baking joy, elegantly.</p></div>
            <div style={{ "display": "flex", "gap": "0.65rem" }}>
              <a href="https://www.instagram.com/angelynscakes" target="_blank" rel="noopener" className="footer-social" aria-label="Instagram"><svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path fill="none" stroke="currentColor" strokeWidth="1.5" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/></svg></a>
              <a href="https://www.facebook.com/angelynscakes" target="_blank" rel="noopener" className="footer-social" aria-label="Facebook"><svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="viber://chat?number=%2B639178152578" className="footer-social" aria-label="Viber" style={{ "background": "rgba(158,74,94,0.15)", "borderColor": "rgba(158,74,94,0.35)", "color": "#C27585" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.003 0C5.376 0 0 5.376 0 12.003c0 2.407.715 4.647 1.944 6.524L.671 23.329l4.937-1.577A11.963 11.963 0 0012.003 24C18.627 24 24 18.624 24 12.003 24 5.376 18.627 0 12.003 0zm5.849 16.604c-.236.658-1.38 1.257-1.912 1.338-.488.073-1.107.105-1.787-.112a16.66 16.66 0 01-1.617-.598c-2.847-1.226-4.706-4.064-4.849-4.252-.14-.19-1.145-1.52-1.145-2.903s.666-2.002.965-2.326c.3-.325.65-.406.867-.406.218 0 .434.002.624.01.203.01.473-.077.74.566.278.657.944 2.303.944 2.466 0 .164-.081.366-.163.53-.082.162-.244.406-.407.61-.162.2-.34.415-.18.704.16.29.712 1.173 1.53 1.9 1.052.938 1.94 1.228 2.21 1.362.27.136.427.113.587-.068.162-.181.692-.81.877-1.09.183-.277.365-.23.61-.138.244.091 1.556.734 1.822.869.265.133.44.2.505.31.063.108.063.624-.172 1.283z"/></svg></a>
            </div>
            <div style={{ "display": "flex", "flexDirection": "column", "gap": "0.45rem" }}>
              <p style={{ "fontSize": "0.85rem", "color": "rgba(255,255,255,0.38)" }}>60 Russel Ave, Brgy. San Rafael, Pasay City</p>
              <p style={{ "fontSize": "0.85rem", "color": "rgba(255,255,255,0.38)" }}><a href="mailto:contact.angelynscakes@gmail.com" style={{ "color": "rgba(255,255,255,0.38)", "textDecoration": "none" }}>contact.angelynscakes@gmail.com</a></p>
              <p style={{ "fontSize": "0.85rem", "color": "rgba(255,255,255,0.38)" }}><a href="tel:+63285244452" style={{ "color": "rgba(255,255,255,0.38)", "textDecoration": "none" }}>(02) 8524 4452</a> · <a href="tel:+639178152578" style={{ "color": "rgba(255,255,255,0.38)", "textDecoration": "none" }}>0917 815 2578</a> · <a href="viber://chat?number=%2B639178152578" style={{ "color": "rgba(194,117,133,0.7)", "textDecoration": "none" }}>Viber</a></p>
              <p style={{ "fontSize": "0.85rem", "color": "rgba(255,255,255,0.38)" }}>Daily · 7:30 AM – 6:00 PM · By Appointment</p>
            </div>
          </div>
          <div style={{ "borderTop": "1px solid rgba(255,255,255,0.07)", "marginTop": "2.75rem", "paddingTop": "1.35rem" }}>
            <p style={{ "fontSize": "0.72rem", "color": "rgba(255,255,255,0.22)", "letterSpacing": "0.12em" }}>© 2025 Angelyn's Cakes. All rights reserved. · Manila, Philippines</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export const metadata = {
  title: "Page not found | Angelyn's Cakes",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--bg)',
      }}
    >
      <h1 className="section-title">
        Page not<br />
        <em>found</em>
      </h1>
      <p style={{ margin: '1.25rem 0 2rem', color: 'var(--text-mid)', maxWidth: '28rem', lineHeight: 1.7 }}>
        Sorry, we couldn't find that page. You can browse our custom wedding, birthday and celebration cakes on the home page.
      </p>
      <a href="/" className="btn-cta" style={{ fontSize: '0.8rem', padding: '14px 28px' }}>
        Back to Angelyn's Cakes
      </a>
    </main>
  );
}

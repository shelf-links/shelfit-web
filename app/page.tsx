export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#ECEEE8',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 800,
          color: '#181C14',
          marginBottom: '0.5rem',
        }}
      >
        shelf<span style={{ color: '#3A86FF' }}>It</span>
      </h1>

      <p
        style={{
          fontSize: '1.25rem',
          color: '#181C14',
          maxWidth: '480px',
          marginBottom: '2rem',
          lineHeight: 1.5,
        }}
      >
        Save any link. Get an instant summary. Find it again in seconds —
        no more scrolling through a mess of saved posts and bookmarks.
      </p>

      <a
        href="https://apps.apple.com/app/id6788626232"
        style={{
          backgroundColor: '#181C14',
          color: '#FFFFFF',
          padding: '0.9rem 2rem',
          borderRadius: '999px',
          fontSize: '1.1rem',
          fontWeight: 700,
          textDecoration: 'none',
          marginBottom: '3rem',
        }}
      >
        Download on the App Store
      </a>

      <footer
        style={{
          fontSize: '0.85rem',
          color: '#888C84',
          maxWidth: '480px',
          lineHeight: 1.6,
        }}
      >
        ShelfIt is operated by AYCULTOR LTD.
      </footer>
    </main>
  );
}

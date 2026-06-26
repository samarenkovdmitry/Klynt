export default function Home() {
  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "sans-serif",
      background: "#F0EDE6",
      color: "#1a1a1a",
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>klynt.one</h1>
      <p style={{ color: "#666" }}>Something good is coming. Back soon.</p>
    </main>
  );
}

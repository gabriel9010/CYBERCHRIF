export default function Footer() {
  return (
    <footer className="py-10 text-center text-cyan-200/60">
      <div className="container mx-auto px-6">
        <p className="font-mono text-xs">Â© {new Date().getFullYear()} chrif â€” Cyberpunk Edition</p>
      </div>
    </footer>
  );
}
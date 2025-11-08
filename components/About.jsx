export default function About() {
  return (
    <div className="neon-border rounded-xl p-8 bg-black/20">
      <h2 className="font-display text-3xl mb-4">Chi sono</h2>
      <p className="text-cyan-100/80">
        Sono <span className="text-neon-cyan">chrif</span>, dev <span className="text-neon-cyan">Node.js</span> & <span className="text-neon-pink">React</span>.
        Mi occupo di UX, performance e architetture pulite end-to-end.
      </p>
      <ul className="mt-6 font-mono text-sm grid sm:grid-cols-2 gap-2 text-cyan-200/90">
        <li>âœ… Next.js / React</li>
        <li>âœ… Node.js / Fastify</li>
        <li>âœ… Tailwind / Animazioni</li>
        <li>âœ… Testing / CI / DevOps</li>
      </ul>
    </div>
  );
}
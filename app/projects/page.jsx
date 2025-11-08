// app/projects/page.jsx
import { db } from "../../lib/db";
import Projects from "../../components/Projects";
import Reveal from "../../components/Reveal";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const all = await db.all(); // server-side
  return (
    <div className="container mx-auto px-4 sm:px-6 py-24 sm:py-28">
      <Reveal>
        <Projects title="Tutti i progetti" showCTA={false} initialProjects={all} />
      </Reveal>
    </div>
  );
}

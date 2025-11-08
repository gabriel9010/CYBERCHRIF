// lib/db.js
import path from "path";
import fs from "fs";

const mode = process.env.LIBSQL_URL ? "libsql" : "sqlite";
let client;

// Inizializzazione asincrona unica
const ready = (async () => {
  if (mode === "sqlite") {
    // import dinamico compatibile ESM
    const { default: Database } = await import("better-sqlite3");
    const DB_PATH = path.join(process.cwd(), "db", "projects.db");
    const DIR = path.dirname(DB_PATH);
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");

    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT NOT NULL,
        accent TEXT NOT NULL,
        repo TEXT,
        demo TEXT,
        icon TEXT DEFAULT 'globe',
        image TEXT DEFAULT ''
      );
    `);

    const count = db.prepare("SELECT COUNT(*) AS c FROM projects").get().c;
    if (count === 0) {
      const seed = db.prepare(`INSERT INTO projects (slug,title,description,tags,accent,repo,demo,icon,image)
        VALUES (@slug,@title,@description,@tags,@accent,@repo,@demo,@icon,@image)`);
      [
        {
          slug: "api-gateway",
          title: "API Gateway",
          description: "Reverse proxy Node.js con rate limit, cache e JWT.",
          tags: ["Node.js", "Fastify", "Redis", "JWT"],
          accent: "#00f6ff",
          repo: "https://github.com/chrif/api-gateway",
          demo: "",
          icon: "shield",
          image: ""
        },
        {
          slug: "realtime-dashboard",
          title: "Realtime Dashboard",
          description: "Dashboard realtime con websockets e grafici.",
          tags: ["Next.js", "Socket.io", "Tailwind"],
          accent: "#ff00e1",
          repo: "https://github.com/chrif/realtime-dashboard",
          demo: "",
          icon: "cpu",
          image: ""
        }
      ].forEach(p => seed.run({ ...p, tags: JSON.stringify(p.tags) }));
    }

    client = db;
  } else {
    // LibSQL (Turso)
    const { createClient } = await import("@libsql/client");
    const c = createClient({
      url: process.env.LIBSQL_URL,
      authToken: process.env.LIBSQL_AUTH_TOKEN
    });

    await c.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT NOT NULL,
        accent TEXT NOT NULL,
        repo TEXT,
        demo TEXT,
        icon TEXT DEFAULT 'globe',
        image TEXT DEFAULT ''
      );
    `);

    client = c;
  }
})();

export const db = {
  mode,
  async all() {
    await ready;
    if (mode === "sqlite") {
      const rows = client.prepare("SELECT * FROM projects ORDER BY id DESC").all();
      return rows.map(r => ({ ...r, tags: JSON.parse(r.tags) }));
    } else {
      const { rows } = await client.execute("SELECT * FROM projects ORDER BY id DESC");
      return rows.map(r => ({ ...r, id: Number(r.id), tags: JSON.parse(r.tags) }));
    }
  },
  async insert(p) {
    await ready;
    if (mode === "sqlite") {
      client.prepare(
        `INSERT INTO projects (slug,title,description,tags,accent,repo,demo,icon,image)
         VALUES (@slug,@title,@description,@tags,@accent,@repo,@demo,@icon,@image)`
      ).run({ ...p, tags: JSON.stringify(p.tags ?? []) });
    } else {
      await client.execute({
        sql: `INSERT INTO projects (slug,title,description,tags,accent,repo,demo,icon,image)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.slug,
          p.title,
          p.description,
          JSON.stringify(p.tags ?? []),
          p.accent,
          p.repo ?? "",
          p.demo ?? "",
          p.icon ?? "globe",
          p.image ?? ""
        ]
      });
    }
  },
  async update(id, fields) {
    await ready;
    const sets = [];
    const vals = [];
    for (const [k, v] of Object.entries(fields)) {
      if (k === "tags") {
        sets.push("tags=?");
        vals.push(JSON.stringify(v));
      } else {
        sets.push(`${k}=?`);
        vals.push(v);
      }
    }
    if (!sets.length) return;

    if (mode === "sqlite") {
      vals.push(id);
      client.prepare(`UPDATE projects SET ${sets.join(",")} WHERE id=?`).run(...vals);
    } else {
      vals.push(id);
      await client.execute({ sql: `UPDATE projects SET ${sets.join(",")} WHERE id=?`, args: vals });
    }
  },
  async delete(id) {
    await ready;
    if (mode === "sqlite") {
      client.prepare("DELETE FROM projects WHERE id=?").run(id);
    } else {
      await client.execute({ sql: "DELETE FROM projects WHERE id=?", args: [id] });
    }
  }
};

export const dbMode = mode;

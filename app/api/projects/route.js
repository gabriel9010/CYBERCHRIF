import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { z } from "zod";
import { cookies } from "next/headers";

const schema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(2),
  tags: z.array(z.string()).default([]),
  accent: z.string().default("#00f6ff"),
  repo: z.string().url().optional().or(z.literal("")),
  demo: z.string().url().optional().or(z.literal("")),
  icon: z.string().default("globe"),
  image: z.string().optional().default("")
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const rows = await db.all();
  return NextResponse.json({ projects: rows });
}

export async function POST(req) {
  const isAdmin = cookies().get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    await db.insert(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
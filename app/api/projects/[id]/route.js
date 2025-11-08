import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { z } from "zod";
import { cookies } from "next/headers";

const schema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(2).optional(),
  tags: z.array(z.string()).optional(),
  accent: z.string().optional(),
  repo: z.string().url().optional().or(z.literal("")),
  demo: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional(),
  image: z.string().optional()
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(_req, { params }) {
  if (cookies().get("admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.delete(params.id);
  return NextResponse.json({ ok: true });
}

export async function PUT(req, { params }) {
  if (cookies().get("admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await db.update(params.id, parsed.data);
  return NextResponse.json({ ok: true });
}
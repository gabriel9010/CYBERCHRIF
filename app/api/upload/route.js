import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs";
export const runtime = "nodejs";

export async function POST(req) {
  if (cookies().get("admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (file.name?.split(".").pop() || "png").toLowerCase();
  const name = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buf);
  return NextResponse.json({ url: `/uploads/${name}` });
}
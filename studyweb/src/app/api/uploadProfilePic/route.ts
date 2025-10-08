import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { v } from "convex/values";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const uploadUrl = await convex.storage.createUploadUrl();
  const res = await fetch(uploadUrl, {
    method: "POST",
    body: file,
  });
  const { storageId } = await res.json();

  return NextResponse.json({ storageId });
}

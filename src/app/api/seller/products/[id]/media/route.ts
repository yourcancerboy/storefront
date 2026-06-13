/**
 * Product media upload endpoint.
 * Uploads image/video files to Supabase Storage bucket "product-media".
 *
 * Supabase Storage setup required (one-time):
 * 1. Go to Supabase Dashboard → Storage
 * 2. Create a new bucket named "product-media"
 * 3. Set it to PUBLIC
 * 4. Under Policies, allow public read (SELECT) and authenticated insert (INSERT)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const MAX_FILES = 7;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Check existing media count
  const existingCount = await prisma.productImage.count({ where: { productId } });
  if (existingCount + files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_FILES} file per produk. Saat ini sudah ada ${existingCount}.` },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();
  const uploaded: { url: string; type: "IMAGE" | "VIDEO"; name: string }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      errors.push(`${file.name}: tipe file tidak didukung`);
      continue;
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      errors.push(`${file.name}: ukuran melebihi ${isVideo ? "50MB" : "5MB"}`);
      continue;
    }

    const ext = file.name.split(".").pop();
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("product-media")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-media")
      .getPublicUrl(fileName);

    uploaded.push({ url: publicUrl, type: isVideo ? "VIDEO" : "IMAGE", name: file.name });
  }

  if (uploaded.length > 0) {
    const currentMax = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const startOrder = (currentMax?.sortOrder ?? -1) + 1;

    await prisma.productImage.createMany({
      data: uploaded.map((f, i) => ({
        productId,
        url: f.url,
        altText: f.name,
        type: f.type,
        sortOrder: startOrder + i,
      })),
    });
  }

  return NextResponse.json({
    uploaded: uploaded.length,
    errors,
    files: uploaded,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const { imageId } = await req.json();

  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from Supabase Storage
  try {
    const supabase = getAdminClient();
    const path = image.url.split("/product-media/")[1];
    if (path) {
      await supabase.storage.from("product-media").remove([path]);
    }
  } catch {}

  await prisma.productImage.delete({ where: { id: imageId } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const { order } = await req.json(); // array of { id, sortOrder }

  await prisma.$transaction(
    order.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
      prisma.productImage.updateMany({
        where: { id, productId },
        data: { sortOrder },
      })
    )
  );

  return NextResponse.json({ success: true });
}

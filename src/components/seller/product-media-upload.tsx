"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Play, ImageIcon, AlertCircle, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type MediaFile = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  altText?: string | null;
  sortOrder: number;
};

interface ProductMediaUploadProps {
  productId: string;
  initialMedia?: MediaFile[];
  onChange?: (media: MediaFile[]) => void;
}

const MAX_FILES = 7;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm";

export function ProductMediaUpload({ productId, initialMedia = [], onChange }: ProductMediaUploadProps) {
  const [media, setMedia] = useState<MediaFile[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAddMore = media.length < MAX_FILES;

  const upload = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch(`/api/seller/products/${productId}/media`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.errors?.length) {
      setError(data.errors.join(" | "));
    }

    if (data.files?.length) {
      const newMedia = [
        ...media,
        ...data.files.map((f: any, i: number) => ({
          id: `new-${Date.now()}-${i}`,
          url: f.url,
          type: f.type,
          sortOrder: media.length + i,
        })),
      ];
      setMedia(newMedia);
      onChange?.(newMedia);
    }

    setUploading(false);
  }, [productId, media, onChange]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, MAX_FILES - media.length);
    upload(arr);
  };

  const removeMedia = async (item: MediaFile) => {
    try {
      await fetch(`/api/seller/products/${productId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: item.id }),
      });
    } catch {}
    const updated = media.filter((m) => m.id !== item.id);
    setMedia(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? "border-foreground bg-muted" : "border-border hover:border-foreground/50 hover:bg-muted/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Mengupload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drag & drop atau klik untuk upload</p>
              <p className="text-xs text-muted-foreground">
                Gambar: JPG, PNG, WebP, GIF (maks 5MB) · Video: MP4, MOV, WebM (maks 50MB)
              </p>
              <p className="text-xs text-muted-foreground">
                {media.length}/{MAX_FILES} file · Sisa {MAX_FILES - media.length} slot
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((item, idx) => (
            <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border">
              {item.type === "VIDEO" ? (
                <div className="w-full h-full flex items-center justify-center bg-black/80">
                  <video src={item.url} className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">Video</Badge>
                </div>
              ) : (
                <img src={item.url} alt={item.altText || ""} className="w-full h-full object-cover" />
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-2">
                <span className="text-white text-xs font-medium bg-black/50 rounded px-1.5 py-0.5">
                  {idx === 0 ? "Cover" : `#${idx + 1}`}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeMedia(item); }}
                  className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {canAddMore && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-foreground/50 hover:bg-muted/50 transition-colors"
            >
              <div className="text-center">
                <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">Tambah</span>
              </div>
            </button>
          )}
        </div>
      )}

      {!canAddMore && (
        <p className="text-xs text-muted-foreground text-center">
          Batas maksimal {MAX_FILES} file tercapai. Hapus salah satu untuk menambahkan yang baru.
        </p>
      )}
    </div>
  );
}

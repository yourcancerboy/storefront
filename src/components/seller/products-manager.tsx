import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Pencil, Eye, ToggleLeft } from "lucide-react";

export async function ProductsManager() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      include: {
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch {}

  const STATUS_LABELS = { DRAFT: "Draft", ACTIVE: "Aktif", ARCHIVED: "Arsip" };
  const STATUS_VARIANTS: Record<string, "secondary" | "success" | "outline"> = {
    DRAFT: "secondary", ACTIVE: "success", ARCHIVED: "outline",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-sm text-muted-foreground">{products.length} total produk</p>
        </div>
        <Button asChild>
          <Link href="/seller/products/new"><Plus className="h-4 w-4 mr-2" />Tambah Produk</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Terjual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Belum ada produk. <Link href="/seller/products/new" className="underline">Tambah sekarang</Link>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const minPrice = product.variants[0]?.price;
                const totalStock = product.variants.reduce((s: number, v: any) => s + v.stock, 0);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {product.images[0] && (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.variants.length} varian</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.category?.name || "-"}</TableCell>
                    <TableCell className="text-sm font-medium">{minPrice ? formatCurrency(minPrice) : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={totalStock === 0 ? "destructive" : totalStock <= 5 ? "warning" : "secondary"}>
                        {totalStock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{product._count.orderItems}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[product.status as keyof typeof STATUS_VARIANTS]}>{STATUS_LABELS[product.status as keyof typeof STATUS_LABELS]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/shop/${product.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/seller/products/${product.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

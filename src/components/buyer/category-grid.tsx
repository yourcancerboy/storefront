import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold mb-8">Kategori</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:border-foreground transition-colors"
          >
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-cover rounded-lg" />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-lg" />
            )}
            <span className="text-sm font-medium text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

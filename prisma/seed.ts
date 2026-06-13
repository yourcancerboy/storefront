import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "tops" },
      update: {},
      create: { name: "Atasan", nameEn: "Tops", slug: "tops", sortOrder: 1, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: "bottoms" },
      update: {},
      create: { name: "Bawahan", nameEn: "Bottoms", slug: "bottoms", sortOrder: 2, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: "dresses" },
      update: {},
      create: { name: "Dress", nameEn: "Dresses", slug: "dresses", sortOrder: 3, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: "outerwear" },
      update: {},
      create: { name: "Outer", nameEn: "Outerwear", slug: "outerwear", sortOrder: 4, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: { name: "Aksesori", nameEn: "Accessories", slug: "accessories", sortOrder: 5, isActive: true },
    }),
  ]);

  console.log(`✅ ${categories.length} categories created`);

  // Products
  const productData = [
    {
      name: "Classic White Tee",
      slug: "classic-white-tee",
      description: "Kaos putih klasik berbahan katun premium 100%. Nyaman dipakai sehari-hari dan mudah dipadukan dengan berbagai outfit.",
      categorySlug: "tops",
      isFeatured: true,
      tags: ["casual", "basic", "cotton"],
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      variants: [
        { size: "S", price: 18900000, stock: 15, color: "Putih" },
        { size: "M", price: 18900000, stock: 22, color: "Putih" },
        { size: "L", price: 18900000, stock: 18, color: "Putih" },
        { size: "XL", price: 18900000, stock: 10, color: "Putih" },
      ],
    },
    {
      name: "Linen Relaxed Shirt",
      slug: "linen-relaxed-shirt",
      description: "Kemeja linen relaxed fit dengan tekstur alami. Cocok untuk tampilan kasual maupun semi-formal.",
      categorySlug: "tops",
      isFeatured: true,
      tags: ["linen", "shirt", "casual"],
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      variants: [
        { size: "S", price: 32900000, comparePrice: 38900000, stock: 8, color: "Krem" },
        { size: "M", price: 32900000, comparePrice: 38900000, stock: 14, color: "Krem" },
        { size: "L", price: 32900000, comparePrice: 38900000, stock: 11, color: "Krem" },
      ],
    },
    {
      name: "Wide Leg Trousers",
      slug: "wide-leg-trousers",
      description: "Celana panjang wide leg dengan potongan modern. Bahan berkualitas tinggi yang jatuh sempurna.",
      categorySlug: "bottoms",
      isFeatured: true,
      tags: ["trousers", "wide-leg", "formal"],
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4b0afd?w=600&q=80",
      variants: [
        { size: "S", price: 42900000, stock: 6, color: "Hitam" },
        { size: "M", price: 42900000, stock: 9, color: "Hitam" },
        { size: "L", price: 42900000, stock: 7, color: "Hitam" },
        { size: "S", price: 42900000, stock: 5, color: "Krem" },
        { size: "M", price: 42900000, stock: 8, color: "Krem" },
      ],
    },
    {
      name: "Midi Slip Dress",
      slug: "midi-slip-dress",
      description: "Slip dress midi dengan bahan satin halus. Tampil elegan dan feminin untuk berbagai kesempatan.",
      categorySlug: "dresses",
      isFeatured: true,
      tags: ["dress", "satin", "elegant"],
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
      variants: [
        { size: "S", price: 55900000, comparePrice: 65900000, stock: 5, color: "Hitam" },
        { size: "M", price: 55900000, comparePrice: 65900000, stock: 7, color: "Hitam" },
        { size: "L", price: 55900000, comparePrice: 65900000, stock: 4, color: "Hitam" },
        { size: "S", price: 55900000, comparePrice: 65900000, stock: 3, color: "Mauve" },
        { size: "M", price: 55900000, comparePrice: 65900000, stock: 6, color: "Mauve" },
      ],
    },
    {
      name: "Oversized Blazer",
      slug: "oversized-blazer",
      description: "Blazer oversized dengan struktur yang sempurna. Padukan dengan dress atau celana untuk tampilan profesional.",
      categorySlug: "outerwear",
      isFeatured: false,
      tags: ["blazer", "formal", "oversized"],
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
      variants: [
        { size: "S", price: 72900000, stock: 4, color: "Abu-abu" },
        { size: "M", price: 72900000, stock: 6, color: "Abu-abu" },
        { size: "L", price: 72900000, stock: 3, color: "Abu-abu" },
      ],
    },
    {
      name: "Knit Cardigan",
      slug: "knit-cardigan",
      description: "Kardigan rajut lembut dengan potongan relaxed. Sempurna untuk layering di hari yang sejuk.",
      categorySlug: "outerwear",
      isFeatured: true,
      tags: ["knit", "cardigan", "cozy"],
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
      variants: [
        { size: "S", price: 38900000, stock: 10, color: "Cream" },
        { size: "M", price: 38900000, stock: 15, color: "Cream" },
        { size: "L", price: 38900000, stock: 8, color: "Cream" },
        { size: "S", price: 38900000, stock: 7, color: "Coklat" },
        { size: "M", price: 38900000, stock: 9, color: "Coklat" },
      ],
    },
    {
      name: "Mini Skirt",
      slug: "mini-skirt",
      description: "Mini skirt dengan potongan A-line yang flattering. Pilihan warna yang versatile untuk berbagai gaya.",
      categorySlug: "bottoms",
      isFeatured: false,
      tags: ["skirt", "mini", "casual"],
      image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80",
      variants: [
        { size: "S", price: 28900000, stock: 12, color: "Hitam" },
        { size: "M", price: 28900000, stock: 16, color: "Hitam" },
        { size: "L", price: 28900000, stock: 9, color: "Hitam" },
      ],
    },
    {
      name: "Wrap Midi Dress",
      slug: "wrap-midi-dress",
      description: "Wrap dress dengan siluet yang mempertegas lekuk tubuh. Bahan rayon premium yang nyaman dan jatuh sempurna.",
      categorySlug: "dresses",
      isFeatured: false,
      tags: ["dress", "wrap", "rayon"],
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
      variants: [
        { size: "S", price: 48900000, stock: 6, color: "Floral" },
        { size: "M", price: 48900000, stock: 9, color: "Floral" },
        { size: "L", price: 48900000, stock: 5, color: "Floral" },
      ],
    },
  ];

  for (const p of productData) {
    const cat = categories.find((c) => c.slug === p.categorySlug);
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: cat?.id,
        status: "ACTIVE",
        isFeatured: p.isFeatured,
        tags: p.tags,
        images: {
          create: [{ url: p.image, altText: p.name, sortOrder: 0 }],
        },
        variants: {
          create: p.variants.map((v, i) => ({
            sku: `${p.slug}-${v.size}-${v.color}-${i}`.toUpperCase().replace(/\s+/g, "-"),
            name: `${v.size} / ${v.color}`,
            price: v.price,
            comparePrice: (v as any).comparePrice || null,
            stock: v.stock,
            size: v.size,
            color: v.color,
            weight: 300,
            isActive: true,
          })),
        },
      },
    });
    console.log(`  ✅ ${product.name}`);
  }

  // Bank accounts
  await prisma.bankAccount.upsert({
    where: { id: "seed-bank-1" },
    update: {},
    create: {
      id: "seed-bank-1",
      bankName: "BCA",
      accountNumber: "1234567890",
      accountName: "STOREFRONT",
      isActive: true,
      sortOrder: 0,
    },
  });

  await prisma.bankAccount.upsert({
    where: { id: "seed-bank-2" },
    update: {},
    create: {
      id: "seed-bank-2",
      bankName: "Mandiri",
      accountNumber: "0987654321",
      accountName: "STOREFRONT",
      isActive: true,
      sortOrder: 1,
    },
  });

  // Store settings
  const settings = [
    { key: "storeName", value: "STOREFRONT" },
    { key: "storeDescription", value: "Fashion pilihan berkualitas premium" },
    { key: "storePhone", value: "+62 812 3456 7890" },
    { key: "storeEmail", value: "hello@storefront.id" },
  ];

  for (const s of settings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // Active promotion
  await prisma.promotion.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      name: "Welcome Discount",
      description: "Diskon 10% untuk pembelian pertama",
      code: "WELCOME10",
      type: "PERCENTAGE",
      scope: "ALL_PRODUCTS",
      discountValue: 10,
      minimumOrder: 20000000,
      isActive: true,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Bank accounts, settings, and promotion created");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

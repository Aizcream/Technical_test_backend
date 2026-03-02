import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.transactionItem.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();

  // ─── RELOJES ──────────────────────────────────────────
  const reloj1 = await prisma.product.create({
    data: {
      name: 'Casio G-Shock GA-2100',
      price: 389000,
      stock: 15,
      description:
        'Reloj resistente a golpes con diseño octagonal, resistente al agua 200m. Ideal para aventura y uso diario.',
      imageUrl:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      category: 'relojes',
      isActive: true,
      variants: {
        create: [
          { label: 'Color', value: 'Negro' },
          { label: 'Color', value: 'Verde Militar' },
          { label: 'Color', value: 'Azul Marino' },
        ],
      },
    },
  });

  const reloj2 = await prisma.product.create({
    data: {
      name: 'Tissot PRX Powermatic 80',
      price: 2850000,
      stock: 8,
      description:
        'Reloj automático suizo con cristal de zafiro, reserva de marcha de 80 horas y brazalete integrado de acero.',
      imageUrl:
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
      category: 'relojes',
      isActive: true,
      variants: {
        create: [
          { label: 'Color', value: 'Plateado' },
          { label: 'Color', value: 'Dorado Rosa' },
          { label: 'Color', value: 'Negro' },
        ],
      },
    },
  });

  const reloj3 = await prisma.product.create({
    data: {
      name: 'Fossil Gen 6 Smartwatch',
      price: 1150000,
      stock: 12,
      description:
        'Smartwatch con Wear OS, monitoreo de frecuencia cardíaca, GPS integrado y carga rápida.',
      imageUrl:
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',
      category: 'relojes',
      isActive: true,
      variants: {
        create: [
          { label: 'Color', value: 'Negro' },
          { label: 'Color', value: 'Plateado' },
        ],
      },
    },
  });

  // ─── PERFUMES ─────────────────────────────────────────
  const perfume1 = await prisma.product.create({
    data: {
      name: 'Dior Sauvage',
      price: 520000,
      stock: 20,
      description:
        'Fragancia masculina amaderada y especiada con notas de bergamota de Calabria y Ambroxan.',
      imageUrl:
        'https://images.unsplash.com/photo-1594035910387-fea081ae7aee?w=600',
      category: 'perfumes',
      isActive: true,
      variants: {
        create: [
          { label: 'Concentración', value: 'Eau de Toilette' },
          { label: 'Concentración', value: 'Eau de Parfum' },
          { label: 'Concentración', value: 'Parfum' },
          { label: 'Concentración', value: 'Elixir' },
        ],
      },
    },
  });

  const perfume2 = await prisma.product.create({
    data: {
      name: 'Chanel Nº5',
      price: 680000,
      stock: 10,
      description:
        'Icónica fragancia femenina floral-aldehydica con notas de ylang-ylang, rosa de mayo y jazmín.',
      imageUrl:
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
      category: 'perfumes',
      isActive: true,
      variants: {
        create: [
          { label: 'Concentración', value: 'Eau de Toilette' },
          { label: 'Concentración', value: 'Eau de Parfum' },
          { label: 'Concentración', value: 'Parfum' },
        ],
      },
    },
  });

  const perfume3 = await prisma.product.create({
    data: {
      name: 'Tom Ford Tobacco Vanille',
      price: 1250000,
      stock: 6,
      description:
        'Fragancia unisex oriental especiada con notas de tabaco, vainilla, cacao y frutas secas.',
      imageUrl:
        'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600',
      category: 'perfumes',
      isActive: true,
      variants: {
        create: [
          { label: 'Concentración', value: 'Eau de Parfum' },
          { label: 'Concentración', value: 'Parfum' },
        ],
      },
    },
  });

  // ─── ZAPATOS ──────────────────────────────────────────
  const zapato1 = await prisma.product.create({
    data: {
      name: 'Nike Air Max 90',
      price: 549000,
      stock: 25,
      description:
        'Zapatillas icónicas con unidad Air Max visible, amortiguación legendaria y estilo urbano atemporal.',
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      category: 'zapatos',
      isActive: true,
      variants: {
        create: [
          { label: 'Talla', value: '6' },
          { label: 'Talla', value: '7' },
          { label: 'Talla', value: '8' },
          { label: 'Talla', value: '9' },
          { label: 'Talla', value: '10' },
          { label: 'Talla', value: '11' },
          { label: 'Color', value: 'Blanco/Rojo' },
          { label: 'Color', value: 'Negro' },
          { label: 'Color', value: 'Gris' },
        ],
      },
    },
  });

  const zapato2 = await prisma.product.create({
    data: {
      name: 'Adidas Samba OG',
      price: 459000,
      stock: 18,
      description:
        'Zapatillas clásicas de fútbol sala convertidas en ícono de moda urbana, con suela de goma y puntera en T.',
      imageUrl:
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
      category: 'zapatos',
      isActive: true,
      variants: {
        create: [
          { label: 'Talla', value: '6' },
          { label: 'Talla', value: '7' },
          { label: 'Talla', value: '8' },
          { label: 'Talla', value: '9' },
          { label: 'Talla', value: '10' },
          { label: 'Talla', value: '11' },
          { label: 'Color', value: 'Blanco/Negro' },
          { label: 'Color', value: 'Negro/Blanco' },
          { label: 'Color', value: 'Verde' },
        ],
      },
    },
  });

  const zapato3 = await prisma.product.create({
    data: {
      name: 'New Balance 550',
      price: 520000,
      stock: 14,
      description:
        'Zapatillas retro de baloncesto con diseño limpio y perforación en la parte lateral. Estilo hype vintage.',
      imageUrl:
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
      category: 'zapatos',
      isActive: true,
      variants: {
        create: [
          { label: 'Talla', value: '7' },
          { label: 'Talla', value: '8' },
          { label: 'Talla', value: '9' },
          { label: 'Talla', value: '10' },
          { label: 'Talla', value: '11' },
          { label: 'Color', value: 'Blanco/Verde' },
          { label: 'Color', value: 'Blanco/Rojo' },
          { label: 'Color', value: 'Blanco/Azul' },
        ],
      },
    },
  });

  console.log('✅ Seed completed! Created:');
  console.log('   - 3 Relojes');
  console.log('   - 3 Perfumes');
  console.log('   - 3 Zapatos');
  console.log(
    '   - With their respective variants (Talla, Color, Concentración)',
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

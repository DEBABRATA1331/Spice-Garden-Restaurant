// Quick one-time seed using the Neon DB connection
// Run with: node frontend/prisma/seed-quick.mjs
// DATABASE_URL must be set

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Neon database...');

    const restaurant = await prisma.restaurant.upsert({
        where: { slug: 'demo' },
        update: {},
        create: {
            name: 'Spice Garden Restaurant',
            slug: 'demo',
            description: 'Authentic Indian cuisine with a modern twist.',
            address: '123 MG Road, Bangalore, Karnataka 560001',
            phone: '+91 98765 43210',
            email: 'info@spicegarden.com',
        }
    });
    console.log('✅ Restaurant:', restaurant.name);

    await prisma.restaurantSettings.upsert({
        where: { restaurantId: restaurant.id },
        update: {},
        create: { restaurantId: restaurant.id, taxPercent: 5, loyaltyEnabled: true, pointsPerRupee: 0.1, pointsValue: 0.01 }
    });

    const adminPwd = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.upsert({
        where: { email: 'admin@spicegarden.com' },
        update: { password: adminPwd, isActive: true },
        create: { name: 'Restaurant Owner', email: 'admin@spicegarden.com', password: adminPwd, restaurantId: restaurant.id, role: 'owner' }
    });

    const waiterPwd = await bcrypt.hash('waiter123', 10);
    await prisma.adminUser.upsert({
        where: { email: 'waiter@spicegarden.com' },
        update: { password: waiterPwd, isActive: true },
        create: { name: 'Demo Waiter', email: 'waiter@spicegarden.com', password: waiterPwd, restaurantId: restaurant.id, role: 'waiter' }
    });
    console.log('✅ Admin & Waiter accounts created');

    const categories = [
        { id: 'cat-starter', name: '🥗 Starters', sortOrder: 1 },
        { id: 'cat-main', name: '🍛 Main Course', sortOrder: 2 },
        { id: 'cat-bread', name: '🫓 Breads', sortOrder: 3 },
        { id: 'cat-dessert', name: '🍮 Desserts', sortOrder: 4 },
        { id: 'cat-drinks', name: '🥤 Drinks', sortOrder: 5 },
    ];
    for (const cat of categories) {
        await prisma.category.upsert({ where: { id: cat.id }, update: {}, create: { ...cat, restaurantId: restaurant.id } });
    }

    const menuItems = [
        { categoryId: 'cat-starter', name: 'Paneer Tikka', price: 280, isVeg: true, isFeatured: true, tags: 'popular' },
        { categoryId: 'cat-starter', name: 'Chicken 65', price: 320, isVeg: false, tags: 'spicy,popular' },
        { categoryId: 'cat-starter', name: 'Veg Spring Rolls', price: 200, isVeg: true },
        { categoryId: 'cat-main', name: 'Butter Chicken', price: 380, isVeg: false, isFeatured: true, tags: 'bestseller' },
        { categoryId: 'cat-main', name: 'Paneer Butter Masala', price: 320, isVeg: true, isFeatured: true, tags: 'bestseller' },
        { categoryId: 'cat-main', name: 'Dal Makhani', price: 260, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-main', name: 'Biryani - Chicken', price: 350, isVeg: false, tags: 'popular' },
        { categoryId: 'cat-main', name: 'Biryani - Veg', price: 280, isVeg: true },
        { categoryId: 'cat-bread', name: 'Butter Naan', price: 60, isVeg: true },
        { categoryId: 'cat-bread', name: 'Garlic Naan', price: 80, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-bread', name: 'Laccha Paratha', price: 70, isVeg: true },
        { categoryId: 'cat-dessert', name: 'Gulab Jamun', price: 120, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-dessert', name: 'Kulfi Falooda', price: 150, isVeg: true },
        { categoryId: 'cat-drinks', name: 'Mango Lassi', price: 100, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-drinks', name: 'Nimbu Pani', price: 60, isVeg: true },
    ];
    for (const item of menuItems) {
        const id = `item-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        await prisma.menuItem.upsert({ where: { id }, update: {}, create: { id, restaurantId: restaurant.id, ...item } });
    }

    await prisma.coupon.upsert({
        where: { code_restaurantId: { code: 'WELCOME20', restaurantId: restaurant.id } },
        update: {},
        create: { code: 'WELCOME20', description: '20% off on first order', type: 'percent', value: 20, minOrder: 300, maxDiscount: 200, restaurantId: restaurant.id }
    });

    console.log('✅ 15 menu items seeded');
    console.log('✅ Coupon WELCOME20 created');
    console.log('');
    console.log('🎉 DONE! Login credentials:');
    console.log('   Admin:  admin@spicegarden.com / admin123');
    console.log('   Waiter: waiter@spicegarden.com / waiter123');
    console.log('   Visit:  /demo/menu');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

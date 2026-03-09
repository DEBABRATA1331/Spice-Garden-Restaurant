import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo restaurant
    const restaurant = await prisma.restaurant.upsert({
        where: { slug: 'demo' },
        update: {},
        create: {
            name: 'Spice Garden Restaurant',
            slug: 'demo',
            description: 'Authentic Indian cuisine with a modern twist. Experience the finest flavors crafted with love.',
            address: '123 MG Road, Bangalore, Karnataka 560001',
            phone: '+91 98765 43210',
            email: 'info@spicegarden.com',
            mapLink: 'https://maps.google.com',
        }
    });

    // Settings
    await prisma.restaurantSettings.upsert({
        where: { restaurantId: restaurant.id },
        update: {},
        create: { restaurantId: restaurant.id, taxPercent: 5, loyaltyEnabled: true, pointsPerRupee: 0.1, pointsValue: 0.01 }
    });

    // Admin user
    const password = await bcrypt.hash('admin123', 10);
    await prisma.adminUser.upsert({
        where: { email: 'admin@spicegarden.com' },
        update: { name: 'Restaurant Owner', password, restaurantId: restaurant.id, role: 'owner', isActive: true },
        create: { name: 'Restaurant Owner', email: 'admin@spicegarden.com', password, restaurantId: restaurant.id, role: 'owner' }
    });

    const waiterPassword = await bcrypt.hash('waiter123', 10);
    await prisma.adminUser.upsert({
        where: { email: 'waiter@spicegarden.com' },
        update: { name: 'Demo Waiter', password: waiterPassword, restaurantId: restaurant.id, role: 'staff', isActive: true },
        create: { name: 'Demo Waiter', email: 'waiter@spicegarden.com', password: waiterPassword, restaurantId: restaurant.id, role: 'staff' }
    });

    // Categories
    const cats = await Promise.all([
        prisma.category.upsert({ where: { id: 'cat-starter' }, update: {}, create: { id: 'cat-starter', restaurantId: restaurant.id, name: '🥗 Starters', description: 'Light bites to begin your meal', sortOrder: 1 } }),
        prisma.category.upsert({ where: { id: 'cat-main' }, update: {}, create: { id: 'cat-main', restaurantId: restaurant.id, name: '🍛 Main Course', description: 'Hearty mains crafted with care', sortOrder: 2 } }),
        prisma.category.upsert({ where: { id: 'cat-bread' }, update: {}, create: { id: 'cat-bread', restaurantId: restaurant.id, name: '🫓 Breads', description: 'Freshly baked breads from our tandoor', sortOrder: 3 } }),
        prisma.category.upsert({ where: { id: 'cat-dessert' }, update: {}, create: { id: 'cat-dessert', restaurantId: restaurant.id, name: '🍮 Desserts', description: 'Sweet endings', sortOrder: 4 } }),
        prisma.category.upsert({ where: { id: 'cat-drinks' }, update: {}, create: { id: 'cat-drinks', restaurantId: restaurant.id, name: '🥤 Drinks', description: 'Refreshing beverages', sortOrder: 5 } }),
    ]);

    // Menu items
    const menuItems = [
        { categoryId: 'cat-starter', name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in tandoor with spices', price: 280, isVeg: true, isFeatured: true, tags: 'popular,spicy' },
        { categoryId: 'cat-starter', name: 'Chicken 65', description: 'Crispy deep-fried chicken with curry leaves and chillies', price: 320, isVeg: false, tags: 'spicy,popular' },
        { categoryId: 'cat-starter', name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with seasoned vegetables', price: 200, isVeg: true },
        { categoryId: 'cat-main', name: 'Butter Chicken', description: 'Tender chicken in rich tomato-butter gravy', price: 380, isVeg: false, isFeatured: true, tags: 'bestseller,popular' },
        { categoryId: 'cat-main', name: 'Paneer Butter Masala', description: 'Soft paneer cubes in creamy tomato gravy', price: 320, isVeg: true, isFeatured: true, tags: 'bestseller' },
        { categoryId: 'cat-main', name: 'Dal Makhani', description: 'Slow-cooked black lentils in a buttery sauce', price: 260, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-main', name: 'Biryani - Chicken', description: 'Fragrant basmati rice with spiced chicken, served with raita', price: 350, isVeg: false, tags: 'popular,bestseller' },
        { categoryId: 'cat-main', name: 'Biryani - Veg', description: 'Aromatic basmati rice with seasonal vegetables and saffron', price: 280, isVeg: true },
        { categoryId: 'cat-bread', name: 'Butter Naan', description: 'Leavened bread baked in tandoor, brushed with butter', price: 60, isVeg: true },
        { categoryId: 'cat-bread', name: 'Garlic Naan', description: 'Naan topped with garlic and coriander', price: 80, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-bread', name: 'Laccha Paratha', description: 'Flaky layered whole wheat bread', price: 70, isVeg: true },
        { categoryId: 'cat-dessert', name: 'Gulab Jamun', description: 'Soft milk solid balls soaked in rose-flavored sugar syrup', price: 120, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-dessert', name: 'Kulfi Falooda', description: 'Traditional Indian ice cream with rose syrup and vermicelli', price: 150, isVeg: true },
        { categoryId: 'cat-drinks', name: 'Mango Lassi', description: 'Chilled yogurt drink with fresh alphonso mango', price: 100, isVeg: true, tags: 'popular' },
        { categoryId: 'cat-drinks', name: 'Nimbu Pani', description: 'Fresh lime water with mint and black salt', price: 60, isVeg: true },
    ];

    for (const item of menuItems) {
        await prisma.menuItem.upsert({
            where: { id: `item-${item.name.toLowerCase().replace(/\s/g, '-')}` },
            update: {},
            create: { id: `item-${item.name.toLowerCase().replace(/\s/g, '-')}`, restaurantId: restaurant.id, ...item }
        });
    }

    // Demo coupon
    await prisma.coupon.upsert({
        where: { code_restaurantId: { code: 'WELCOME20', restaurantId: restaurant.id } },
        update: {},
        create: { code: 'WELCOME20', description: '20% off on first order', type: 'percent', value: 20, minOrder: 300, maxDiscount: 200, restaurantId: restaurant.id }
    });

    console.log('✅ Seed complete!');
    console.log('ℹ️ If login fails in production, run: npm run db:seed on backend');
    console.log('📧 Admin login: admin@spicegarden.com / admin123');
    console.log('🧑‍🍳 Waiter login: waiter@spicegarden.com / waiter123');
    console.log('🌐 Restaurant slug: demo');
}

main().catch(console.error).finally(() => prisma.$disconnect());

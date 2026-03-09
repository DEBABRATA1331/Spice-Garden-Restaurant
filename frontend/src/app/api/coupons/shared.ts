import prisma from '@/lib/prisma';

// Shared helper to create a coupon for a restaurant
export async function createCoupon(payload: { restaurantId: string }, body: any) {
    return prisma.coupon.create({
        data: {
            ...body,
            restaurantId: payload.restaurantId,
            value: parseFloat(body.value),
            minOrder: parseFloat(body.minOrder || '0'),
        }
    });
}

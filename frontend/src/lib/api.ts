import axios from 'axios';

const inferApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:4000/api';
        return '/api';
    }

    return 'http://localhost:4000/api';
};

const API_URL = inferApiUrl();

const api = axios.create({ baseURL: API_URL });

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
    // Helps debugging empty UI in production when backend URL was not configured.
    console.warn('[API] NEXT_PUBLIC_API_URL is not set. Using fallback baseURL:', API_URL);
}

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const isBrowsingAdmin = window.location.pathname.startsWith('/admin');
        const token = isBrowsingAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('customerToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

// ── Helper per-feature API wrappers ──────────────────────────────────────────

export const restaurantApi = {
    getBySlug: (slug: string) => api.get(`/restaurants/slug/${slug}`),
    update: (id: string, data: any) => api.put(`/restaurants/${id}`, data),
    getSettings: (id: string) => api.get(`/restaurants/${id}/settings`),
    updateSettings: (id: string, data: any) => api.put(`/restaurants/${id}/settings`, data),
};

export const menuApi = {
    getCategories: (restaurantId: string) => api.get(`/menu/categories/${restaurantId}`),
    getItems: (restaurantId: string, params?: any) => api.get(`/menu/items/${restaurantId}`, { params }),
    createCategory: (data: any) => api.post('/menu/categories', data),
    updateCategory: (id: string, data: any) => api.put(`/menu/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/menu/categories/${id}`),
    createItem: (data: any) => api.post('/menu/items', data),
    updateItem: (id: string, data: any) => api.put(`/menu/items/${id}`, data),
    deleteItem: (id: string) => api.delete(`/menu/items/${id}`),
    toggleItem: (id: string) => api.patch(`/menu/items/${id}/toggle`),
    uploadImage: (formData: FormData) => api.post('/menu/upload', formData),
};

export const orderApi = {
    create: (data: any) => api.post('/orders', data),
    getById: (id: string) => api.get(`/orders/${id}`),
    getCustomerOrders: (customerId: string) => api.get(`/orders/customer/${customerId}`),
    adminGetAll: (params?: any) => api.get('/orders/admin/all', { params }),
    updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
    updatePayment: (id: string, data: any) => api.patch(`/orders/${id}/payment`, data),
    generateInvoice: (id: string) => api.post(`/orders/${id}/invoice`),
};

export const reservationApi = {
    create: (data: any) => api.post('/reservations', data),
    getById: (id: string) => api.get(`/reservations/${id}`),
    adminGetAll: (params?: any) => api.get('/reservations/admin/all', { params }),
    updateStatus: (id: string, status: string, tableNumber?: string) => api.patch(`/reservations/${id}/status`, { status, tableNumber }),
    delete: (id: string) => api.delete(`/reservations/${id}`),
};

export const analyticsApi = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getRevenue: (params?: any) => api.get('/analytics/revenue', { params }),
};

export const billingApi = {
    getAll: (params?: any) => api.get('/billing/admin/all', { params }),
    getById: (id: string) => api.get(`/billing/${id}`),
    markPaid: (id: string) => api.patch(`/billing/${id}/pay`),
    getDailySummary: (date?: string) => api.get('/billing/summary/daily', { params: { date } }),
};

export const couponApi = {
    getAll: () => api.get('/coupons/admin/all'),
    create: (data: any) => api.post('/coupons', data),
    update: (id: string, data: any) => api.put(`/coupons/${id}`, data),
    delete: (id: string) => api.delete(`/coupons/${id}`),
    validate: (code: string, restaurantId: string, orderAmount: number) =>
        api.post('/coupons/validate', { code, restaurantId, orderAmount }),
};

export const reviewApi = {
    getByRestaurant: (restaurantId: string) => api.get(`/reviews/${restaurantId}`),
    create: (data: any) => api.post('/reviews', data),
    adminGetAll: () => api.get('/reviews/admin/all'),
    approve: (id: string, isApproved: boolean) => api.patch(`/reviews/${id}/approve`, { isApproved }),
    delete: (id: string) => api.delete(`/reviews/${id}`),
};

export const qrApi = {
    getMenuQR: (slug: string) => api.get(`/qr/menu/${slug}`),
    getTableQR: (slug: string, tableNo: string) => api.get(`/qr/table/${slug}/${tableNo}`),
};

export const authApi = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    loginSimple: (data: { name: string, phone: string, restaurantId: string }) => api.post('/auth/login-simple', data),
    getMe: () => api.get('/auth/me'),
    adminLogin: (data: { email: string; password: string; role?: 'owner' | 'manager' | 'staff' }) => api.post('/admin/auth/login', data),
    adminSetup: (data: any) => api.post('/admin/auth/setup', data),
    adminGetMe: () => api.get('/admin/auth/me'),
};

export const loyaltyApi = {
    getBalance: () => api.get('/loyalty/balance'),
    getHistory: () => api.get('/loyalty/history'),
};

export const paymentApi = {
    createOrder: (data: any) => api.post('/payment/create-order', data),
    verify: (data: any) => api.post('/payment/verify', data),
};

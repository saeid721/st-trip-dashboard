// ========================================
// Package - Dummy data
// ========================================
window.INVOICE_CONFIG = {
    STORAGE_KEY: 'st_tyre_invoices_v1',
    load() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) { try { return JSON.parse(raw); } catch (e) { /* fall through to seed */ } }
        this.save(this.SEED);
        return JSON.parse(JSON.stringify(this.SEED));
    },
    save(data) { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); },
    SEED: [
        { id: 1, packageId: 'PKG-UMR-2026-001', name: 'Exclusive Umrah Package', subtitle: 'Premium hotels • Makkah + Madinah', thumb: 'https://images.unsplash.com/photo-1565552629477-0922d3611d7d?w=100&h=100&fit=crop', type: 'Umrah', destination: 'Makkah & Madinah, KSA', duration: '14 Days', price: 140000, availableSeats: 24, totalSeats: 30, status: 'Published', featured: true, updatedAt: '2026-09-05' },
        { id: 2, packageId: 'PKG-HAJ-2026-012', name: 'Hajj Package 2026', subtitle: '14 days • 13 nights • VIP Tents', thumb: 'https://images.unsplash.com/photo-1537181534458-76c8c4c7e6a3?w=100&h=100&fit=crop', type: 'Hajj', destination: 'Makkah, KSA', duration: '14 Days', price: 450000, availableSeats: 8, totalSeats: 50, status: 'Published', featured: true, updatedAt: '2026-09-04' },
        { id: 3, packageId: 'PKG-TR-2026-045', name: 'Breathtaking Singapore', subtitle: '6 days • 5 nights • City Tour', thumb: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=100&h=100&fit=crop', type: 'Tour', destination: 'Singapore', duration: '6 Days', price: 85000, availableSeats: 0, totalSeats: 20, status: 'Expired', featured: false, updatedAt: '2026-08-28' },
        { id: 4, packageId: 'PKG-HOL-2026-088', name: 'Dubai Explorer', subtitle: '5 days • 4 nights • Desert Safari', thumb: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&h=100&fit=crop', type: 'Holiday', destination: 'Dubai, UAE', duration: '5 Days', price: 65000, availableSeats: 15, totalSeats: 25, status: 'Published', featured: true, updatedAt: '2026-09-06' },
        { id: 5, packageId: 'PKG-TR-2026-091', name: 'Bangkok Discovery', subtitle: '3 days • 2 nights • Group Tour', thumb: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=100&h=100&fit=crop', type: 'Tour', destination: 'Bangkok, Thailand', duration: '3 Days', price: 35000, availableSeats: 12, totalSeats: 15, status: 'Draft', featured: false, updatedAt: '2026-09-01' },
        { id: 6, packageId: 'PKG-VIS-2026-102', name: 'UK Visitor Visa Assistance', subtitle: 'Document review • Interview prep', thumb: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=100&h=100&fit=crop', type: 'Visa', destination: 'United Kingdom', duration: 'N/A', price: 15000, availableSeats: 999, totalSeats: 999, status: 'Published', featured: false, updatedAt: '2026-09-03' },
        { id: 7, packageId: 'PKG-UMR-2026-005', name: 'Budget Umrah Saver', subtitle: 'Economy hotels • Shuttle service', thumb: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=100&h=100&fit=crop', type: 'Umrah', destination: 'Makkah & Madinah, KSA', duration: '10 Days', price: 95000, availableSeats: 2, totalSeats: 30, status: 'Published', featured: false, updatedAt: '2026-09-02' },
        { id: 8, packageId: 'PKG-TR-2026-110', name: 'Malaysia Family Holiday', subtitle: '7 days • 6 nights • Genting Highlands', thumb: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=100&h=100&fit=crop', type: 'Holiday', destination: 'Kuala Lumpur, Malaysia', duration: '7 Days', price: 72000, availableSeats: 0, totalSeats: 20, status: 'Archived', featured: false, updatedAt: '2026-07-15' },
    ],
};


import type { InventoryType, StockTxnType } from '@prisma/client';
import { getTenantPrisma } from '../../lib/prisma-tenant.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export const inventoryService = {
  // ── Categories ──────────────────────────────────────────────────────────────
  async createCategory(institutionId: string, data: { name: string; type?: InventoryType }) {
    const db = getTenantPrisma(institutionId);
    return db.inventoryCategory.create({
      data: { institutionId, name: data.name, type: data.type ?? 'consumable' },
    });
  },

  async listCategories(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    return db.inventoryCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  },

  // ── Items ─────────────────────────────────────────────────────────────────
  async createItem(institutionId: string, data: { categoryId: string; name: string; sku?: string; unit?: string; quantity?: number; reorderLevel?: number; unitCost?: number | string; location?: string }) {
    const db = getTenantPrisma(institutionId);
    const category = await db.inventoryCategory.findFirst({ where: { id: data.categoryId }, select: { id: true } });
    if (!category) throw new NotFoundError('Category not found');
    return db.inventoryItem.create({
      data: {
        institutionId,
        categoryId: data.categoryId,
        name: data.name,
        sku: data.sku ?? null,
        unit: data.unit ?? 'pcs',
        quantity: data.quantity ?? 0,
        reorderLevel: data.reorderLevel ?? 0,
        unitCost: data.unitCost != null ? String(data.unitCost) : null,
        location: data.location ?? null,
      },
    });
  },

  async listItems(institutionId: string, filters: { categoryId?: string; lowStock?: boolean } = {}) {
    const db = getTenantPrisma(institutionId);
    const items = await db.inventoryItem.findMany({
      where: { isActive: true, ...(filters.categoryId ? { categoryId: filters.categoryId } : {}) },
      orderBy: { name: 'asc' },
      include: { category: { select: { name: true, type: true } } },
    });
    if (filters.lowStock) return items.filter((i) => i.quantity <= i.reorderLevel);
    return items;
  },

  // ── Stock transactions ──────────────────────────────────────────────────────
  async recordStock(institutionId: string, data: { itemId: string; type: StockTxnType; quantity: number; reason?: string; performedBy?: string }) {
    const db = getTenantPrisma(institutionId);
    const item = await db.inventoryItem.findFirst({ where: { id: data.itemId }, select: { id: true, quantity: true } });
    if (!item) throw new NotFoundError('Item not found');
    if (data.quantity <= 0) throw new ValidationError('quantity must be positive');

    let balanceAfter: number;
    if (data.type === 'stock_in') balanceAfter = item.quantity + data.quantity;
    else if (data.type === 'stock_out') {
      if (item.quantity < data.quantity) throw new ValidationError('Insufficient stock');
      balanceAfter = item.quantity - data.quantity;
    } else {
      // adjustment: quantity is the absolute new balance
      balanceAfter = data.quantity;
    }

    const txn = await db.stockTransaction.create({
      data: {
        institutionId,
        itemId: data.itemId,
        type: data.type,
        quantity: data.quantity,
        balanceAfter,
        reason: data.reason ?? null,
        performedBy: data.performedBy ?? null,
      },
    });
    await db.inventoryItem.update({ where: { id: data.itemId }, data: { quantity: balanceAfter } });
    return txn;
  },

  async listTransactions(institutionId: string, itemId?: string) {
    const db = getTenantPrisma(institutionId);
    return db.stockTransaction.findMany({
      where: { ...(itemId ? { itemId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { item: { select: { name: true, unit: true } } },
    });
  },

  async getValuation(institutionId: string) {
    const db = getTenantPrisma(institutionId);
    const items = await db.inventoryItem.findMany({ where: { isActive: true }, select: { quantity: true, unitCost: true, reorderLevel: true } });
    const totalValue = items.reduce((s, i) => s + i.quantity * Number(i.unitCost ?? 0), 0);
    const lowStockCount = items.filter((i) => i.quantity <= i.reorderLevel).length;
    return { itemCount: items.length, totalValue, lowStockCount };
  },
};

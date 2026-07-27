import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const unwrap = async <T>(p: Promise<{ data: { data: T } }>): Promise<T> => (await p).data.data;

export interface InventoryCategory {
  id: string;
  name: string;
  type: 'consumable' | 'asset';
  _count?: { items: number };
}

export interface InventoryItem {
  id: string;
  categoryId: string;
  name: string;
  sku?: string | null;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost?: string | null;
  location?: string | null;
  category?: { name: string; type: string };
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  balanceAfter: number;
  reason?: string | null;
  createdAt: string;
  item?: { name: string; unit: string };
}

export interface Valuation {
  itemCount: number;
  totalValue: number;
  lowStockCount: number;
}

export const useInventoryCategories = () =>
  useQuery({ queryKey: ['inventory-categories'], queryFn: () => unwrap<InventoryCategory[]>(api.get('/inventory/categories')) });

export const useInventoryItems = (opts: { categoryId?: string; lowStock?: boolean } = {}) =>
  useQuery({
    queryKey: ['inventory-items', opts.categoryId, opts.lowStock],
    queryFn: () => unwrap<InventoryItem[]>(api.get('/inventory/items', { params: { categoryId: opts.categoryId, lowStock: opts.lowStock } })),
  });

export const useStockTransactions = (itemId?: string) =>
  useQuery({ queryKey: ['inventory-transactions', itemId], queryFn: () => unwrap<StockTransaction[]>(api.get('/inventory/transactions', { params: { itemId } })) });

export const useValuation = () =>
  useQuery({ queryKey: ['inventory-valuation'], queryFn: () => unwrap<Valuation>(api.get('/inventory/valuation')) });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; type?: string }) => api.post('/inventory/categories', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory-categories'] }),
  });
};

export const useCreateItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { categoryId: string; name: string; unit?: string; quantity?: number; reorderLevel?: number; unitCost?: number; location?: string }) =>
      api.post('/inventory/items', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['inventory-valuation'] });
    },
  });
};

export const useRecordStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, ...body }: { itemId: string; type: string; quantity: number; reason?: string }) =>
      api.post(`/inventory/items/${itemId}/stock`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      qc.invalidateQueries({ queryKey: ['inventory-transactions'] });
      qc.invalidateQueries({ queryKey: ['inventory-valuation'] });
    },
  });
};

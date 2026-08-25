import { useState } from 'react';
import { Package, Plus, AlertTriangle, IndianRupee, ArrowDownUp } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Pill, TONE } from '@/components/shared/Pill';
import {
  useInventoryCategories,
  useInventoryItems,
  useValuation,
  useCreateCategory,
  useCreateItem,
  useRecordStock,
} from '@/lib/queries/inventory/inventory-queries';

export default function InventoryPage() {
  const [catOpen, setCatOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [showLow, setShowLow] = useState(false);
  const [cat, setCat] = useState({ name: '', type: 'consumable' });
  const [item, setItem] = useState({ categoryId: '', name: '', unit: 'pcs', quantity: '', reorderLevel: '', unitCost: '' });

  const { data: categories } = useInventoryCategories();
  const { data: items, isLoading } = useInventoryItems({ lowStock: showLow });
  const { data: val } = useValuation();
  const createCategory = useCreateCategory();
  const createItem = useCreateItem();
  const recordStock = useRecordStock();

  const submitCat = () => {
    if (!cat.name) return toast.error('Category name required');
    createCategory.mutate(cat, { onSuccess: () => { toast.success('Category created'); setCatOpen(false); setCat({ name: '', type: 'consumable' }); } });
  };
  const submitItem = () => {
    if (!item.categoryId || !item.name) return toast.error('Category and name required');
    createItem.mutate(
      { categoryId: item.categoryId, name: item.name, unit: item.unit, quantity: Number(item.quantity) || 0, reorderLevel: Number(item.reorderLevel) || 0, unitCost: item.unitCost ? Number(item.unitCost) : undefined },
      { onSuccess: () => { toast.success('Item added'); setItemOpen(false); setItem({ categoryId: '', name: '', unit: 'pcs', quantity: '', reorderLevel: '', unitCost: '' }); } },
    );
  };
  const adjustStock = (itemId: string, type: 'stock_in' | 'stock_out') => {
    const qStr = window.prompt((type === 'stock_in' ? 'Add' : 'Remove') + ' quantity:');
    if (!qStr) return;
    const quantity = Number(qStr);
    if (!quantity || quantity <= 0) return toast.error('Enter a positive number');
    recordStock.mutate({ itemId, type, quantity }, { onSuccess: () => toast.success('Stock updated'), onError: () => toast.error('Failed — check available stock') });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        breadcrumb={[{ label: 'Operations' }, { label: 'Inventory & Assets' }]}
        title="Inventory & Assets"
        description="Store items, stock movements and valuation"
        action={
          <div className="flex flex-wrap gap-2">
            <Dialog open={catOpen} onOpenChange={setCatOpen}>
              <DialogTrigger asChild><Button variant="outline" className="flex-1 sm:flex-none"><Plus className="mr-2 h-4 w-4" /> Category</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Category name" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} />
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={cat.type} onChange={(e) => setCat({ ...cat, type: e.target.value })}>
                    <option value="consumable">Consumable</option>
                    <option value="asset">Asset</option>
                  </select>
                  <Button className="w-full" onClick={submitCat}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={itemOpen} onOpenChange={setItemOpen}>
              <DialogTrigger asChild><Button className="flex-1 sm:flex-none"><Plus className="mr-2 h-4 w-4" /> Item</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Item</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={item.categoryId} onChange={(e) => setItem({ ...item, categoryId: e.target.value })}>
                    <option value="">Select category…</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Input placeholder="Item name" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input placeholder="Unit (pcs)" value={item.unit} onChange={(e) => setItem({ ...item, unit: e.target.value })} />
                    <Input placeholder="Opening qty" type="number" value={item.quantity} onChange={(e) => setItem({ ...item, quantity: e.target.value })} />
                    <Input placeholder="Reorder level" type="number" value={item.reorderLevel} onChange={(e) => setItem({ ...item, reorderLevel: e.target.value })} />
                    <Input placeholder="Unit cost ₹" type="number" value={item.unitCost} onChange={(e) => setItem({ ...item, unitCost: e.target.value })} />
                  </div>
                  <Button className="w-full" onClick={submitItem}>Add Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Items" value={val?.itemCount ?? 0} icon={Package} tone="teal" />
        <StatCard title="Stock Value" value={'₹' + (val?.totalValue ?? 0).toLocaleString('en-IN')} icon={IndianRupee} tone="gold" />
        <StatCard title="Low Stock" value={val?.lowStockCount ?? 0} icon={AlertTriangle} tone={(val?.lowStockCount ?? 0) > 0 ? 'saffron' : 'indigo'} className="col-span-2 lg:col-span-1" />
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Items</h3>
            <Button size="sm" variant={showLow ? 'default' : 'outline'} className="rounded-full" onClick={() => setShowLow(!showLow)}>
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> {showLow ? 'Showing low stock' : 'Low stock only'}
            </Button>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !items?.length ? (
            <p className="text-sm text-muted-foreground">No items{showLow ? ' below reorder level' : ''}.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {items.map((it) => {
                const low = it.quantity <= it.reorderLevel;
                return (
                  <div key={it.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-card p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{it.name}</p>
                        {low && <Pill label="low" tone={TONE.red} />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{it.category?.name} · {it.quantity} {it.unit} · reorder @ {it.reorderLevel}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-none rounded-full" onClick={() => adjustStock(it.id, 'stock_in')}>+ In</Button>
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-none rounded-full" onClick={() => adjustStock(it.id, 'stock_out')}><ArrowDownUp className="mr-1 h-3 w-3" /> Out</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

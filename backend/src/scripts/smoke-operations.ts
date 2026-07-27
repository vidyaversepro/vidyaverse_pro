/**
 * Operations cluster smoke test — hostel, inventory, health, visitor.
 * Self-contained (no WhatsApp worker dependency): clinic visit uses
 * notifyGuardian:false so the messaging rail is not exercised here.
 *
 * Run: tsx src/scripts/smoke-operations.ts
 */
import { randomBytes } from 'node:crypto';
import { prisma } from '../config/database.js';
import { hostelService } from '../modules/hostel/hostel.service.js';
import { inventoryService } from '../modules/inventory/inventory.service.js';
import { healthService } from '../modules/health/health.service.js';
import { visitorService } from '../modules/visitor/visitor.service.js';

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

async function main() {
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: {},
    create: { name: 'Smoke Test School', code: 'VV-SMOKE', enabledFields: {}, customFields: {}, enabledServices: [] },
  });
  const studentId = randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12}).*/, '$1-$2-$3-$4-$5');

  // ── Hostel ────────────────────────────────────────────────────────────────
  const block = await hostelService.createBlock(inst.id, { name: 'Block A', type: 'boys', wardenName: 'Mr. Verma' });
  const room = await hostelService.addRoom(inst.id, block.id, { roomNumber: '101', floor: 1, capacity: 2, monthlyRent: 3000 });
  const allotment = await hostelService.allotRoom(inst.id, { roomId: room.id, studentId, bedNumber: 'B1' });
  const occ1 = await hostelService.getOccupancySummary(inst.id);
  check('hostel: block+room+allot, occupancy reflects', occ1.occupiedBeds >= 1 && occ1.totalBeds >= 2, `occupied=${occ1.occupiedBeds}/${occ1.totalBeds}`);

  const bill = await hostelService.createMessBill(inst.id, { studentId, billMonth: '2026-05', amount: 2500 });
  const paid = await hostelService.markMessBillPaid(inst.id, bill.id);
  check('hostel: mess bill create + pay', paid.status === 'paid' && !!paid.paidAt, `status=${paid.status}`);

  const vacated = await hostelService.vacateRoom(inst.id, allotment.id);
  const occ2 = await hostelService.getOccupancySummary(inst.id);
  check('hostel: vacate frees a bed', vacated.status === 'vacated' && occ2.occupiedBeds === occ1.occupiedBeds - 1, `after=${occ2.occupiedBeds}`);

  // ── Inventory ─────────────────────────────────────────────────────────────
  const cat = await inventoryService.createCategory(inst.id, { name: `Stationery-${randomBytes(2).toString('hex')}`, type: 'consumable' });
  const item = await inventoryService.createItem(inst.id, { categoryId: cat.id, name: 'A4 Paper Ream', unit: 'ream', quantity: 0, reorderLevel: 5, unitCost: 250 });
  await inventoryService.recordStock(inst.id, { itemId: item.id, type: 'stock_in', quantity: 20 });
  await inventoryService.recordStock(inst.id, { itemId: item.id, type: 'stock_out', quantity: 18 });
  const afterOut = await inventoryService.listItems(inst.id, { categoryId: cat.id });
  check('inventory: stock in/out tracks balance', afterOut[0]?.quantity === 2, `qty=${afterOut[0]?.quantity}`);

  const low = await inventoryService.listItems(inst.id, { lowStock: true });
  check('inventory: low-stock filter catches item', low.some((i) => i.id === item.id), `lowStock count=${low.length}`);

  const val = await inventoryService.getValuation(inst.id);
  check('inventory: valuation computes value + low-stock count', val.totalValue >= 500 && val.lowStockCount >= 1, `value=${val.totalValue}, low=${val.lowStockCount}`);

  // Insufficient-stock guard
  let guarded = false;
  try { await inventoryService.recordStock(inst.id, { itemId: item.id, type: 'stock_out', quantity: 999 }); }
  catch { guarded = true; }
  check('inventory: rejects stock-out beyond balance', guarded, `threw=${guarded}`);

  // ── Health ──────────────────────────────────────────────────────────────────
  const rec = await healthService.upsertRecord(inst.id, { studentId, bloodGroup: 'O+', allergies: 'Peanuts', heightCm: 150, weightKg: 42 });
  check('health: record upsert', rec.bloodGroup === 'O+', `blood=${rec.bloodGroup}`);

  const { visit, notified } = await healthService.recordVisit(inst.id, { studentId, symptoms: 'Fever', treatment: 'Paracetamol', attendedBy: 'Nurse Anita', notifyGuardian: false });
  check('health: clinic visit recorded (no notify)', !!visit.id && notified === 0, `visit=${!!visit.id}, notified=${notified}`);

  await healthService.addVaccination(inst.id, { studentId, vaccineName: 'Tetanus Booster', dateAdministered: '2026-05-01', nextDue: '2026-06-15' });
  const due = await healthService.getDueVaccinations(inst.id, 60);
  check('health: vaccination due-soon query', due.some((v) => v.vaccineName === 'Tetanus Booster'), `due=${due.length}`);

  // ── Visitor ─────────────────────────────────────────────────────────────────
  const vlog = await visitorService.checkIn(inst.id, { visitorName: 'Ramesh Kumar', phone: '919800012345', purpose: 'Parent meeting', whomToMeet: 'Principal' });
  const inside = await visitorService.getCurrentlyInside(inst.id);
  check('visitor: check-in appears in currently-inside', inside.some((v) => v.id === vlog.id) && !!vlog.badgeNumber, `inside=${inside.length}, badge=${vlog.badgeNumber}`);

  const out = await visitorService.checkOut(inst.id, vlog.id);
  check('visitor: check-out sets timestamp', out.status === 'checked_out' && !!out.checkOutAt, `status=${out.status}`);

  const pass = await visitorService.issueGatePass(inst.id, { studentId, type: 'early_leave', reason: 'Doctor appointment' });
  check('visitor: gate pass issued', pass.type === 'early_leave' && !!pass.issuedAt, `type=${pass.type}`);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  await prisma.gatePass.deleteMany({ where: { institutionId: inst.id } });
  await prisma.visitorLog.deleteMany({ where: { institutionId: inst.id } });
  await prisma.vaccinationRecord.deleteMany({ where: { institutionId: inst.id } });
  await prisma.clinicVisit.deleteMany({ where: { institutionId: inst.id } });
  await prisma.healthRecord.deleteMany({ where: { institutionId: inst.id } });
  await prisma.stockTransaction.deleteMany({ where: { institutionId: inst.id } });
  await prisma.inventoryItem.deleteMany({ where: { institutionId: inst.id } });
  await prisma.inventoryCategory.deleteMany({ where: { institutionId: inst.id } });
  await prisma.messBill.deleteMany({ where: { institutionId: inst.id } });
  await prisma.hostelAllotment.deleteMany({ where: { institutionId: inst.id } });
  await prisma.hostelRoom.deleteMany({ where: { institutionId: inst.id } });
  await prisma.hostelBlock.deleteMany({ where: { institutionId: inst.id } });

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => {
    await prisma.$disconnect();
    process.exit(ok ? 0 : 1);
  })
  .catch(async (err) => {
    console.error('SMOKE TEST ERROR:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });

/**
 * Transport smoke test — route/stop/assignment, trip start with WhatsApp route
 * alerts (respecting the notifyTransport edge flag), GPS ping, trip complete.
 *
 * Run: tsx src/scripts/smoke-transport.ts
 */
import { prisma } from '../config/database.js';
import { messagingService } from '../modules/messaging/messaging.service.js';
import { transportService } from '../modules/transport/transport.service.js';
import { waOutboxQueue } from '../config/queue.js';
import { waOutboxWorker } from '../workers/waOutboxWorker.js';

async function pollUntil<T>(fn: () => Promise<T | null | undefined>, timeoutMs = 15000, intervalMs = 500): Promise<T | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const r = await fn();
    if (r) return r;
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  return null;
}

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`);
}

async function main() {
  const inst = await prisma.institution.upsert({
    where: { code: 'VV-SMOKE' },
    update: { enabledServices: ['whatsapp_messaging'] },
    create: { name: 'Smoke Test School', code: 'VV-SMOKE', enabledFields: {}, customFields: {}, enabledServices: ['whatsapp_messaging'] },
  });
  const klass = await prisma.class.upsert({ where: { institutionId_name: { institutionId: inst.id, name: 'Class 5' } }, update: {}, create: { institutionId: inst.id, name: 'Class 5' } });
  let section = await prisma.section.findFirst({ where: { classId: klass.id, name: 'A' } });
  section ??= await prisma.section.create({ data: { institutionId: inst.id, classId: klass.id, name: 'A' } });
  let student = await prisma.student.findFirst({ where: { institutionId: inst.id, name: 'Aarav Sharma' } });
  student ??= await prisma.student.create({ data: { institutionId: inst.id, sectionId: section.id, name: 'Aarav Sharma', customData: {} } });
  const guardian = await prisma.guardian.upsert({
    where: { institutionId_whatsappNumber: { institutionId: inst.id, whatsappNumber: '919999900001' } },
    update: {}, create: { institutionId: inst.id, firstName: 'Sunita', whatsappNumber: '919999900001', role: 'mother', source: 'manual' },
  });
  // notifyTransport must be ON for the route alert to reach this guardian.
  await prisma.guardianStudentLink.upsert({
    where: { guardianId_studentId: { guardianId: guardian.id, studentId: student.id } },
    update: { notifyTransport: true },
    create: { institutionId: inst.id, guardianId: guardian.id, studentId: student.id, isPrimary: true, notifyTransport: true },
  });
  await messagingService.provisionDefaultTemplates(inst.id);

  // 1. Route + stop
  const route = await transportService.createRoute(inst.id, { name: 'Route 7 — Sector 21', vehicleNumber: 'HR26-1234', driverName: 'Ramesh', driverPhone: '919800011122', feeAmount: 1500 });
  await transportService.addStop(inst.id, route.id, { name: 'Sector 21 Gate', sequence: 1, pickupTime: '07:30', latitude: 28.4595, longitude: 77.0266 });
  const routes = await transportService.listRoutes(inst.id);
  const withStops = routes.find((r) => r.id === route.id);
  check('route + stop created', !!withStops && withStops.stops.length >= 1, `route=${route.code}, stops=${withStops?.stops.length}`);

  // 2. Assign student
  await transportService.assignStudent(inst.id, { studentId: student.id, routeId: route.id, type: 'both' });
  const assignments = await transportService.listAssignments(inst.id, { routeId: route.id });
  check('student assigned to route', assignments.length >= 1, `assignments=${assignments.length}`);

  // 3. Start trip → WhatsApp alert to notifyTransport guardian
  const { trip, notified } = await transportService.startTrip(inst.id, { routeId: route.id, direction: 'pickup' });
  const alertOutbox = await pollUntil(() =>
    prisma.outbox.findFirst({ where: { recipientId: guardian.id, templateCode: 'transport_alert', status: 'sent' }, orderBy: { createdAt: 'desc' } }),
  );
  check('trip start → route alert sent', notified >= 1 && trip.status === 'started' && !!alertOutbox, `notified=${notified}, trip=${trip.status}, outbox=${alertOutbox?.status ?? 'none'}`);

  // 4. GPS ping updates position
  const pinged = await transportService.recordGpsPing(inst.id, trip.id, { latitude: 28.4601, longitude: 77.0301 });
  check('gps ping updates trip position', Number(pinged.lastLatitude) === 28.4601 && !!pinged.lastPingAt, `lat=${pinged.lastLatitude}, ping=${!!pinged.lastPingAt}`);

  // 5. Complete trip
  const done = await transportService.completeTrip(inst.id, trip.id);
  check('complete trip', done.status === 'completed' && !!done.completedAt, `status=${done.status}`);

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===\n`);
  return passed === results.length;
}

main()
  .then(async (ok) => {
    await waOutboxWorker.close();
    await waOutboxQueue.close();
    await prisma.$disconnect();
    process.exit(ok ? 0 : 1);
  })
  .catch(async (err) => {
    console.error('SMOKE TEST ERROR:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });

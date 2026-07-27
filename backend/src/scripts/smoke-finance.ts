/**
 * Finance & Accounting smoke test — system chart, balanced posting, rejection of
 * unbalanced entries, expense/income, fee collection, trial balance, P&L.
 *
 * Run: tsx src/scripts/smoke-finance.ts
 */
import { prisma } from '../config/database.js';
import { financeService } from '../modules/finance/finance.service.js';

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

  // 1. System chart of accounts
  const accounts = await financeService.ensureSystemAccounts(inst.id);
  const cash = accounts.find((a) => a.code === 'CASH');
  const feeIncome = accounts.find((a) => a.code === 'FEE_INCOME');
  const miscIncome = accounts.find((a) => a.code === 'MISC_INCOME');
  check('system accounts provisioned', !!cash && !!feeIncome && accounts.length >= 6, `accounts=${accounts.length}`);

  // 2. Balanced entry posts
  const entry = await financeService.postEntry(inst.id, {
    narration: 'Smoke balanced',
    lines: [{ accountId: cash!.id, debit: 1000 }, { accountId: miscIncome!.id, credit: 1000 }],
  });
  check('balanced entry posts', entry.lines.length === 2 && Number(entry.totalAmount) === 1000, `lines=${entry.lines.length}, total=${entry.totalAmount}`);

  // 3. Unbalanced entry rejected
  let rejected = false;
  try {
    await financeService.postEntry(inst.id, { narration: 'bad', lines: [{ accountId: cash!.id, debit: 1000 }, { accountId: miscIncome!.id, credit: 500 }] });
  } catch {
    rejected = true;
  }
  check('unbalanced entry rejected', rejected, `rejected=${rejected}`);

  // 4. Expense + income helpers
  const exp = await financeService.recordExpense(inst.id, { amount: 5000, narration: 'Stationery' });
  const inc = await financeService.recordIncome(inst.id, { amount: 3000, narration: 'Donation' });
  check('expense + income recorded', !!exp.id && !!inc.id, `exp=${exp.voucherNumber}, inc=${inc.voucherNumber}`);

  // 5. Fee collection posts into the books
  const fee = await financeService.recordFeeCollection(inst.id, { amount: 2000, invoiceId: 'smoke-invoice-123' });
  check('fee collection posted', fee.referenceType === 'fee_invoice' && Number(fee.totalAmount) === 2000, `ref=${fee.referenceType}, amount=${fee.totalAmount}`);

  // 6. Trial balance always balances (double-entry invariant)
  const tb = await financeService.trialBalance(inst.id);
  check('trial balance balances', tb.balanced && tb.totalDebit === tb.totalCredit, `debit=${tb.totalDebit}, credit=${tb.totalCredit}, balanced=${tb.balanced}`);

  // 7. P&L consistency
  const pnl = await financeService.profitAndLoss(inst.id);
  check('P&L = income − expense', pnl.netProfit === Math.round((pnl.totalIncome - pnl.totalExpense) * 100) / 100, `income=${pnl.totalIncome}, expense=${pnl.totalExpense}, net=${pnl.netProfit}`);

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

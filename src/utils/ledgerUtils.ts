import type { FundTransaction, FundBalances } from '../types';

export function calculateBalances(
  transactions: FundTransaction[],
  bankOpeningBalance: number = 100000,
  cashOpeningBalance: number = 10000
): FundBalances {
  let bankIncome = 0;
  let bankExpense = 0;
  let cashIncome = 0;
  let cashExpense = 0;

  let totalIncomeThisMonth = 0;
  let totalExpenseThisMonth = 0;

  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  transactions.forEach((txn) => {
    const isThisMonth = txn.transaction_date.startsWith(currentMonthYear);

    if (txn.type === 'INCOME') {
      if (txn.account_type === 'BANK') bankIncome += txn.amount;
      else if (txn.account_type === 'CASH') cashIncome += txn.amount;

      if (isThisMonth) totalIncomeThisMonth += txn.amount;
    } else if (txn.type === 'EXPENSE') {
      if (txn.account_type === 'BANK') bankExpense += txn.amount;
      else if (txn.account_type === 'CASH') cashExpense += txn.amount;

      if (isThisMonth) totalExpenseThisMonth += txn.amount;
    }
  });

  const bankBalance = bankOpeningBalance + bankIncome - bankExpense;
  const cashBalance = cashOpeningBalance + cashIncome - cashExpense;
  const totalAvailableFund = bankBalance + cashBalance;

  return {
    bankBalance,
    cashBalance,
    totalAvailableFund,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
  };
}

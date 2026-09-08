import { TransactionFilters } from "@/constants/transactions";

export const queryKeys = {
  accounts: (userId?: string) => ["accounts", userId] as const,
  transactions: (userId?: string, filters: TransactionFilters = {}) =>
    ["transactions", , filters, userId] as const,
  budget: (userId?: string) => ["budget", userId] as const,
};

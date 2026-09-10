import { format } from "date-fns";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Transaction } from "./services/transactions";

export const formatPrice = (
  value: number,
  currency: string = "INR",
): string => {
  const locale = currency === "INR" ? "en-IN" : undefined;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const exportWindowDays = 30;

function toCsvCell(value: string | number | null) {
  if (value === null) return "";
  const str = String(value);
  if (/[",\n"]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function buildCsv(transactions: Transaction[]) {
  const header = [
    "Date",
    "Type",
    "Category",
    "Description",
    "Amount",
    "Input Method",
  ];

  const rows = transactions.map((tx) => [
    format(new Date(tx.date), "yyyy-MM-dd"),
    tx.type,
    tx.category,
    tx.description ?? "",
    tx.amount,
    tx.input_method,
  ]);

  return [header, ...rows]
    .map((row) => row.map(toCsvCell).join(","))
    .join("\n");
}

export async function exportTransactionsToCsv(transactions: Transaction[]) {
  const cutOff = new Date();
  cutOff.setDate(cutOff.getDate() - exportWindowDays);

  const recentTransactions = transactions.filter(
    (tx) => new Date(tx.date) >= cutOff,
  );

  const csv = buildCsv(recentTransactions);

  const fileName = `transaction-${format(new Date(), "yyyy-MM-dd")}.csv`;
  const file = new File(new Directory(Paths.cache), fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv",
      dialogTitle: "Export transactions",
      UTI: "public.comma-separated-values-text",
    });
  }

  return { count: recentTransactions.length, uri: file.uri };
}

import TransactionsRow from "@/components/TransactionsRow";
import { useDeleteTransaction } from "@/hooks/mutations/useTransactionMutation";
import { useAccountsQuery } from "@/hooks/queries/useAccountsQuery";
import { useTransactionsQuery } from "@/hooks/queries/useTransactionsQuery";
import { Transaction, TransactionType } from "@/lib/services/transactions";
import { exportTransactionsToCsv } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { eachDayOfInterval, format, startOfDay, startOfMonth } from "date-fns";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

const filters = ["All", "Income", "Expense"] as const;

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function currentMonthDays() {
  const today = startOfDay(new Date());
  return eachDayOfInterval({ start: startOfMonth(today), end: today }).map(
    (d) => ({ key: dayKey(d), label: format(d, "d MMM") }),
  );
}

export default function Transactions() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const typeFilter: TransactionType | null =
    activeFilter === "Income"
      ? "INCOME"
      : activeFilter === "Expense"
        ? "EXPENSE"
        : null;

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isRefetching: transactionsRefetching,
    isError: transactionsError,
    refetch: refetchTransactions,
  } = useTransactionsQuery({ type: typeFilter, accountId: activeAccountId });

  const { data: accounts = [], refetch: refetchAccounts } = useAccountsQuery();

  const { mutateAsync: removeTransaction } = useDeleteTransaction();

  const loading = transactionsLoading;
  const refreshing = transactionsRefetching;
  const error = transactionsError;

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { count } = await exportTransactionsToCsv(transactions);
      if (count === 0) {
        Alert.alert(
          "Nothing to export",
          "No transactions in the export window.",
        );
      }
    } catch (error) {
      console.error("Error exporting file: ", error);
    } finally {
      setExporting(false);
    }
  };
  const handleDelete = async (tx: Transaction) => {
    Alert.alert(
      "Delete transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteError } = await removeTransaction(tx);
            if (deleteError) {
              Alert.alert("Error", "Could not delete this transaction.");
            }
          },
        },
      ],
    );
  };

  const filteredTransactions = useMemo(() => {
    const searchResult = search.trim().toLowerCase();

    if (!searchResult) return transactions;

    return transactions.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(searchResult) ||
        tx.category.toLowerCase().includes(searchResult),
    );
  }, [transactions, search]);

  const dailyIncomeExpense = useMemo(() => {
    const days = currentMonthDays();
    return days.flatMap(({ key, label }) => {
      const income = transactions
        .filter(
          (tx) => tx.type === "INCOME" && dayKey(new Date(tx.date)) === key,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expense = transactions
        .filter(
          (tx) => tx.type === "EXPENSE" && dayKey(new Date(tx.date)) === key,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      return [
        { value: income, label, frontColor: "#3DDC84" },
        { value: expense, frontColor: "#FF6B4A" },
      ];
    });
  }, [transactions]);

  const loadData = () => {
    refetchTransactions();
    refetchAccounts();
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-brand-bg text-xl font-semibold">
            Transactions
          </Text>
          <TouchableOpacity
            onPress={handleExport}
            disabled={exporting}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E6DF] items-center justify-center"
          >
            {exporting ? (
              <ActivityIndicator size="small" color="5C5F68" />
            ) : (
              <Feather name="download" size={16} color="5C5F68" />
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2  bg-white rounded-xl border border-[#E8E6DF] px-4 py-2 mb-2 ">
          <Feather name="search" size={16} color="#8A8D96" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Serach Transactions"
            placeholderTextColor="8A8D96"
            className="text-brand-bg text-sm flex-1"
          />
          <TouchableOpacity onPress={() => setSearch("")} className="items-end">
            <Feather name="x" size={16} color="#8A8D96" />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-4">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full border ${activeFilter === filter ? "bg-brand-bg border-brand-bg" : "bg-white border-[#E8E6DF]"}`}
            >
              <Text
                className={`text-sm ${activeFilter === filter ? "text-white" : "text-brand-text-secondary"}`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveAccountId(null)}
              className={`px-4 py-2 rounded-full border ${activeAccountId === null ? "bg-brand-bg border-brand-bg" : "bg-white border-[#E8E6DF]"}`}
            >
              <Text
                className={`text-sm ${activeAccountId === null ? "text-white" : "text-brand-text-secondary"}`}
              >
                All Accounts
              </Text>
            </TouchableOpacity>

            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                onPress={() => setActiveAccountId(account.id)}
                className={`px-4 py-2 rounded-full border ${activeAccountId === account.id ? "bg-brand-bg border-brand-bg" : "bg-white border-[#E8E6DF]"}`}
              >
                <Text
                  className={`text-sm ${activeAccountId === account.id ? "text-white" : "text-brand-text-secondary"}`}
                >
                  {account.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#4A9EFF"></ActivityIndicator>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-10">
          <Feather name="alert-circle" size={32} color="#FF6B4A" />
          <Text className="text-brand-text-muted text-sm text-center my-4">
            Oops! Could not load transactions.
          </Text>
          <TouchableOpacity className="bg-brand-bg rounded-full px-8 py-4">
            <Text className="text-white text-sm font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionsRow tx={item} onDelete={() => handleDelete(item)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} />
          }
          ListHeaderComponent={
            transactions.length > 0 ? (
              <View className="bg-white rounded-2xl border border-[#E8E6DF] p-4 mb-4">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-brand-bg text-xs font-medium">
                    Daily income vs expense
                  </Text>

                  <View className="flex-row gap-2">
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full bg-brand-coral" />
                      <Text className="text-[10px] text-brand-text-secondary">
                        Income
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <View className="w-2 h-2 rounded-full bg-brand-success" />
                    <Text className="text-[10px] text-brand-text-secondary">
                      Expense
                    </Text>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={dailyIncomeExpense}
                    width={Math.max(dailyIncomeExpense.length * 9, 280)}
                    height={120}
                    barWidth={6}
                    spacing={4}
                    hideYAxisText
                    xAxisColor="E8E6DF"
                    yAxisColor="transparent"
                    rulesColor="#F0EEE7"
                    noOfSections={3}
                    isThreeD={false}
                    xAxisLabelTextStyle={{ color: "#8A8D96", fontSize: 8 }}
                    roundedTop
                  />
                </ScrollView>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Feather name="inbox" size={32} color="#BDC3C7" />
              <Text className="text-brand-text-muted text-sm my-4">
                {search ? "No matching transactions" : "No transactions yet!"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

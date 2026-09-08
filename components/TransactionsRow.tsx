import { getCategoryConfig } from "@/constants/categories";
import { formatPrice } from "@/lib/utils";
import { Transaction } from "@/types";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const inputMethodIcon: Record<
  Transaction["input_method"],
  keyof typeof Feather.glyphMap
> = {
  MANUAL: "edit-3",
  RECEIPT_SCAN: "camera",
  VOICE: "mic",
};

const TransactionsRow = ({
  tx,
  onDelete,
}: {
  tx: Transaction;
  onDelete?: () => {};
}) => {
  console.log(tx);
  const transactionConfig = getCategoryConfig(tx.category);
  const isIncome = tx.type === "INCOME";

  const row = (
    <View
      className="flex-row items-center bg-white rounded-2xl border border-[#E8E6DF] py-4 px-4"
      style={{ borderLeftWidth: 3, borderLeftColor: transactionConfig.color }}
    >
      <View
        className="w-10 h-10 rounded-full items-center jusfity-center mr-4"
        style={{ backgroundColor: `${transactionConfig.color}22` }}
      >
        <Text className="text-lg">{transactionConfig.icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-bg text-sm font-medium" numberOfLines={1}>
          {tx.description || transactionConfig.label}
        </Text>

        <View className="flex-row items-center gap-2 my-1">
          <Feather
            name={inputMethodIcon[tx.input_method]}
            size={12}
            color="#8A8D96"
          />
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${transactionConfig.color}1A` }}
          >
            <Text
              className="text-[10px] font-medium"
              style={{ color: transactionConfig.color }}
            >
              {transactionConfig.label}
            </Text>
          </View>
          {tx.is_flagged && (
            <View className="flex-row items-center -gap-1 ml-1">
              <Feather name="alert-triangle" size={12} color="#FF6B4A" />
              <Text className="text-brand-coral text-[12px]">Flagged</Text>
            </View>
          )}
        </View>
      </View>

      <Text
        className={`text-sm font-medium ${isIncome ? "text-brand-success" : "text-brand-coral"}`}
      >
        {isIncome ? "+" : "-"}
        {formatPrice(tx.amount)}
      </Text>
    </View>
  );

  if (!onDelete) {
    return <View className="mb-2">{row}</View>;
  }
  return (
    <View className="mb-2">
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <TouchableOpacity
            onPress={onDelete}
            className="bg-brand-coral rounded-2xl items-center justify-center w-16 ml-2 "
          >
            <Feather name="trash-2" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      >
        {row}
      </Swipeable>
    </View>
  );
};

export default TransactionsRow;

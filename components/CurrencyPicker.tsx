import { Feather } from "@expo/vector-icons";
import cc from "currency-codes";
import getSymbol from "currency-symbol-map";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type CurrencyEntry = { code: string; name: string; symbol: string };

export const ALL_CURRENCIES: CurrencyEntry[] = cc
  .codes()
  .map((code) => ({
    code,
    name: cc.code(code)?.currency ?? code,
    symbol: getSymbol(code) ?? code,
  }))
  .filter((place) => place.symbol !== place.code);

const CurrencyPicker = ({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedCode: string;
  onSelect: (currency: CurrencyEntry) => void;
  onClose: () => void;
}) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const enteredQuery = search.toLowerCase();
    if (!enteredQuery) return ALL_CURRENCIES;
    return ALL_CURRENCIES.filter(
      (allCodes) =>
        allCodes.code.toLowerCase().includes(enteredQuery) ||
        allCodes.name.toLowerCase().includes(enteredQuery),
    );
  }, [search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex:1, bg-white" edges={["top"]}>
        <View className="flex-row items-center px-6 pt-4 gap-4">
          <TextInput
            className="flex-1 bg-brand-body border border-[#E8E6DF] rounded-full px-4 py-4 text-brand-bg"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={"8A8D96"}
            autoFocus
            placeholder="Search currency here"
          />
          <TouchableOpacity
            onPress={() => {
              setSearch;
              ("");
              onClose();
            }}
          >
            <Text className="text-brand-text-secondary">Cancel</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                setSearch("");
              }}
              className="flex-row items-center px-4 py-2 border-b border-[#F0EDE6]"
            >
              <Text className="text-brand-text-secondary px-4">
                {item.symbol}
              </Text>
              <Text className="text-brand-bg font-medium pr-4">
                {item.code}
              </Text>
              <Text
                className="text-brand-text-secondary flex-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {item.code === selectedCode && (
                <Feather name="check" size={16} color="#4A9EFF" />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default CurrencyPicker;

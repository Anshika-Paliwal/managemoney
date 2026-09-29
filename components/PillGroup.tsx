import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export type PillOption<T extends string> = {
  key: T;
  label: string;
  icon?: string;
};

const PillGroup = <T extends string>({
  options,
  value,
  onChange,
  scrollable = true,
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (key: T) => void;
  scrollable?: boolean;
}) => {
  const row = (
    <View className="flex-row gap-2">
      {options.map((option) => (
        <TouchableOpacity
          className={`max-w-[120px] flex-row items-center gap-2 px-4 py-2 rounded-full border ${
            value === option.key
              ? "bg-brand-bg border-brand-bg"
              : "bg-white border-[#E8E6DF]"
          }`}
          key={option.key}
          onPress={() => onChange(option.key)}
        >
          {option.icon && <Text className="text-xs">{option.icon}</Text>}
          <Text
            numberOfLines={1}
            className={`text-sm ${value === option.key ? "text-white" : "text-brand-text-secondary"}`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!scrollable) return row;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  );
};

export default PillGroup;

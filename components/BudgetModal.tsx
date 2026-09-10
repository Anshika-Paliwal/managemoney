import { COLORS } from "@/constants/theme";
import { useUpsertBudget } from "@/hooks/mutations/useBudgetMutations";
import { Budget } from "@/lib/services/budgets";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import FormSheetModal from "./FormSheetModal";

const BudgetModal = ({
  visible,
  budget,
  onClose,
  onSaved,
}: {
  visible: boolean;
  budget: Budget | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync: upsertBudget, isPending: saving } = useUpsertBudget();

  useEffect(() => {
    if (visible) {
      setAmount(budget ? String(budget.amount) : "");
      setError("");
    }
  }, [visible, budget]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount.replace(/,/g, ""));

    if (!parsedAmount || parsedAmount <= 0) {
      setError("ENter a valid monthly budget!");
      return;
    }

    setError("");
    try {
      await upsertBudget(parsedAmount);
      onSaved();
    } catch (err) {
      console.error("Error saving budget: ", err);
      setError("Something went wrong. Please try again!");
    }
  };

  return (
    <FormSheetModal
      visible={visible}
      title={budget ? "Edit monthly budget" : "Set monthly budget"}
      onClose={onClose}
    >
      <Text className="text-brand-bg text-sm font-medium my-2">
        Monthly budget
      </Text>
      <TextInput
        value={amount}
        onChangeText={(val) => {
          setError("");
          setAmount(val);
        }}
        placeholder="e.g. 50000"
        keyboardType="numeric"
        autoFocus
        placeholderTextColor={COLORS.placeholder}
        className="bg-white border border-[#E8E6DF] rounded-xl px-4 py-4 text-sm text-brand-bg mb-6"
      />
      {error ? (
        <Text className="text-brand-coral text-sm my-2">{error}</Text>
      ) : null}
      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
        className="bg-brand-bg rounded-xl py-4 items-center"
      >
        <Text className="text-white text-sm text-semibold">
          {saving ? "Saving..." : "Save budget"}
        </Text>
      </TouchableOpacity>
    </FormSheetModal>
  );
};

export default BudgetModal;

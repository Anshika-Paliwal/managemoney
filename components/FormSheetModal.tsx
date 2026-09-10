import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FormSheetModal = ({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        className="flex-1 px-6 justify-end bg-black/40"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="rounded-2xl bg-brand-body px-6 py-6">
          <Text className="text-brand-bg text-base font-semibold mb-4">
            {title}
          </Text>
          {children}
          <TouchableOpacity onPress={onClose} className="py-6 items-center ">
            <Text className="text-brand-text-secondary text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FormSheetModal;

import React from "react";
import { observer } from "mobx-react-lite";
import { StyleSheet, Text, View } from "react-native";
import { useStore } from "Root.store";
import tw from 'tailwind-rn';

export const ToastContainer = observer(() => {
  const root = useStore();
  const { toasts } = root.ui;

  if (!toasts.length) {
    return null;
  }

  const latestToast = toasts[0];

  const conditionalStyle = styles[latestToast.type];

  return (
    <View style={[tw(`absolute w-96 p-4 rounded`), {top: 20, right: 20}, conditionalStyle]}>
      <Text style={tw(`text-white`)}>{latestToast.text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  success: tw(`bg-green-500`),
  error: tw(`bg-red-500`),
  neutral: {
    // @ts-ignore
    backgroundColor: {
      dynamic: {
        dark: global.colors.gray500,
        light: `white`,
      },
    },
  },
});

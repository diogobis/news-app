import { useBottomSheetContext } from "@/context/bottom-sheet.context";
import { colors } from "@/shared/colors";
import { Transaction } from "@/shared/interfaces/transaction";
import { MaterialIcons } from "@expo/vector-icons";
import { FC } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { EditTransactionForm } from "./EditTransactionForm";

interface LeftActionProps {
	transaction: Transaction;
}

export const LeftAction: FC<LeftActionProps> = ({ transaction }) => {
	const { openBottomSheet } = useBottomSheetContext();

	return (
		<Pressable
			onPress={() =>
				openBottomSheet(
					<EditTransactionForm transaction={transaction} />,
					1,
				)
			}
		>
			<View className="h-[140px] bg-accent-blue-dark w-[80px] rounded-l-xl items-center justify-center">
				<MaterialIcons name="edit" size={30} color={colors.white} />
			</View>
		</Pressable>
	);
};

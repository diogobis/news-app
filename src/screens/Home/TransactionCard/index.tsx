import { colors } from "@/shared/colors";
import { TransactionTypes } from "@/shared/enums/transactionTypes";
import { Transaction } from "@/shared/interfaces/transaction";
import { MaterialIcons } from "@expo/vector-icons";
import clsx from "clsx";
import { format } from "date-fns";
import { FC } from "react";
import { Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { RightAction } from "./RightAction";
import { LeftAction } from "./LeftAction";
import { moneyMapper } from "@/shared/utils/moneyMapper";

interface TransactionCardParams {
	transaction: Transaction;
}

export const TransactionCard: FC<TransactionCardParams> = ({ transaction }) => {
	const isExpense = transaction.type.id === TransactionTypes.expense;

	return (
		<Swipeable
			containerStyle={{
				alignItems: "center",
				alignSelf: "center",
				overflow: "visible",
				width: "100%",
				paddingHorizontal: 24,
				marginBottom: 16,
			}}
			renderRightActions={() => (
				<RightAction transactionId={transaction.id} />
			)}
			renderLeftActions={() => <LeftAction transaction={transaction} />}
			friction={0.8}
			overshootRight={false}
			overshootLeft={false}
		>
			<View className="h-[140px] bg-background-tertiary rounded-xl p-6 w-full">
				<Text className="text-white text-base">
					{transaction.description}
				</Text>

				<Text
					className={clsx(
						"text-2xl font-bold mt-2",
						isExpense
							? "text-accent-red"
							: "text-accent-brand-light",
					)}
				>
					{isExpense && "- "}
					R${moneyMapper(transaction.value)}
				</Text>

				<View className="flex-row w-full justify-between">
					<View className="items-center flex-row mt-3">
						<MaterialIcons
							name="label-outline"
							color={colors.gray[400]}
							size={23}
						/>

						<Text className="text-gray-400 text-base ml-2">
							{transaction.category.name}
						</Text>
					</View>

					<View className="items-center flex-row mt-3">
						<MaterialIcons
							name="calendar-today"
							color={colors.gray[400]}
							size={20}
						/>

						<Text className="text-gray-400 text-base ml-2">
							{format(transaction.createdAt, "dd/MM/yyyy")}
						</Text>
					</View>
				</View>
			</View>
		</Swipeable>
	);
};

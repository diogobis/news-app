import { useTransactionContext } from "@/context/transaction.context";
import { TransactionTypes } from "@/shared/enums/transactionTypes";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FC } from "react";
import { Text, View } from "react-native";

import { ICONS } from "./strategies/icon-strategy";
import { CARD_DATA } from "./strategies/card-data-strategy";

import { moneyMapper } from "@/shared/utils/moneyMapper";
import clsx from "clsx";

export type TransactionCardType = TransactionTypes | "total";

interface TransactionCardProps {
	type: TransactionCardType;
	amount: number;
}

export const TransactionCard: FC<TransactionCardProps> = ({ amount, type }) => {
	const { transactions } = useTransactionContext();

	const iconData = ICONS[type];
	const data = CARD_DATA[type];

	const lastTransaction = transactions.find(
		({ type: transactionType }) => transactionType.id === type,
	);

	return (
		<View
			className={clsx(
				`bg-${data.bgColor} min-w-[280px] rounded-xl px-8 py-6 justify-between mr-6`,
				{
					"mr-12": type === "total",
				},
			)}
		>
			<View className="flex-row justify-between items-center mb-1">
				<Text className="text-white text-base">{data.label}</Text>

				<MaterialIcons
					name={iconData.name}
					color={iconData.color}
					size={26}
				/>
			</View>

			<View>
				<Text className="text-2xl text-white font-bold">
					R${moneyMapper(amount)}
				</Text>

				{type !== "total" && (
					<Text className="text-gray-400">
						{lastTransaction?.createdAt
							? format(
									lastTransaction.createdAt,
									`'Última${data.label.toLowerCase()} em' d 'de' MMMM`,
									{
										locale: ptBR,
									},
								)
							: "Nenhuma transação encontrada"}
					</Text>
				)}
			</View>
		</View>
	);
};

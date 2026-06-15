import { AppHeader } from "@/components/AppHeader";
import { useTransactionContext } from "@/context/transaction.context";
import { TransactionTypes } from "@/shared/enums/transactionTypes";
import { ScrollView, View } from "react-native";

import { TransactionCard } from "./TransactionCard";
import { FilterInput } from "./FilterInput";

export const ListHeader = () => {
	const { totalTransactions } = useTransactionContext();

	return (
		<>
			<AppHeader />

			<View className="h-[150px] w-full">
				<View className="h-[50%] bg-background-primary" />

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="absolute pl-6 h-[141px]"
				>
					<TransactionCard
						type={TransactionTypes.expense}
						amount={totalTransactions.expense}
					/>

					<TransactionCard
						type={TransactionTypes.revenue}
						amount={totalTransactions.revenue}
					/>

					<TransactionCard
						type="total"
						amount={totalTransactions.total}
					/>
				</ScrollView>
			</View>

			<FilterInput />
		</>
	);
};

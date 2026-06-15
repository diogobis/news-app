import { useTransactionContext } from "@/context/transaction.context";
import { colors } from "@/shared/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export const FilterInput = () => {
	const { pagination, searchText, setSearchText, fetchTransactions } =
		useTransactionContext();

	const [text, setText] = useState("");

	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchText(text);
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [text]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				await fetchTransactions({
					page: 1,
				});
			} catch (error) {}
		};

		fetchData();
	}, [searchText]);

	return (
		<View className="w-[90%] self-center mt-4 mb-3">
			<View className="w-full flex-row justify-between items-center">
				<Text className="text-white text-xl font-bold">Transações</Text>

				<Text className="text-gray-700 text-base">
					{pagination.totalRows}{" "}
					{pagination.totalRows === 1 ? "item" : "itens"}
				</Text>
			</View>

			<TouchableOpacity className="flex-row items-center justify-between mt-6">
				<TextInput
					className="h-[50px] text-white w-full bg-background-primary text-lg pl-4"
					placeholder="Busque uma transação"
					placeholderTextColor={colors.gray[600]}
					value={text}
					onChangeText={setText}
				/>

				<TouchableOpacity className="absolute right-0 mr-3">
					<MaterialIcons
						name="filter-list"
						color={colors["accent-brand-light"]}
						size={26}
					/>
				</TouchableOpacity>
			</TouchableOpacity>
		</View>
	);
};

import { useTransactionContext } from "@/context/transaction.context";
import Checkbox from "expo-checkbox";
import { FC, useMemo, useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import clsx from "clsx";

interface SelectCategoryModalProps {
	selectedCategory: number;
	onSelect: (categoryId: number) => void;
}

export const SelectCategoryModal: FC<SelectCategoryModalProps> = ({
	selectedCategory,
	onSelect,
}) => {
	const { categories } = useTransactionContext();

	const [showModal, setShowModal] = useState(false);

	const selected = useMemo(
		() => categories.find((category) => category.id === selectedCategory),
		[categories, selectedCategory],
	);

	const handleModal = () => {
		setShowModal((prevState) => !prevState);
	};

	const handleSelect = (categoryId: number) => {
		onSelect(categoryId);
		setShowModal(false);
	};

	return (
		<>
			<TouchableOpacity
				className="my-2 rounded-md pl-4 h-[50px] bg-background-primary justify-center"
				onPress={handleModal}
			>
				<Text
					className={clsx(
						"text-lg",
						selected ? "text-white" : "text-gray-700",
					)}
				>
					{selected?.name || "Categoria"}
				</Text>
			</TouchableOpacity>

			<Modal visible={showModal} transparent animationType="slide">
				<View className="flex-1 items-center justify-center bg-black/50">
					<View className="w-[90%] bg-background-secondary p-4 rounded-xl">
						<Text className="text-white text-lg mb-4">
							Selecione uma categoria
						</Text>

						<FlatList
							data={categories}
							keyExtractor={(item) => `category-${item.id}`}
							renderItem={({ item }) => (
								<TouchableOpacity
									className="flex-row items-center bg-gray-800 rounded-lg mb-2 p-4"
									onPress={() => handleSelect(item.id)}
								>
									<Checkbox
										className="mr-2"
										value={selected?.id === item.id}
										onValueChange={() =>
											handleSelect(item.id)
										}
									/>

									<Text className="text-white text-center text-lg">
										{item.name}
									</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</View>
			</Modal>
		</>
	);
};

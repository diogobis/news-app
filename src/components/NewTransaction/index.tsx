import { useBottomSheetContext } from "@/context/bottom-sheet.context";
import { colors } from "@/shared/colors";
import { CreateTransactionRequest } from "@/shared/interfaces/http/createTransactionRequest";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from "react-native";
import CurrencyInput from "react-native-currency-input";
import { TransactionTypeSelector } from "@/components/TransactionTypeSelector";
import { SelectCategoryModal } from "@/components/SelectCategoryModal";
import { transactionSchema } from "./schema";
import * as yup from "yup";
import { AppButton } from "@/components/AppButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useTransactionContext } from "@/context/transaction.context";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";

type ValidationErrorsTypes = Record<keyof CreateTransactionRequest, string>;

export const NewTransaction = () => {
	const [transaction, setTransaction] = useState<CreateTransactionRequest>({
		description: "",
		typeId: 0,
		categoryId: 0,
		value: 0,
	});
	const [validationErrors, setValidationErrors] =
		useState<ValidationErrorsTypes>({} as ValidationErrorsTypes);
	const [loading, setLoading] = useState(false);

	const { closeBottomSheet } = useBottomSheetContext();
	const { createTransaction } = useTransactionContext();
	const { errorHandler } = useErrorHandler();

	const handleCreateTransaction = async () => {
		try {
			setLoading(true);

			await transactionSchema.validate(transaction, {
				abortEarly: false,
			});

			setValidationErrors({} as ValidationErrorsTypes);

			await createTransaction(transaction);
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				const errors = {} as ValidationErrorsTypes;

				error.inner.forEach((err) => {
					if (err.path) {
						errors[err.path as keyof CreateTransactionRequest] =
							err.message;
					}
				});

				setValidationErrors(errors);
			} else {
				errorHandler(error, "Falha ao criar transação");
			}
		} finally {
			setLoading(false);
		}
	};

	const setTransactionData = (
		key: keyof CreateTransactionRequest,
		value: string | number,
	) => {
		setTransaction((prevData) => ({
			...prevData,
			[key]: value,
		}));
	};

	return (
		<View className="px-8">
			<View className="w-full flex-row items-center justify-between">
				<Text className="text-white text-xl font-bold">
					Nova transação
				</Text>

				<TouchableOpacity onPress={closeBottomSheet}>
					<MaterialIcons
						name="close"
						color={colors.gray[700]}
						size={20}
					/>
				</TouchableOpacity>
			</View>

			<View className="flex-1 mt-8 mb-8">
				<TextInput
					className="text-white text-lg h-[50px] bg-background-primary my-2 rounded-md pl-4"
					placeholder="Descrição"
					placeholderTextColor={colors.gray[700]}
					value={transaction.description}
					onChangeText={(text) =>
						setTransactionData("description", text)
					}
				/>

				{validationErrors.description && (
					<ErrorMessage>{validationErrors.description}</ErrorMessage>
				)}

				<CurrencyInput
					className="text-white text-lg h-[50px] bg-background-primary my-2 rounded-md pl-4"
					value={transaction.value}
					prefix="R$ "
					delimiter="."
					separator=","
					precision={2}
					minValue={0}
					onChangeValue={(value) =>
						setTransactionData("value", value ?? 0)
					}
				/>

				{validationErrors.value && (
					<ErrorMessage>{validationErrors.value}</ErrorMessage>
				)}

				<SelectCategoryModal
					selectedCategory={transaction.categoryId}
					onSelect={(categoryId) =>
						setTransactionData("categoryId", categoryId)
					}
				/>

				{validationErrors.categoryId && (
					<ErrorMessage>{validationErrors.categoryId}</ErrorMessage>
				)}

				<TransactionTypeSelector
					typeId={transaction.typeId}
					setTransactionType={(typeId) =>
						setTransactionData("typeId", typeId)
					}
				/>

				{validationErrors.typeId && (
					<ErrorMessage>{validationErrors.typeId}</ErrorMessage>
				)}

				<View className="mt-6">
					<AppButton onPress={handleCreateTransaction}>
						{loading ? (
							<ActivityIndicator color={colors.white} />
						) : (
							"Registrar"
						)}
					</AppButton>
				</View>
			</View>
		</View>
	);
};

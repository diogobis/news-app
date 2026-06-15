import { colors } from "@/shared/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
	TextInputProps,
	View,
	Text,
	TouchableOpacity,
	TextInput,
} from "react-native";
import { useRef, useState } from "react";
import clsx from "clsx";

import { ErrorMessage } from "@/components/ErrorMessage";

interface AppInputParams<T extends FieldValues> extends TextInputProps {
	control: Control<T>;
	name: Path<T>;
	leftIconName?: keyof typeof MaterialIcons.glyphMap;
	label?: string;
}

export const AppInput = <T extends FieldValues>({
	control,
	name,
	label,
	leftIconName,
	secureTextEntry,
	...rest
}: AppInputParams<T>) => {
	const [isFocused, setIsFocused] = useState(false);
	const [showText, setShowText] = useState(secureTextEntry);
	const inputRef = useRef<TextInput>(null);

	const checkFocus = () => {
		if (inputRef.current) {
			setIsFocused(inputRef.current.isFocused());
		}
	};

	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				return (
					<View className="w-full">
						{label && (
							<Text
								className={clsx(
									"mb-2 mt-3 text-base",
									isFocused
										? "text-accent-brand"
										: "text-gray-600",
								)}
							>
								{label}
							</Text>
						)}
						<TouchableOpacity className="flex-row items-center justify-between border-b border-gray-600 px-3 py-2 h-16">
							{leftIconName && (
								<MaterialIcons
									name={leftIconName}
									size={24}
									color={
										isFocused
											? colors["accent-brand"]
											: colors.gray[600]
									}
									className="mr-2"
								/>
							)}
							<TextInput
								{...rest}
								ref={inputRef}
								value={value}
								onChangeText={onChange}
								onFocus={checkFocus}
								onEndEditing={checkFocus}
								placeholderTextColor={colors.gray[700]}
								secureTextEntry={showText}
								className="flex-1 text-base text-gray-500"
							/>
							{secureTextEntry && (
								<TouchableOpacity
									onPress={() =>
										setShowText((value) => !value)
									}
								>
									<MaterialIcons
										name={
											showText
												? "visibility"
												: "visibility-off"
										}
										color={colors.gray[600]}
										size={24}
									/>
								</TouchableOpacity>
							)}
						</TouchableOpacity>
						{error && <ErrorMessage>{error.message}</ErrorMessage>}
					</View>
				);
			}}
		/>
	);
};

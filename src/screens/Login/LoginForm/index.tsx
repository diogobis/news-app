import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";

import { PublicStackParamsList } from "@/shared/interfaces/navigation.types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "./schema";

import { useAuthContext } from "@/context/auth.context";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import { colors } from "@/shared/colors";

export interface FormLoginParams {
	email: string;
	password: string;
}

export const LoginForm = () => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		resolver: yupResolver(schema),
	});
	const { handleAuthenticate } = useAuthContext();
	const { errorHandler } = useErrorHandler();

	const navigation =
		useNavigation<StackNavigationProp<PublicStackParamsList>>();

	const onSubmit = async (userData: FormLoginParams) => {
		try {
			await handleAuthenticate(userData);
		} catch (error) {
			errorHandler(error, "Falha ao logar");
		}
	};

	return (
		<>
			<AppInput
				control={control}
				name="email"
				label="Email"
				leftIconName="email"
				placeholder="mail@example.br"
			/>

			<AppInput
				control={control}
				name="password"
				label="Senha"
				leftIconName="lock-outline"
				placeholder="Sua senha"
				secureTextEntry
			/>

			<View className="flex-1 justify-between mt-8 mb-8 min-h-[250px]">
				<View className="mt-6">
					<AppButton
						iconName="arrow-forward"
						onPress={handleSubmit(onSubmit)}
					>
						{isSubmitting ? (
							<ActivityIndicator color={colors.white} />
						) : (
							"Login"
						)}
					</AppButton>
				</View>
				<View>
					<Text className="mb-6 text-gray-400 text-base">Ainda não possui uma conta?</Text>

					<AppButton
						mode="outline"
						onPress={() => navigation.navigate("Register")}
					>
						Cadastrar
					</AppButton>
				</View>
			</View>
		</>
	);
};

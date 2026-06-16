import { useKeyboardVisible } from "@/shared/hooks/useKeyboardVisible";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/shared/colors";

export const AuthHeader = () => {
	const keyboardIsVisible = useKeyboardVisible();

	if (keyboardIsVisible) {
		return <></>;
	}

	return (
		<View className="items-center justify-center h-40">
			<MaterialIcons name="newspaper" color={colors.white} size={64} />
		</View>
	);
};

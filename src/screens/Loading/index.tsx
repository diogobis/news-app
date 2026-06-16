import { colors } from "@/shared/colors";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import { FC, useEffect } from "react";
import { useAuthContext } from "@/context/auth.context";

interface LoadingParams {
	setLoading: (value: boolean) => void;
}

export const Loading: FC<LoadingParams> = ({ setLoading }) => {
	const { restoreUserSession, handleLogout } = useAuthContext();

	useEffect(() => {
		(async () => {
			try {
				const user = await restoreUserSession();

				if (!user) {
					await handleLogout();
				}
			} catch {
				await handleLogout();
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
			<MaterialIcons name="newspaper" color={colors.white} size={64} />

			<ActivityIndicator color={colors.white} className="mt-20" />
		</SafeAreaView>
	);
};

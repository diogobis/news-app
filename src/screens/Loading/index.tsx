import { colors } from "@/shared/colors";
import { ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
		// <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
			<>
				<Image
					source={require("@/assets/logo.png")}
					className="h-[48px] w-[255px]"
				/>

				<ActivityIndicator color={colors.white} className="mt-20" />
			</>
		// </SafeAreaView>
	);
};

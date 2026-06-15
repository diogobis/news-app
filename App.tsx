import "./src/styles/global.css";

import { SnackBar } from "@/components/SnackBar";
import { AuthContextProvider } from "@/context/auth.context";
import { BottomSheetProvider } from "@/context/bottom-sheet.context";
import { SnackbarContextProvider } from "@/context/snackbar.context";
import { NewsContextProvider } from "@/context/news.context";
import { UserFeaturesContextProvider } from "@/context/user-features.context";
import NavigationRoutes from "@/routes";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
	return (
		<GestureHandlerRootView className="flex-1">
			<SnackbarContextProvider>
				<AuthContextProvider>
					<NewsContextProvider>
						<UserFeaturesContextProvider>
							<BottomSheetProvider>
								<NavigationRoutes />

								<SnackBar />
							</BottomSheetProvider>
						</UserFeaturesContextProvider>
					</NewsContextProvider>
				</AuthContextProvider>
			</SnackbarContextProvider>
		</GestureHandlerRootView>
	);
}

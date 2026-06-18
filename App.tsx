import "./src/styles/global.css";

import { SnackBar } from "@/components/SnackBar";
import { AuthContextProvider } from "@/context/auth.context";
import { SnackbarContextProvider } from "@/context/snackbar.context";
import { NewsContextProvider } from "@/context/news.context";
import { UserFeaturesContextProvider } from "@/context/user-features.provider";
import { CommentsContextProvider } from "@/context/comments.context";
import NavigationRoutes from "@/routes";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
	return (
		<GestureHandlerRootView className="flex-1">
			<SnackbarContextProvider>
				<AuthContextProvider>
					<NewsContextProvider>
						<UserFeaturesContextProvider>
							<CommentsContextProvider>
								<NavigationRoutes />

								<SnackBar />
							</CommentsContextProvider>
						</UserFeaturesContextProvider>
					</NewsContextProvider>
				</AuthContextProvider>
			</SnackbarContextProvider>
		</GestureHandlerRootView>
	);
}

import "./src/styles/global.css";

import { SnackBar } from "@/components/SnackBar";
import { AuthContextProvider } from "@/context/auth.context";
import { BottomSheetProvider } from "@/context/bottom-sheet.context";
import { SnackbarContextProvider } from "@/context/snackbar.context";
import { TransactionContextProvider } from "@/context/transaction.context";
import NavigationRoutes from "@/routes";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
	return (
		<GestureHandlerRootView className="flex-1">
			<SnackbarContextProvider>
				<AuthContextProvider>
					<TransactionContextProvider>
						<BottomSheetProvider>
							<NavigationRoutes />

							<SnackBar />
						</BottomSheetProvider>
					</TransactionContextProvider>
				</AuthContextProvider>
			</SnackbarContextProvider>
		</GestureHandlerRootView>
	);
}

import { NavigationContainer } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { SystemBars } from "react-native-edge-to-edge";

import { PrivateRoutes } from "./PrivateRoutes";
import { PublicRoutes } from "./PublicRoutes";

import { useAuthContext } from "@/context/auth.context";
import { Loading } from "@/screens/Loading";

const NavigationRoutes = () => {
	const { user, token } = useAuthContext();
	const [loading, setLoading] = useState(true);

	const Routes = useCallback(() => {
		if (loading) {
			return <Loading setLoading={setLoading} />;
		}

		if (!user || !token) {
			return <PublicRoutes />;
		}

		return <PrivateRoutes />;
	}, [user, token, loading]);

	return (
		<NavigationContainer>
			<SystemBars style="light" />
			<Routes />
		</NavigationContainer>
	);
};

export default NavigationRoutes;

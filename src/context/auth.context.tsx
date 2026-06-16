import { FormLoginParams } from "@/screens/Login/LoginForm";
import { FormRegisterParams } from "@/screens/Register/RegisterForm";
import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import * as AuthServices from "@/shared/services/news/auth.service";
import { IUser } from "@/shared/interfaces/user.interface";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { IAuthenticateResponse } from "@/shared/interfaces/authenticate-response.interface";
import { setLogoutListener } from "@/shared/helpers/axios.helper";

type AuthContextType = {
	user: IUser | null;
	token: string | null;
	handleAuthenticate: (params: FormLoginParams) => Promise<void>;
	handleRegister: (params: FormRegisterParams) => Promise<void>;
	handleLogout: () => Promise<void>;
	restoreUserSession: () => Promise<string | null>;
};

export const AuthContext = createContext({} as AuthContextType);

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<IUser | null>(null);
	const [token, setToken] = useState<string | null>(null);

	const handleAuthenticate = useCallback(async (userData: FormLoginParams) => {
		const { user, token } = await AuthServices.authenticate(userData);

		await AsyncStorage.setItem(
			"news-user",
			JSON.stringify({
				user,
				token,
			}),
		);

		setUser(user);
		setToken(token);
	}, []);

	const handleRegister = useCallback(async (formData: FormRegisterParams) => {
		const { user, token } = await AuthServices.registerUser(formData);

		await AsyncStorage.setItem(
			"news-user",
			JSON.stringify({
				user,
				token,
			}),
		);

		setUser(user);
		setToken(token);
	}, []);

	const restoreUserSession = useCallback(async () => {
		const userData = await AsyncStorage.getItem("news-user");

		if (userData) {
			try {
				const parsed = JSON.parse(userData) as IAuthenticateResponse;
				const payload = JSON.parse(atob(parsed.token.split(".")[1]));

				if (payload.exp && payload.exp * 1000 < Date.now()) {
					await AsyncStorage.clear();
					return null;
				}

				setUser(parsed.user);
				setToken(parsed.token);
			} catch {
				await AsyncStorage.clear();
				return null;
			}
		}

		return userData;
	}, []);

	const handleLogout = useCallback(async () => {
		await AsyncStorage.clear();

		setToken(null);
		setUser(null);
	}, []);

	useEffect(() => {
		setLogoutListener(handleLogout)
		return () => setLogoutListener(null)
	}, [handleLogout])

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				handleAuthenticate,
				handleRegister,
				handleLogout,
				restoreUserSession,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);

	return context;
};

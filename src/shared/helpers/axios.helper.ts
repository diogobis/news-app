import { IAuthenticateResponse } from "@/shared/interfaces/authenticate-response.interface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosInstance } from "axios";

type LogoutListener = () => void
let logoutListener: LogoutListener | null = null

export const setLogoutListener = (listener: LogoutListener | null) => {
	logoutListener = listener
}

export const addTokenToRequest = (axiosInstance: AxiosInstance) => {
	axiosInstance.interceptors.request.use(async (config) => {
		const userData = await AsyncStorage.getItem("news-user");

		if (userData) {
			const { token } = JSON.parse(userData) as IAuthenticateResponse;

			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		return config;
	});

	axiosInstance.interceptors.response.use(
		(response) => response,
		async (error) => {
			if (error.response?.status === 401) {
				await AsyncStorage.clear()
				logoutListener?.()
			}
			throw error
		},
	)
};

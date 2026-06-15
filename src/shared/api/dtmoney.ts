import axios from "axios";
import { Platform } from "react-native";
import { AppError } from "@/shared/helpers/appError";
import { addTokenToRequest } from "@/shared/helpers/axios.helper";

const baseURL = Platform.select({
	ios: "http://localhost:3001",
	android: "http://10.0.2.2:3001",
	web: "http://localhost:3001",
	windows: "http://localhost:3001",
});

export const dtMoneyApi = axios.create({
	baseURL,
});

addTokenToRequest(dtMoneyApi);

dtMoneyApi.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.data) {
			return Promise.reject(new AppError(error.response.data.message));
		}

		return Promise.reject(new AppError("Falha na requisição"));
	},
);

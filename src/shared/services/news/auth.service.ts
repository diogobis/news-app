import { newsApi } from "@/shared/api/news";

import { FormLoginParams } from "@/screens/Login/LoginForm";
import { FormRegisterParams } from "@/screens/Register/RegisterForm";

import { IAuthenticateResponse } from "@/shared/interfaces/authenticate-response.interface";

export const authenticate = async (
	userData: FormLoginParams,
): Promise<IAuthenticateResponse> => {
	const { data } = await newsApi.post<{ data: IAuthenticateResponse }>(
		"/auth/login",
		{
			emailOrUsername: userData.email,
			password: userData.password,
		},
	);
	return data.data;
};

export const registerUser = async (
	userData: FormRegisterParams,
): Promise<IAuthenticateResponse> => {
	const { data } = await newsApi.post<{ data: IAuthenticateResponse }>(
		"/auth/register",
		{
			email: userData.email,
			username: userData.name,
			password: userData.password,
		},
	);

	return data.data;
};

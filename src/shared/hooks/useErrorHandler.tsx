import { useSnackbarContext } from "@/context/snackbar.context";
import { AppError } from "@/shared/helpers/appError";

export const useErrorHandler = () => {
	const { notify } = useSnackbarContext();

	const errorHandler = (error: unknown, defaultMessage?: string) => {
		const isAppError = error instanceof AppError;

		const message = isAppError
			? error.message
			: defaultMessage || "Falha na requisição";

		notify({
			message,
			messageType: "error",
		});
	};

	return {
		errorHandler,
	};
};

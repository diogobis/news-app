import {
	FC,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

export type SnackbarMessageType = "error" | "success";

interface NotifyMessageParams {
	message: string;
	messageType: SnackbarMessageType;
}

export type SnackbarContextType = {
	message: string | null;
	type: SnackbarMessageType | null;
	notify: (params: NotifyMessageParams) => void;
};

export const SnackbarContext = createContext({} as SnackbarContextType);

export const SnackbarContextProvider: FC<PropsWithChildren> = ({
	children,
}) => {
	const [message, setMessage] = useState<string | null>(null);
	const [type, setType] = useState<SnackbarMessageType | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const notify = useCallback(({ message, messageType }: NotifyMessageParams) => {
		setMessage(message);
		setType(messageType);

		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		timeoutRef.current = setTimeout(() => {
			setMessage(null);
			setType(null);
		}, 3000);
	}, []);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	return (
		<SnackbarContext.Provider
			value={{
				message,
				type,
				notify,
			}}
		>
			{children}
		</SnackbarContext.Provider>
	);
};

export const useSnackbarContext = () => {
	const context = useContext(SnackbarContext);
	return context;
};

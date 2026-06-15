export const moneyMapper = (value: number) => {
	return value.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

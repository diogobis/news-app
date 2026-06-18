import * as yup from "yup";

export const schema = yup.object().shape({
	keyword: yup
		.string()
		.trim()
		.min(3, "A palavra deve ter no mínimo 3 caracteres")
		.max(100, "A palavra deve ter no máximo 100 caracteres")
		.required("A palavra é obrigatória"),
});

import * as yup from "yup";

export const schema = yup.object().shape({
	editContent: yup
		.string()
		.trim()
		.min(1, "O comentário não pode estar vazio")
		.max(1000, "O comentário deve ter no máximo 1000 caracteres")
		.required("O comentário é obrigatório"),
});

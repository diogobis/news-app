import * as yup from "yup";

export const schema = yup.object().shape({
	email: yup
		.string()
		.email("E-mail inválido")
		.required("E-mail é obrigatório"),

	password: yup
		.string()
		.min(8, "A senha deve ter no mínimo 8 caracteres")
		.required("A senha é obrigatória"),
});

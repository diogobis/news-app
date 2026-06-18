import * as yup from "yup";

export const schema = yup.object().shape({
	name: yup.string().required("Nome é obrigatório"),

	email: yup
		.string()
		.email("E-mail inválido")
		.required("E-mail é obrigatório"),

	password: yup
		.string()
		.min(8, "A senha deve ter no mínimo 8 caracteres")
		.required("A senha é obrigatória"),

	confirmPassword: yup
		.string()
		.oneOf([yup.ref("password")], "As senhas devem ser iguais")
		.required("Confirmação de senha é obrigatória"),
});

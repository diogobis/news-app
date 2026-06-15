export interface CreateTransactionRequest {
	description: string;
	typeId: number;
	categoryId: number;
	value: number;
}

export interface UpdateTransactionRequest {
	id: number;
	description: string;
	typeId: number;
	categoryId: number;
	value: number;
}

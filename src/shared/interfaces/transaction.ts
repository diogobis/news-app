export interface Transaction {
	id: number;
	userId: number;
	typeId: number;
	categoryId: number;
	value: number;
	description: string;
	createdAt: string;
	updatedAt: string;
	type: {
		id: number;
		name: string;
	};
	category: {
		id: number;
		name: string;
	};
}

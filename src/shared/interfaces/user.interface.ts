export interface IUser {
	id: number;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

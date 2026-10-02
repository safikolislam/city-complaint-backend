export interface IRegisterPayload {
	name: string;
	email: string;
	password: string;
	phone?: string;
}

export interface ILoginPayload {
	email: string;
	password: string;
}

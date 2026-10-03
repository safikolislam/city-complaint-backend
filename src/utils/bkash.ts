import config from "../config";

const base_url = config.bkash_base_url as string;
const username = config.bkash_username as string;
const password = config.bkash_password as string;
const app_key = config.bkash_app_key as string;
const app_secret = config.bkash_app_secret as string;

const baseHeaders = {
	"Content-Type": "application/json",
	Accept: "application/json",
};

export const getBkashIdToken = async (): Promise<string> => {
	const res = await fetch(`${base_url}/tokenized/checkout/token/grant`, {
		method: "POST",
		headers: { ...baseHeaders, username, password },
		body: JSON.stringify({ app_key, app_secret }),
	});
	const data = (await res.json()) as {
		id_token?: string;
		statusMessage?: string;
	};
	if (!data.id_token) {
		throw new Error(data.statusMessage ?? "bKash token grant failed");
	}
	return data.id_token;
};

const authHeaders = (idToken: string) => ({
	...baseHeaders,
	authorization: idToken,
	"x-app-key": app_key,
});

export const createBkashPayment = async (input: {
	amount: string;
	invoiceNumber: string;
	callbackURL: string;
	payerReference: string;
}) => {
	const idToken = await getBkashIdToken();
	const res = await fetch(`${base_url}/tokenized/checkout/create`, {
		method: "POST",
		headers: authHeaders(idToken),
		body: JSON.stringify({
			mode: "0011",
			payerReference: input.payerReference,
			callbackURL: input.callbackURL,
			amount: input.amount,
			currency: "BDT",
			intent: "sale",
			merchantInvoiceNumber: input.invoiceNumber,
		}),
	});
	return (await res.json()) as {
		paymentID?: string;
		bkashURL?: string;
		statusCode?: string;
		statusMessage?: string;
	};
};

export const executeBkashPayment = async (paymentID: string) => {
	const idToken = await getBkashIdToken();
	const res = await fetch(`${base_url}/tokenized/checkout/execute`, {
		method: "POST",
		headers: authHeaders(idToken),
		body: JSON.stringify({ paymentID }),
	});
	return (await res.json()) as {
		statusCode?: string;
		statusMessage?: string;
		trxID?: string;
		transactionStatus?: string;
		amount?: string;
		merchantInvoiceNumber?: string;
	};
};
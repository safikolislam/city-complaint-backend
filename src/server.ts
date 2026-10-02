import app from "./app";
import "dotenv/config";
import config from "./config";

const PORT = config.port;

async function main() {
	try {
		// await prisma.$connect();
		console.log("connected to the database successfully.");
		app.listen(PORT, () => {
			console.log(`server is running on port ${PORT}`);
		});
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
}
main();

import app from "./app";

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    })
  } catch (error) {
    console.log(error);
    process.exit(1)
  }

}
main();
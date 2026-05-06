import app from "./src/app.js";
import connectDB from "./src/config/database.js";

connectDB();

const PROT = 3000;

app.listen(PROT, () => {
	console.log('Server is running on port no 3000');
});

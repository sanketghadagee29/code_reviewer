// server.js
import { config } from "dotenv";
config(); // ← must be before ALL other imports

import app from "./src/app.js";

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
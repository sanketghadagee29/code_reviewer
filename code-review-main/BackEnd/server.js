import "dotenv/config";

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

console.log("API Key Loaded:", !!process.env.GROQ_API_KEY);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
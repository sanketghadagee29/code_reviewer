import Groq from "groq-sdk";
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
async function generateContent(prompt) {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", 
        messages: [
            {
                role: "system",
                content: "You are an expert code reviewer. Review the given code and provide detailed feedback on bugs, performance, security, and best practices. Format your response in markdown. Even if the code looks good, provide feedback on potential edge cases or improvements like how much % of code is right , syntax % is correct, how much % of code is efficient, how much % of code is secure, how much % of code follows best practices. "
            },
            {
                role: "user",
                content: prompt
            }
        ]
    });
    return response.choices[0].message.content;
}

export default generateContent;




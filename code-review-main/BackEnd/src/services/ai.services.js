import Groq from "groq-sdk";

async function generateContent(prompt) {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content:
                    "You are an expert code reviewer. Review the given code and provide detailed feedback on bugs, performance, security, and best practices. Format your response in markdown."
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
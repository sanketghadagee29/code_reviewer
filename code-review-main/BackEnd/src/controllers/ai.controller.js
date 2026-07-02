// Must import with 's' matching your actual filename
import generateContent from "../services/ai.services.js";

const getReview = async (req, res) => {
    try {
        const { code } = req.body;
        const response = await generateContent(code);
        res.status(200).send(response);
    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export default { getReview };
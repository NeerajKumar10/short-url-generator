const shortid = require('shortid');
const URL = require("../models/url");

async function handleGenerateShortID(req, res) {
    const { URL: redirectURL } = req.body;

    if (!redirectURL) {
        return res.status(400).json({ error: "Missing redirectURL in the request body" });
    }

    try {
        const shortID = shortid();
        await URL.create({
            shortId: shortID,
            redirectURL,
            visitHistory: []
        });

        return res.status(201).render("home" , { id: shortID });
    } catch (error) {
        console.error("Error generating short URL:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


   


module.exports = {
    handleGenerateShortID,

};

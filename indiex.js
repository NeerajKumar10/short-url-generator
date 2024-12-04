const express = require("express");
const path =require("path");
const { connectToMongoDB } = require("./server");
const staticRoute = require("./routes/staticRoute");
const userRoutes = require("./routes/url");
const URL = require("./models/url")

const app = express();
const PORT = 8007;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
connectToMongoDB(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err.message));


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/test', async (req,res) =>{
    const allUrls = await URL.find({});

    return res.render("home",{
        urls : allUrls,
    });

})

app.get("/url/:shortId", async (req,res) =>{
    const shortId = req.params.shortId;

    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now()
                    }
                }
            },
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error("Error handling redirect:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/analytics/:shortId", async (req,res) =>{
    const shortId = req.params.shortId;

    // if (!/^[a-zA-Z0-9]{6,}$/.test(shortId)) {
    //     return res.status(400).json({ error: "Invalid short URL ID format" });
    // }

    try {
        const result = await URL.findOne({ shortId });
        if (!result) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        return res.status(200).json({
            totalClicks: result.visitHistory.length,
            analytic: result.visitHistory
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Routes
app.use("/url", userRoutes);
app.use("/",staticRoute);

// Server Listener
app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});

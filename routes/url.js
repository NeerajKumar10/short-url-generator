const express = require("express");
const { handleGenerateShortID } = require("../controllers/url");

const router = express.Router();

router.post("/", handleGenerateShortID);



module.exports = router;

// const express = require("express");
// const router = express.Router();
// const women = require("../models/women");

// // Search endpoint
// router.get("/search", async (req, res) => {
//   try {
//     const query = req.query.q; // Get search term from URL (?q=...)
//     const results = await Product.find(
//       { $text: { $search: query } }, // MongoDB full-text search
//       { score: { $meta: "textScore" } } // Sort by relevance
//     )
//       .sort({ score: { $meta: "textScore" } })
//       .limit(5); // Return top 5 matches

//     res.json(results);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;

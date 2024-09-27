const express = require("express");
const router = express.Router();
const Event = require("../models/event");

// Assuming you have some authentication middleware to get the logged-in student's ID

router.get("/", async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events
    res.render("student-dashboard", { events }); // Pass events to the view
  } catch (err) {
    console.error(err);
    res.send("Error fetching events.");
  }
});

module.exports = router;

// Import necessary libraries and modules
import express from "express";
import { sendEmail } from "../email/sendEmail";

// Create a router instance
const router = express.Router();

router.post("/send-email-contact", async (req, res) => {
  try {
    await sendEmail({
      to: "bombaytaxicompany@gmail.com",
      subject: req.body.subject,
      message: req.body.message,
    });
    res.send({ message: "Email sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to send email." });
  }
});

router.post("/send-email-attach-taxi", async (req, res) => {
  try {
    await sendEmail({
      to: "bombaytaxicompany@gmail.com",
      subject: req.body.subject,
      message: req.body.message,
    });
    res.send({ message: "Email sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to send email." });
  }
});

// Export the router
export default router;

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SK);

const router = express.Router();


router.post("/payment", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.productPrice * 100,
      currency: "eur",
      description: req.fields.title,
      source: req.fields.stripeToken,
    });
    console.log(response.status);
    if (response.status === "succeeded") {
      res.status(200).json({ message: "Paiement validée" });
    } else {
      res.status(400).json({ message: "An error occurred" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
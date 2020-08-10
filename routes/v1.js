const stripe = require("stripe");
const express = require("express");
const router = express.Router();

router.post("/webhook", (req, res, next) => {
  res.json({
    message: "webhook",
  });
  // const sig = req.headers["stripe-signature"];
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     req.body.rawBody,
  //     sig,
  //     process.env.STRIPE_WHSEC
  //   );
  // } catch (err) {
  //   return res.send({ message: "Stripe - webhook error" });
  // }
  // console.log(event);
  // // handle type of webhook
  // switch (event.type) {
  //   case "payment_intent.succeeded":
  //     // payment success
  //     console.log("success :D");
  //     break;
  //   case "payment_intent.payment_failed":
  //     // payment failed
  //     console.log("failed :D");
  //     break;
  // }
});

module.exports = router;

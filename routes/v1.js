const stripe = require("stripe");
const express = require("express");
const router = express.Router();
const { catchAsync } = require("../middleware/errors");
const Order = require("../models/order");

const endpointSecret = process.env.STRIPE_WHSEC;

router.post(
  "/webhook",
  catchAsync(async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const order = Order.findOne({
        "session.id": session.id,
      });
      if (!order) {
        return res.status(400).send(`Not found order`);
      }
      order.paid = true;
      order.status = "in progress";
      await order.save();

      return es.json({ received: true });
    }
  })
);

module.exports = router;

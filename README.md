# node-shop

# todo

- fix payments (orders)
- order paid, complete etc
- webhook!!
- improve design
- add animations

## Table of Contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Status](#status)
- [Installation](#installation)
- [Inspiration](#inspiration)

## General info

> payments with stripe checkout
> sending emails
> invoices - generate pdf
> permissions (is-login, is-admin, anonymous)

## Technologies

- express
- ejs
- mongodb (mongoose)
- stripe
- sendgrid

## Status

End. In the future you can add webhooks to your payment for convenience.

## Installation

1. clone
2. add file .env
3. set variables
   `MONGO_CONNECT SESSION_SECRET SENDGRID_KEY STRIPE_SECRET_KEY - backend STRIPE_PUBLISHABLE_KEY - frontend`

4. add server.key - private
5. add server.cert - certificate

Usefull:
[https://www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv)
[https://letsencrypt.org/](https://letsencrypt.org/)

## Inspiration

[https://www.youtube.com/channel/UCSJbGtTlrDami-tDGPUV9-w](https://www.youtube.com/channel/UCSJbGtTlrDami-tDGPUV9-w)

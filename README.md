Signature Service for Bitcoin (BTC)
=====================================

<URL>

How does this work?
----------------

Signature service is used in conjunction with Wallet service to enable secure signing and transaction related functionality for blockchain. Since different blockchain have nuance differences, this services are application specific.

This service should not be called directly (besides during testing) and should only be called through Wallet Aggregator in production. This is to  prevent errors from sending coins on main net. Safeguards are applied on Wallet Aggregator that always defaults any calls to testnet.

Application Flow
-------

Client UI <-> Wallet Aggregator <-> Wallet Service <-> Signature Service

Blockchain Differences
-------

- UXTO

Available End points
-------
- GET /test
- GET /wallet?network=<network>&nonce=<nonce>

ENV parameters
-------
Available at ./instructions/env.md

## Instructions

To test application:

```bash
$ npm test
```

Install NPM modules on fresh deployment:

```bash
$ npm install
```

To run in development mode:

```bash
$ node index.js
```

To run in production mode:

```bash
$ pm2 start sign-svc-btc/index.js --name "sign-btc"
```

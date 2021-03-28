var express = require('express')
var router = express.Router()

const axios = require('axios');

var txBTC = require('../core/transaction.js');

const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)


router.get('/test', (req, res) => {
  return res.send('test');
});

router.get('/generate/seed', asyncHandler(async (req, res, next) => {
  let seed = await txBTC.generateSeed();

  return res.send(seed);
}));

router.post('/wallet', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var nonce = req.body.nonce
  let data = await txBTC.getAddress(network, nonce)

  console.log("data", data)

  return res.send(data);
}));

router.post('/wallet/all', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var nonce = req.body.nonce
  let data = await txBTC.getAddressFull(network, nonce)

  console.log("data", data)

  return res.send(data);
}));

router.post('/send', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var amount = req.body.amount // 10000
  var senderAdd = req.body.senderAdd
  var receiverAdd = req.body.receiverAdd
  var fee = req.body.fee
  var utxo = req.body.utxo
  var change = req.body.change

  let txSigned = await txBTC.txSend(network, senderAdd, receiverAdd, amount, change, fee, utxo);

  console.log("txSigned", txSigned)

  return res.send(txSigned);
}));


router.post('/send/batch', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var totalAmount = req.body.totalAmount
  var senderAddMany = req.body.senderAddMany
  var receiverAddMany = req.body.receiverAddMany
  var fee = req.body.fee
  var utxo = req.body.utxo
  var change = req.body.change
  var useCase = req.body.useCase

  let txSigned = await txBTC.txSendBatch(network, senderAddMany, receiverAddMany, totalAmount, change, fee, utxo, useCase);

  console.log("txSigned", txSigned)

  return res.send(txSigned);
}));

router.post("/xpub", asyncHandler(async (req, res, next) => {
  var network = req.body.network;
  let data = await txBTC.getXpub(network);

  console.log("data", data);
  return res.send(data);
}));

module.exports = router

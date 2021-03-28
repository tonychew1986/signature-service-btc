const request = require('supertest');
const app = require('../index');

var expect  = require('chai').expect;

describe('Basic endpoint to test if service is active', function () {
    it('GET /test', function (done) {
        request(app)
          .get('/test')
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             expect(res.text).to.be.equal('test');
             return done();
          });
    });
});

describe('Wallet endpoint to get address', function () {
    it('GET testnet /wallet', function (done) {
        request(app)
          .post('/wallet')
          .send({
            network: 'testnet',
            nonce: 0
          })
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             var resAddr = res["text"];
             var resAddrHeaderCheck = resAddr.substring(0,1);
             var resAddrLengthCheck = resAddr.length;

             expect(resAddrHeaderCheck).to.not.equal('1');
             expect(resAddrLengthCheck).to.be.equal(34);
             return done();
          });
    });

    it('GET mainnet /wallet', function (done) {
        request(app)
          .post('/wallet')
          .send({
            network: 'mainnet',
            nonce: 0
          })
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             var resAddr = res["text"];
             var resAddrHeaderCheck = resAddr.substring(0,1);
             var resAddrLengthCheck = resAddr.length;

             expect(resAddrHeaderCheck).to.be.equal('1');
             expect(resAddrLengthCheck).to.be.equal(34);
             return done();
          });
    });
});


describe('Wallet endpoint to get xpub', function () {
  it('GET testnet xpub', function (done) {
      request(app)
        .post('/xpub')
        .send({
          network: 'testnet',
        })
        .expect(200)
        .end((err, res) => {
           if (err) {
             return done(err);
           }
           var resXpub = res["text"];

           expect(resXpub).to.be.equal('xpub6DTuBYEk6tGWRKUwyo3uFnVFGWgeiJ9cUzWd5ahffZcmvWuMhh1zRsgJJM7Uob4JEF4gZMnxJkHHfCdjCi3k2kAoLRgnsSC3QU9jx5usnzs');
           return done();
        });
  });

  it('GET mainnet /xpub', function (done) {
      request(app)
        .post('/xpub')
        .send({
          network: 'mainnet',
        })
        .expect(200)
        .end((err, res) => {
           if (err) {
             return done(err);
           }
           var resXpub= res["text"];

           expect(resXpub).to.be.equal('xpub6CHUsb84jryF4p3zpSuqAy84NRdVCnsudCsTQDoZfmSBQZBVXTgMQfDjKAvggpVfrfDwPFojRcWByC86z2R8W9Vx3Z8eZf7sNeLLR5otMpq');
           return done();
        });
  });
});
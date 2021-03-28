
require('dotenv').config()

const config = require('config');

const bip32 = require('bip32');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');

var mnemonicMainnet = process.env.MNEMONIC_MAINNET
var mnemonicTestnet = process.env.MNEMONIC_TESTNET

let generateSeed = async function(){
	const mnemonic = bip39.generateMnemonic();

	return mnemonic
}

let getAddress = async function(network, nonce) {
	var path, param, mnemonic, seed, root;

	if(network == "mainnet"){
		mnemonic = mnemonicMainnet;
		seed = bip39.mnemonicToSeed(mnemonic)
		root = bip32.fromSeed(seed);
		path = root.derivePath("m/44'/0'/0'/0/"+nonce)
		param = { pubkey: path.publicKey }

	}else if(network == "testnet"){
		mnemonic = mnemonicTestnet;
		seed = bip39.mnemonicToSeed(mnemonic)
		root = bip32.fromSeed(seed);
		path = root.derivePath("m/44'/1'/0'/0/"+nonce)
		param = { pubkey: path.publicKey, network: bitcoin.networks.testnet }
	}

	const addr = bitcoin.payments.p2pkh(param).address

	console.log("addr", addr);

  return addr
}

let getAddressFull = async function(network, nonce) {
	var path, param, mnemonic, seed, root;

	let addressArray = [];

	for(var i=0; i<parseInt(nonce); i++){
		if(network == "mainnet"){
			mnemonic = mnemonicMainnet;
			seed = bip39.mnemonicToSeed(mnemonic)
			root = bip32.fromSeed(seed);
			path = root.derivePath("m/44'/0'/0'/0/"+i)
			param = { pubkey: path.publicKey }

		}else if(network == "testnet"){
			mnemonic = mnemonicTestnet;
			seed = bip39.mnemonicToSeed(mnemonic)
			root = bip32.fromSeed(seed);
			path = root.derivePath("m/44'/1'/0'/0/"+i)
			param = { pubkey: path.publicKey, network: bitcoin.networks.testnet }
		}

		let addr = bitcoin.payments.p2pkh(param).address

		addressArray.push(addr);
	}

  return addressArray
}

let txSend = async function(network, senderAdd, receiverAdd, amount, change, fee, utxo) {
	var path, param, seed, root, wif, txb;
	console.log(network, senderAdd, receiverAdd, amount, change, fee, utxo)

	let circuitBreakerNum = 2000; //20
  let circuitBreakerCount = 0;

  var utxoSignArray = [];

  var networkType = bitcoin.networks.testnet;
	var mnemonic = mnemonicTestnet;
	var networkDerivationPath = "1";

  if(network == "mainnet"){
    networkType = bitcoin.networks.mainnet;
		mnemonic = mnemonicMainnet;
		networkDerivationPath = "0";
  }

	seed = bip39.mnemonicToSeed(mnemonic)
	root = bip32.fromSeed(seed, networkType);

	txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet);

	let txHex;

	console.log("-------")

	for(var i = 0; i < 10000; i++){
		path = root.derivePath("m/44'/" + networkDerivationPath + "'/0'/0/"+i)
		param = { pubkey: path.publicKey, network: networkType }

		addr = bitcoin.payments.p2pkh(param).address
		console.log("addr", addr)

		// problem here
		// need to find transaction num of address
		// if tx num > 0 then circuitBreakerCount = 0
		if(circuitBreakerCount <= circuitBreakerNum){
			if(senderAdd == addr){
				const wif = path.toWIF({ network: networkType });

				const key = bitcoin.ECPair.fromWIF(
					wif,
					networkType
				);

				for(var r = 0; r < utxo.length; r++){
					// var txid = utxo[r]["txid"];
					// var vout = utxo[r]["vout"];
					var txid = utxo[r]["utxoId"];
					var vout = parseInt(utxo[r]["vout"]);
					// var vout = utxo[r]["output_no"];

					txb.addInput(txid, vout);
					utxoSignArray.push([r, key]);
				}

				break;
			}else{
				// find tx num here
				// if(){
				// 	circuitBreakerCount = 0;
				// }else
				circuitBreakerCount++;
			}
		}else{
			break;
		}
	}


	amount = parseFloat(amount)
  txb.addOutput(receiverAdd, amount);


  if(change > 0){
    txb.addOutput(senderAdd, change);
  }


	for(var q = 0; q < utxoSignArray.length; q++){
		txb.sign(utxoSignArray[q][0], utxoSignArray[q][1]);
	}


	txHex = txb.build().toHex();
	// console.log(txHex);

  return txHex;
}

// signature should only contain exact utxo input, output, fee and change. should not do logic / calculation
let txSendBatchBackupWorking = async function(network, senderAddMany, receiverAddMany, amount, change, fee, utxo, useCase) {
	var path, param, seed, root, wif, txb;
	console.log(network, senderAddMany, receiverAddMany, amount, change, fee, utxo)

  let circuitBreakerNum = 2000; //20
  let circuitBreakerCount = 0;

  var utxoSignArray = [];

  var networkType = bitcoin.networks.testnet;
	var mnemonic = mnemonicTestnet;
	var networkDerivationPath = "1";

  if(network == "mainnet"){
    networkType = bitcoin.networks.mainnet;
		mnemonic = mnemonicMainnet;
		networkDerivationPath = "0";
  }

	seed = bip39.mnemonicToSeed(mnemonic)
	root = bip32.fromSeed(seed, networkType);

	txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet);

	let txHex;

	for(var i = 0; i < 10000; i++){
		path = root.derivePath("m/44'/" + networkDerivationPath + "'/0'/0/"+i)
		param = { pubkey: path.publicKey, network: networkType }

		addr = bitcoin.payments.p2pkh(param).address
		console.log("addr", addr)

		if(circuitBreakerCount <= circuitBreakerNum){
			for(var s=0; s<senderAddMany.length; s++){
				for(var r = 0; r < utxo.length; r++){
					if(senderAddMany[s][0] == addr && utxo[r]["address"] == addr){
						const wif = path.toWIF({ network: networkType });

						const key = bitcoin.ECPair.fromWIF(
							wif,
							networkType
						);

						var txid = utxo[r]["txid"];
						var vout = utxo[r]["vout"];
						// var vout = utxo[r]["output_no"];

						console.log("txid - vout", txid, vout)
						txb.addInput(txid, vout);
						utxoSignArray.push([r, key]);

					}else{
						// find tx num here
						// if(){
						// 	circuitBreakerCount = 0;
						// }else
						circuitBreakerCount++;
					}
				}
			}

		}else{
			break;
		}
	}
	console.log("utxoSignArray", utxoSignArray);

	amount = parseFloat(amount)

	console.log("receiverAddMany", receiverAddMany[0][0]);
	console.log("amount", amount);

	let receivedAmountAfterFee = amount - fee;

	console.log("receivedAmountAfterFee", receivedAmountAfterFee);

  txb.addOutput(receiverAddMany[0][0], receivedAmountAfterFee);

	console.log(txb);

  if(change > 0){
		let changeAddressNum = getRandomInt(senderAddMany.length);
		let changeAddress = senderAddMany[changeAddressNum][0];

    txb.addOutput(changeAddress, change);
  }
	console.log(txb);

	for(var q = 0; q < utxoSignArray.length; q++){
		txb.sign(utxoSignArray[q][0], utxoSignArray[q][1]);
	}
	console.log(txb);

	txHex = txb.build().toHex();
	console.log(txHex);

  return txHex;
}

let txSendBatch = async function(network, senderAddMany, receiverAddMany, amount, change, fee, utxo, useCase) {
	var path, param, seed, root, wif, txb;
	console.log(network, senderAddMany, receiverAddMany, amount, change, fee, utxo)

  let circuitBreakerNum = 2000; //20
  let circuitBreakerCount = 0;

  var utxoSignArray = [];

  var networkType = bitcoin.networks.testnet;
	var mnemonic = mnemonicTestnet;
	var networkDerivationPath = "1";

  if(network == "mainnet"){
    networkType = bitcoin.networks.mainnet;
		mnemonic = mnemonicMainnet;
		networkDerivationPath = "0";
  }

	seed = bip39.mnemonicToSeed(mnemonic)
	root = bip32.fromSeed(seed, networkType);

	txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet);

	let txHex;

	for(var i = 0; i < 10000; i++){
		path = root.derivePath("m/44'/" + networkDerivationPath + "'/0'/0/"+i)
		param = { pubkey: path.publicKey, network: networkType }

		addr = bitcoin.payments.p2pkh(param).address
		// console.log("addr", addr)

		if(circuitBreakerCount <= circuitBreakerNum){
			for(var s=0; s<senderAddMany.length; s++){
				for(var r = 0; r < utxo.length; r++){
					if(senderAddMany[s][0] == addr && utxo[r]["address"] == addr){
						const wif = path.toWIF({ network: networkType });

						const key = bitcoin.ECPair.fromWIF(
							wif,
							networkType
						);

						// var txid = utxo[r]["txid"];
						// var vout = utxo[r]["vout"];
						var txid = utxo[r]["utxoId"];
						var vout = parseInt(utxo[r]["vout"]);
						// var vout = utxo[r]["output_no"];

						console.log("txid - vout", txid, vout)
						txb.addInput(txid, vout);
						utxoSignArray.push([r, key]);

					}else{
						// find tx num here
						// if(){
						// 	circuitBreakerCount = 0;
						// }else
						circuitBreakerCount++;
					}
				}
			}

		}else{
			break;
		}
	}
	console.log("utxoSignArray", utxoSignArray);

	amount = parseFloat(amount)

	console.log("amount", amount);

	if(useCase == "Deposit"){
		// no change address

		let receivedAmountAfterFee = amount - fee;
		console.log("receivedAmountAfterFee", receivedAmountAfterFee);

		// only 1 warm wallet
	  txb.addOutput(receiverAddMany[0][0], receivedAmountAfterFee);
	}else if(useCase == "Withdraw"){
		// add all the withdrawal output address
		for(var z = 0; z < receiverAddMany.length; z++){
			let receiverAmount = receiverAddMany[z][1];

	    var amountInPrimaryDenomination = receiverAmount;

	    receiverAmount = await convertDenomination(receiverAmount);

	    receiverAmount = Math.floor(receiverAmount);

	    var amountInLowestDenomination = receiverAmount;

			txb.addOutput(receiverAddMany[z][0], amountInLowestDenomination);
		}

		// likely to have change address
		// randomise change address to one of the sender address ( likely only 1 sender address )
	  if(change > 0){
			let changeAddressNum = getRandomInt(senderAddMany.length);
			let changeAddress = senderAddMany[changeAddressNum][0];

			change = change - fee;

	    txb.addOutput(changeAddress, change);
	  }
	}


	console.log(txb);

	for(var q = 0; q < utxoSignArray.length; q++){
		txb.sign(utxoSignArray[q][0], utxoSignArray[q][1]);
	}
	console.log(txb);

	txHex = txb.build().toHex();
	console.log(txHex);

  return txHex;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

let convertDenomination = async function(amount) {
  let promise = await new Promise(function(resolve, reject) {
    let n = amount * (Math.pow(10, 8))
    n = Number(n).toPrecision();

    resolve(n);
  })

  return promise;
}

let getXpub = async function(network) {
	var mnemonic, seed, node, xpubString, child;
	const mainnetPath = "m/44'/0'/0'";
	const testnetPath = "m/44'/1'/0'";

	if (network == "mainnet") {
		mnemonic = mnemonicMainnet;
		seed = bip39.mnemonicToSeed(mnemonic);
		node = bip32.fromSeed(seed);
		child = node.derivePath(mainnetPath);
		xpubString = child.neutered().toBase58();
	} else if (network == "testnet") {
		mnemonic = mnemonicTestnet;
		seed = bip39.mnemonicToSeed(mnemonic);
		node = bip32.fromSeed(seed);
		child = node.derivePath(testnetPath);
		xpubString = child.neutered().toBase58();
	}

	console.log("xpub", xpubString);
	return xpubString;
}


exports.getAddress = getAddress;
exports.getAddressFull = getAddressFull;
exports.txSend = txSend;
exports.convertDenomination = convertDenomination;
exports.txSendBatch = txSendBatch;
exports.generateSeed = generateSeed;
exports.getXpub = getXpub;

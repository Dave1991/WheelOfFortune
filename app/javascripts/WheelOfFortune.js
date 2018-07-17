contract = require('truffle-contract');
provider = require('./Web3Provider.js');
express = require("express");
wheel = require('./Wheel');
Web3 = require('web3');

var abi =
    [{ "constant": false, "inputs": [], "name": "withDrawTips", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "pieceIdx", "type": "uint256" }], "name": "finishRound", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "rid", "type": "uint256" }], "name": "getLastRoundInfo", "outputs": [{ "name": "winners", "type": "address[]" }, { "name": "pieceIdx", "type": "uint256" }, { "name": "winnerBetPool", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "pieceIdx", "type": "uint256" }, { "name": "betCount", "type": "uint256" }, { "name": "tips", "type": "uint256" }], "name": "makeBet", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newPieceCount", "type": "uint256" }], "name": "increasePieceCount", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "inputs": [{ "name": "initPieceCount", "type": "uint256" }], "payable": true, "stateMutability": "payable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "data", "type": "bytes" }], "name": "FallbackTrigged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "player", "type": "address" }, { "indexed": false, "name": "pieceIdx", "type": "uint256" }, { "indexed": false, "name": "totalBet", "type": "uint256" }, { "indexed": false, "name": "tips", "type": "uint256" }], "name": "MakeBetEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "count", "type": "uint256" }], "name": "IncreasePieceCountEvent", "type": "event" }]
    ;
var contractAddress = "0x2B36fB696d4b41087A0D3B83588A318B549C81Df";
// const WheelOfFortune = contract({
//     abi: abi
// });
// WheelOfFortune.setProvider(provider);

// var wheelOfFortune;

// // WheelOfFortune.at(contractAddress).then(function (instance) {
// //     wheelOfFortune = instance;
// // });
// wheelOfFortune = WheelOfFortune.at(contractAddress);
var web3 = new Web3(provider);

var app = module.exports = express();
let wheelOfFortune = web3.eth.contract(abi).at(contractAddress)

app.get('/makeBet/:pieceIdx/:betCount/:tips/:account', function (req, res) {
    var betCount = parseInt(req.params.betCount);
    var total = betCount * wheel.config.bet;
    wheel.nextRound.betPool += total;
    wheel.nextRound.playersNumberOfPiece[req.params.pieceIdx] += betCount;
    wheel.nextRound.playersOfPiece[req.params.pieceIdx].add(req.params.account);
    res.write(JSON.stringify(wheel.nextRound));
    res.end();
});

app.get('/setRoundTime/:roundTime', function (req, res) {
    wheel.config.roundTime = req.params.roundTime;
    res.write(JSON.stringify({ "success": true }));
    res.end();
});

app.get('/setBetUint/:betUnit', function (req, res) {
    wheel.config.bet = req.params.betUnit;
    res.write(JSON.stringify({ "success": true }));  
    res.end();
});

app.get('/setPieceCount/:pieceCount', function (req, res) {
    wheel.config.pieceCount = req.params.pieceCount;
    res.write(JSON.stringify({ "success": true }));
    res.end();
});

app.get('/getWheelConfig', function (req, res) {
    res.write(JSON.stringify(wheel.config));
    res.end();
});

app.get('/getLastRoundInfo', function (req, res) {
    res.write(JSON.stringify(wheel.lastRound));
    res.end();
});

app.get('/getNextRoundInfo', function (req, res) {
    res.send(JSON.stringify(wheel.nextRound));
});

function resetWheel() {
    // 初始化转盘
    for (var i = 0; i < wheel.config.pieceCount; ++i) {
        wheel.nextRound.playersNumberOfPiece[i] = 0;
        wheel.nextRound.playersOfPiece[i] = new Set();
    }
}

function finishRound() {
    // 结束一轮
    var winIdx = (Math.random() * wheel.config.pieceCount) >> 0;
    console.log('win index: ' + winIdx);
    
    // 后台调用infura部署的合约必须用sendRawTransaction
    var coder = require('web3/lib/solidity/coder');
    var CryptoJS = require('crypto-js');
    var Tx = require('ethereumjs-tx');
    var privateKey = new Buffer("71112e795325d5cbf14d665091ce4626f26c8342b8038f1adcdfff26be04a220", 'hex');

    var functionName = 'finishRound';
    var types = ['uint'];
    var args = [winIdx];
    var fullName = functionName + '(' + types.join() + ')';
    var signature = CryptoJS.SHA3(fullName, { outputLength: 256 }).toString(CryptoJS.enc.Hex).slice(0, 8);
    var dataHex = signature + coder.encodeParams(types, args);
    var data = '0x' + dataHex;
    var account = "0x4BEB9EA54fc912B619D5C682BA1cB3524bc80955";

    var nonce = web3.toHex(web3.eth.getTransactionCount(account));
    var gasPrice = web3.toHex(web3.eth.gasPrice);
    var gasLimitHex = web3.toHex(3000000);
    var rawTx = { 'nonce': nonce, 'gasPrice': gasPrice, 'gasLimit': gasLimitHex, 'from': account, 'to': contractAddress, 'data': data }
    var tx = new Tx(rawTx)
    tx.sign(privateKey)
    var serializedTx = '0x' + tx.serialize().toString('hex')
    web3.eth.sendRawTransaction(serializedTx, function (err, txHash) {
        if (!err) {
            console.log(JSON.stringify({ "transactionHash": txHash }));
            wheel.lastRound.roundIdx = wheel.nextRound.roundIdx;
            wheel.lastRound.timeStamp = (new Date()).valueOf();
            wheel.lastRound.winners = Array.from(wheel.nextRound.playersOfPiece[winIdx]);
            wheel.lastRound.blockIdx = winIdx + 1;
            if (wheel.lastRound.winners.length > 0) {
                wheel.lastRound.betPool = wheel.nextRound.betPool;
                wheel.nextRound.betPool = 0;
            } else {
                wheel.lastRound.betPool = 0;
            }
            wheel.nextRound.roundIdx++;
            wheel.nextRound.startTimeStamp = (new Date()).valueOf() + wheel.config.roundTime * 1000;
            resetWheel();
            setTimeout(finishRound, wheel.config.roundTime * 1000);
        } else {
            console.log("finish round error " + err);
        }
    });
}

setTimeout(finishRound, wheel.config.roundTime * 1000);
resetWheel();

app.get('/testBet', function (req, res) {
    var coder = require('web3/lib/solidity/coder')
    var CryptoJS = require('crypto-js')
    var Tx = require('ethereumjs-tx')
    var privateKey = new Buffer("71112e795325d5cbf14d665091ce4626f26c8342b8038f1adcdfff26be04a220", 'hex')

    var functionName = 'makeBet'
    var types = ['uint', 'uint', 'uint']
    var args = [1, 1, 1]
    var fullName = functionName + '(' + types.join() + ')'
    var signature = CryptoJS.SHA3(fullName, { outputLength: 256 }).toString(CryptoJS.enc.Hex).slice(0, 8)
    var dataHex = signature + coder.encodeParams(types, args)
    var data = '0x' + dataHex
    var account = "0x4BEB9EA54fc912B619D5C682BA1cB3524bc80955";

    var nonce = web3.toHex(web3.eth.getTransactionCount(account))
    var gasPrice = web3.toHex(web3.eth.gasPrice)
    var gasLimitHex = web3.toHex(300000)
    var value = web3.toHex(1001);
    var rawTx = { 'nonce': nonce, 'gasPrice': gasPrice, 'gasLimit': gasLimitHex, 'from': account, 'to': contractAddress, 'value': value, 'data': data }
    var tx = new Tx(rawTx)
    tx.sign(privateKey)
    var serializedTx = '0x' + tx.serialize().toString('hex')
    web3.eth.sendRawTransaction(serializedTx, function (err, txHash) { console.log(err, txHash) })
    res.send('aaa');
});

app.get('/testFinish', function(req, res) {
    // 结束一轮
    var winIdx = (Math.random() * wheel.config.pieceCount) >> 0;
    console.log('win index: ' + winIdx);
    
    // 后台调用infura部署的合约必须用sendRawTransaction
    var coder = require('web3/lib/solidity/coder');
    var CryptoJS = require('crypto-js');
    var Tx = require('ethereumjs-tx');
    var privateKey = new Buffer("71112e795325d5cbf14d665091ce4626f26c8342b8038f1adcdfff26be04a220", 'hex');

    var functionName = 'finishRound';
    var types = ['uint'];
    var args = [winIdx];
    var fullName = functionName + '(' + types.join() + ')';
    var signature = CryptoJS.SHA3(fullName, { outputLength: 256 }).toString(CryptoJS.enc.Hex).slice(0, 8);
    var dataHex = signature + coder.encodeParams(types, args);
    var data = '0x' + dataHex;
    var account = "0x4BEB9EA54fc912B619D5C682BA1cB3524bc80955";

    var nonce = web3.toHex(web3.eth.getTransactionCount(account));
    var gasPrice = web3.toHex(web3.eth.gasPrice);
    var gasLimitHex = web3.toHex(3000000);
    var rawTx = { 'nonce': nonce, 'gasPrice': gasPrice, 'gasLimit': gasLimitHex, 'from': account, 'to': contractAddress, 'data': data }
    var tx = new Tx(rawTx)
    tx.sign(privateKey)
    var serializedTx = '0x' + tx.serialize().toString('hex')
    web3.eth.sendRawTransaction(serializedTx, function (err, txHash) {
        if (!err) {
            res.send(JSON.stringify({ "transactionHash": txHash }));
        } else {
            res.send();
            console.log(err);
        }
    });
});
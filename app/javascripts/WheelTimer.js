import { setTimeout } from 'timers';

// 合约创建者每隔一段时间转一次转盘

contract = require('truffle-contract');
provider = require('./Web3Provider.js');
wheel = require('./Wheel');

const WheelOfFortune = contract(require('../../build/contracts/WheelOfFortune.json'));
WheelOfFortune.setProvider(provider);
var wheelOfFortune;
WheelOfFortune.at("0xC539FB2bdB1b06ABc79354886eb59c8F99f6C889").then(function(instance) {
    wheelOfFortune = instance;
});

function takeARound() {
    var winnerPieceIdx = parseInt(Math.random() * pieceCount);
    wheelOfFortune.finishRound.estimateGas(winnerPieceIdx, {from: "0x4BEB9EA54fc912B619D5C682BA1cB3524bc80955"}).then(function(esti_gas) {
        wheelOfFortune.finishRound(winnerPieceIdx, {from: "0x4BEB9EA54fc912B619D5C682BA1cB3524bc80955", gas: esti_gas + 1000}).then(function(result) {
            if (result.logs.length > 0) {
                var eventobj = result.logs[0];
                wheel.lastRound.winners = eventobj.winners;
                wheel.lastRound.timestamp = (new Date()).valueOf();
                wheel.lastRound.betPool = eventobj.betPool;

                wheel.nextRoundTimeStamp = wheel.lastRound.timestamp + wheel.config.roundTime * 1000;
                setTimeout(takeARound, wheel.nextRoundTimeStamp);
            }
        });
    });
};
takeARound();
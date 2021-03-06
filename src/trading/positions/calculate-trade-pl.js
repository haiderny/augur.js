"use strict";

var abi = require("augur-abi");
var calculateTakerPL = require("./calculate-taker-pl");
var sellCompleteSetsPL = require("./sell-complete-sets-pl");
var calculateMakerPL = require("./calculate-maker-pl");

function calculateTradePL(PL, trade) {
  if (trade.isCompleteSet) {
    if (trade.type === "buy") {
      // console.log('buy complete sets:', PL.position.toFixed(), PL.meanOpenPrice.toFixed(), trade.amount, JSON.stringify(PL.tradeQueue));
      return calculateTakerPL(PL, trade.type, abi.bignum(trade.price), abi.bignum(trade.amount));
    }
    // console.log('sell complete sets:', PL.position.toFixed(), PL.meanOpenPrice.toFixed(), trade.amount, JSON.stringify(PL.tradeQueue));
    return sellCompleteSetsPL(PL, abi.bignum(trade.amount), abi.bignum(trade.price));
  } else if (trade.maker) {
    return calculateMakerPL(PL, trade.type, abi.bignum(trade.price), abi.bignum(trade.amount));
  }
  return calculateTakerPL(PL, trade.type, abi.bignum(trade.price), abi.bignum(trade.amount));
}

module.exports = calculateTradePL;

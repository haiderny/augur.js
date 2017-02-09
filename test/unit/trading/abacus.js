"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var abi = require("augur-abi");
var madlibs = require("madlibs");
var tools = require("../../tools");
var constants = require("../../../src/constants");
var abacus = require("../../../src/modules/abacus");

describe("calculatePriceDepth", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var liquidity = new BigNumber(t.liquidity);
      var startingQuantity = new BigNumber(t.startingQuantity);
      var bestStartingQuantity = new BigNumber(t.bestStartingQuantity);
      var halfPriceWidth = new BigNumber(t.halfPriceWidth);
      var minValue = new BigNumber(t.minValue);
      var maxValue = new BigNumber(t.maxValue);
      var priceDepth = abacus.calculatePriceDepth(liquidity, startingQuantity, bestStartingQuantity, halfPriceWidth, minValue, maxValue);
      assert.strictEqual(priceDepth.toFixed(), t.expected);
    });
  };
  test({
    liquidity: 100,
    startingQuantity: 5,
    bestStartingQuantity: 10,
    halfPriceWidth: "0.4",
    minValue: 0,
    maxValue: 1,
    expected: "0.0375"
  });
  test({
    liquidity: 500,
    startingQuantity: 5,
    bestStartingQuantity: 10,
    halfPriceWidth: "0.4",
    minValue: 0,
    maxValue: 1,
    expected: "0.00625"
  });
  test({
    liquidity: 50,
    startingQuantity: 5,
    bestStartingQuantity: 10,
    halfPriceWidth: "0.4",
    minValue: 0,
    maxValue: 1,
    expected: "0.1"
  });
  test({
    liquidity: 20,
    startingQuantity: 5,
    bestStartingQuantity: 10,
    halfPriceWidth: "0.4",
    minValue: 0,
    maxValue: 1,
    expected: "Infinity"
  });
});

describe("abacus.calculateAdjustedTradingFee", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var adjustedTradingFee = abacus.calculateAdjustedTradingFee(abi.bignum(t.tradingFee), abi.bignum(t.price), abi.bignum(t.range));
      assert(adjustedTradingFee.eq(abi.bignum(t.expected)));
    });
  };
  test({
    tradingFee: "0.02",
    price: "0.4",
    range: 1,
    expected: "0.0192"
  });
  test({
    tradingFee: "0.02",
    price: "0.5",
    range: 1,
    expected: "0.02"
  });
  test({
    tradingFee: "0.02",
    price: "1",
    range: 1,
    expected: "0"
  });
  test({
    tradingFee: "0.02",
    price: "0",
    range: 1,
    expected: "0"
  });
  test({
    tradingFee: "0.02",
    price: "0.75",
    range: 1,
    expected: "0.015"
  });
  test({
    tradingFee: "0.08",
    price: "0.75",
    range: 1,
    expected: "0.06"
  });
  test({
    tradingFee: "0.02",
    price: "0.5",
    range: 2,
    expected: "0.015"
  });
  test({
    tradingFee: "0.02",
    price: "1",
    range: 2,
    expected: "0.02"
  });
  test({
    tradingFee: "0.02",
    price: "0",
    range: 2,
    expected: "0"
  });
  test({
    tradingFee: "0.02",
    price: "0.75",
    range: 2,
    expected: "0.01875"
  });
  test({
    tradingFee: "0.08",
    price: "0.75",
    range: 2,
    expected: "0.075"
  });
});

describe("abacus.calculateTradingCost", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var tradingCost = abacus.calculateTradingCost(t.amount, t.price, t.tradingFee, t.makerProportionOfFee, t.range);
      assert.strictEqual(tradingCost.fee.toFixed(), t.expected.fee);
      assert.strictEqual(tradingCost.percentFee.toFixed(), t.expected.percentFee);
      assert.strictEqual(tradingCost.cost.toFixed(), t.expected.cost);
    });
  };
  test({
    amount: 1,
    price: "0.4",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.00768",
      percentFee: "0.0192",
      cost: "0.40768",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.5",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.01",
      percentFee: "0.02",
      cost: "0.51",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0.5",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.02",
      percentFee: "0.02",
      cost: "1.02",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.5",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.0075",
      percentFee: "0.015",
      cost: "0.5075",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "1",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "1",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "1",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "2",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "1",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.04",
      percentFee: "0.02",
      cost: "2.04",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "0",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "0",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "0",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.01125",
      percentFee: "0.015",
      cost: "0.76125",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0.75",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.0225",
      percentFee: "0.015",
      cost: "1.5225",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.0140625",
      percentFee: "0.01875",
      cost: "0.7640625",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.08",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.045",
      percentFee: "0.06",
      cost: "0.795",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0.75",
    tradingFee: "0.08",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.09",
      percentFee: "0.06",
      cost: "1.59",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.08",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.05625",
      percentFee: "0.075",
      cost: "0.80625",
      cash: "0"
    }
  });
});

describe("abacus.calculateFxpTradingCost", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var tradingCost = abacus.calculateFxpTradingCost(t.amount, t.price, abi.fix(t.tradingFee), abi.fix(t.makerProportionOfFee), t.range);
      assert.strictEqual(tradingCost.fee.toFixed(), t.expected.fee);
      assert.strictEqual(tradingCost.percentFee.toFixed(), t.expected.percentFee);
      assert.strictEqual(tradingCost.cost.toFixed(), t.expected.cost);
    });
  };
  test({
    amount: 1,
    price: "0.4",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.00768",
      percentFee: "0.0192",
      cost: "0.40768",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.5",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.01",
      percentFee: "0.02",
      cost: "0.51",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0.5",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.02",
      percentFee: "0.02",
      cost: "1.02",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.5",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.0075",
      percentFee: "0.015",
      cost: "0.5075",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "1",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "1",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "1",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "2",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "1",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.04",
      percentFee: "0.02",
      cost: "2.04",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "0",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "0",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0",
      percentFee: "0",
      cost: "0",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.01125",
      percentFee: "0.015",
      cost: "0.76125",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0.75",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.0225",
      percentFee: "0.015",
      cost: "1.5225",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.02",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.0140625",
      percentFee: "0.01875",
      cost: "0.7640625",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.08",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.045",
      percentFee: "0.06",
      cost: "0.795",
      cash: "0"
    }
  });
  test({
    amount: 2,
    price: "0.75",
    tradingFee: "0.08",
    makerProportionOfFee: "0.5",
    range: 1,
    expected: {
      fee: "0.09",
      percentFee: "0.06",
      cost: "1.59",
      cash: "0"
    }
  });
  test({
    amount: 1,
    price: "0.75",
    tradingFee: "0.08",
    makerProportionOfFee: "0.5",
    range: 2,
    expected: {
      fee: "0.05625",
      percentFee: "0.075",
      cost: "0.80625",
      cash: "0"
    }
  });
});

describe("abacus.maxOrdersPerTrade", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var maxOrders = abacus.maxOrdersPerTrade(t.type, t.gasLimit);
      assert.strictEqual(maxOrders, t.expected);
    });
  };
  test({type: "sell", expected: 4});
  test({type: "buy", expected: 4});
  test({type: "sell", gasLimit: 3135000, expected: 4});
  test({type: "buy", gasLimit: 3135000, expected: 4});
  test({type: "sell", gasLimit: 3500000, expected: 5});
  test({type: "buy", gasLimit: 3500000, expected: 5});
  test({type: "sell", gasLimit: 4250000, expected: 6});
  test({type: "buy", gasLimit: 4250000, expected: 6});
  test({type: "sell", gasLimit: 4712388, expected: 7});
  test({type: "buy", gasLimit: 4712388, expected: 6});
  test({type: "sell", gasLimit: 10000000, expected: 16});
  test({type: "buy", gasLimit: 10000000, expected: 14});
  test({type: "sell", gasLimit: 100000000, expected: 162});
  test({type: "buy", gasLimit: 100000000, expected: 150});
});

describe("abacus.sumTradeGas", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      assert.strictEqual(abacus.sumTradeGas(t.tradeTypes), t.expected);
    });
  };
  test({
    tradeTypes: ["buy"],
    expected: constants.TRADE_GAS[0].buy
  });
  test({
    tradeTypes: ["sell"],
    expected: constants.TRADE_GAS[0].sell
  });
  test({
    tradeTypes: ["buy", "buy"],
    expected: constants.TRADE_GAS[0].buy + constants.TRADE_GAS[1].buy
  });
  test({
    tradeTypes: ["sell", "sell"],
    expected: constants.TRADE_GAS[0].sell + constants.TRADE_GAS[1].sell
  });
  test({
    tradeTypes: ["buy", "sell"],
    expected: constants.TRADE_GAS[0].buy + constants.TRADE_GAS[1].sell
  });
  test({
    tradeTypes: ["sell", "buy"],
    expected: constants.TRADE_GAS[0].sell + constants.TRADE_GAS[1].buy
  });
  test({
    tradeTypes: ["buy", "buy", "buy"],
    expected: constants.TRADE_GAS[0].buy + 2*constants.TRADE_GAS[1].buy
  });
  test({
    tradeTypes: ["sell", "sell", "sell"],
    expected: constants.TRADE_GAS[0].sell + 2*constants.TRADE_GAS[1].sell
  });
  test({
    tradeTypes: ["buy", "sell", "sell"],
    expected: constants.TRADE_GAS[0].buy + 2*constants.TRADE_GAS[1].sell
  });
  test({
    tradeTypes: ["sell", "buy", "buy"],
    expected: constants.TRADE_GAS[0].sell + 2*constants.TRADE_GAS[1].buy
  });
  test({
    tradeTypes: ["buy", "buy", "sell"],
    expected: constants.TRADE_GAS[0].buy + constants.TRADE_GAS[1].buy + constants.TRADE_GAS[1].sell
  });
  test({
    tradeTypes: ["sell", "sell", "buy"],
    expected: constants.TRADE_GAS[0].sell + constants.TRADE_GAS[1].sell + constants.TRADE_GAS[1].buy
  });
});

describe("abacus.sumTrades", function() {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(abacus.sumTrades(t.trade_ids));
    });
  };
  test({
    trade_ids: ['1', '2'],
    assertions: function(trades) {
      assert.deepEqual(trades, '0x3');
    }
  });
  test({
    trade_ids: [],
    assertions: function(trades) {
      assert.deepEqual(trades, '0x0');
    }
  });
  test({
    trade_ids: ['25', '233023', '100', '12', '6', '34'],
    assertions: function(trades) {
      assert.deepEqual(trades, '0x38ef0');
    }
  });
});

describe("abacus.makeTradeHash", function() {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(abacus.makeTradeHash(t.max_value, t.max_amount, t.trade_ids));
    });
  };
  test({
    max_value: '100',
    max_amount: '200',
    trade_ids: ['15', '12', '200'],
    assertions: function(sha3) {
      assert.deepEqual(sha3, '0x9dbb8636c9cdd0d31d02b19bf88ca090e8df5138ba666c167be06a4860aead39');
    }
  });
  test({
    max_value: '0',
    max_amount: '10',
    trade_ids: ['150', '12333', '12320', '1', '23', '12'],
    assertions: function(sha3) {
      assert.deepEqual(sha3, '0x9731ed6e55710832de4e483a8edf597029d636e58b701458b8cdd2bfd2829be6');
    }
  });
  test({
    max_value: '120',
    max_amount: '0',
    trade_ids: ['10', '120', '20', '321'],
    assertions: function(sha3) {
      assert.deepEqual(sha3, '0xb7740eac4fa741a5f8db90da5c9d261598bc7dfe031e361c4010d2f436d71717');
    }
  });
  test({
    max_value: '120',
    max_amount: '300',
    trade_ids: [],
    assertions: function(sha3) {
      assert.deepEqual(sha3, '0x604350686ce84371b506c8497ef58fea535df1b2dab9fc00ef31bc8898271428');
    }
  });
});

describe("abacus.calculateRequiredMarketValue", function() {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(abacus.calculateRequiredMarketValue(t.gasPrice));
    });
  };
  test({
    gasPrice: '0.00354',
    assertions: function(marketValue) {
      assert.deepEqual(marketValue, '0x1782');
    }
  });
  test({
    gasPrice: '0.07502',
    assertions: function(marketValue) {
      assert.deepEqual(marketValue, '0x1f22e');
    }
  });
  test({
    gasPrice: '0.53',
    assertions: function(marketValue) {
      assert.deepEqual(marketValue, '0xdbf88');
    }
  });
});

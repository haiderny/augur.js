"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var abi = require("augur-abi");
var madlibs = require("madlibs");
var tools = require("../../tools");
var augur = new (require("../../../src"))();
var constants = require("../../../src/constants");
var parsers = require('../../../src/parsers');

describe("augur.trading.fees.calculateAdjustedTradingFee", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var adjustedTradingFee = augur.trading.fees.calculateAdjustedTradingFee(abi.bignum(t.tradingFee), abi.bignum(t.price), abi.bignum(t.range));
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

describe("augur.trading.fees.calculateTradingCost", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var tradingCost = augur.trading.fees.calculateTradingCost(t.amount, t.price, t.tradingFee, t.makerProportionOfFee, t.range);
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

describe("augur.create.calculateValidityBond", function () {
  // 2 tests total
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(augur.create.calculateValidityBond.call(t.testThis, t.tradingFee, t.periodLength, t.baseReporters, t.numEventsCreatedInPast24Hours, t.numEventsInReportPeriod));
    });
  };
  test({
    testThis: { rpc: { gasPrice: 20000000000 } },
    tradingFee: '0.03',
    periodLength: 1440,
    baseReporters: 50,
    numEventsCreatedInPast24Hours: 20,
    numEventsInReportPeriod: 25,
    assertions: function (result) {
      assert.deepEqual(result, '0.98103632478632478632');
    }
  });
  test({
    testThis: { rpc: { gasPrice: 20000000000 } },
    tradingFee: '0.45',
    periodLength: 1440,
    baseReporters: 100,
    numEventsCreatedInPast24Hours: 20,
    numEventsInReportPeriod: 25,
    assertions: function (result) {
      assert.deepEqual(result, '0.15411324786324786325');
    }
  });
});

describe("augur.trading.fees.calculateFxpTradingCost", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var tradingCost = augur.trading.fees.calculateFxpTradingCost(t.amount, t.price, abi.fix(t.tradingFee), abi.fix(t.makerProportionOfFee), t.range);
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

describe("augur/src/trading/maxOrdersPerTrade", function () {
  var maxOrdersPerTrade = require('../../../src/trading/max-orders-per-trade');
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var maxOrders = maxOrdersPerTrade(t.type, t.gasLimit);
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

describe("augur/src/trading/sumTradeGas", function () {
  var sumTradeGas = require('../../../src/trading/sum-trade-gas');
  var test = function (t) {
    it(JSON.stringify(t), function () {
      assert.strictEqual(sumTradeGas(t.tradeTypes), t.expected);
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

describe("augur/src/trading/take-order/sumTrades", function () {
  var sumTrades = require('../../../src/trading/take-order/sum-trades');
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(sumTrades(t.trade_ids));
    });
  };
  test({
    trade_ids: ['1', '2'],
    assertions: function (trades) {
      assert.deepEqual(trades, '0x3');
    }
  });
  test({
    trade_ids: [],
    assertions: function (trades) {
      assert.deepEqual(trades, '0x0');
    }
  });
  test({
    trade_ids: ['25', '233023', '100', '12', '6', '34'],
    assertions: function (trades) {
      assert.deepEqual(trades, '0x38ef0');
    }
  });
});

describe("augur.trading.takeOrder.makeTradeHash", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(augur.trading.takeOrder.makeTradeHash(t.max_value, t.max_amount, t.trade_ids));
    });
  };
  test({
    max_value: '100',
    max_amount: '200',
    trade_ids: ['15', '12', '200'],
    assertions: function (sha3) {
      assert.deepEqual(sha3, '0x9dbb8636c9cdd0d31d02b19bf88ca090e8df5138ba666c167be06a4860aead39');
    }
  });
  test({
    max_value: '0',
    max_amount: '10',
    trade_ids: ['150', '12333', '12320', '1', '23', '12'],
    assertions: function (sha3) {
      assert.deepEqual(sha3, '0x9731ed6e55710832de4e483a8edf597029d636e58b701458b8cdd2bfd2829be6');
    }
  });
  test({
    max_value: '120',
    max_amount: '0',
    trade_ids: ['10', '120', '20', '321'],
    assertions: function (sha3) {
      assert.deepEqual(sha3, '0xb7740eac4fa741a5f8db90da5c9d261598bc7dfe031e361c4010d2f436d71717');
    }
  });
  test({
    max_value: '120',
    max_amount: '300',
    trade_ids: [],
    assertions: function (sha3) {
      assert.deepEqual(sha3, '0x604350686ce84371b506c8497ef58fea535df1b2dab9fc00ef31bc8898271428');
    }
  });
});

describe("parsers.parseMarketInfo", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      // the following if statements setup the rawInfo's shape correctly with description/resolution/extraInfo
      if (t.description) t.rawInfo.splice.apply(t.rawInfo, [t.rawInfo.length - 2, 0].concat(t.description));
      if (t.resolution) t.rawInfo.splice.apply(t.rawInfo, [t.rawInfo.length - 1, 0].concat(t.resolution));
      if (t.extraInfo) t.rawInfo.push.apply(t.rawInfo, t.extraInfo);

      t.assertions(parsers.parseMarketInfo(t.rawInfo));
    });
  };
  // marketInfo[0] = marketID
  // marketInfo[1] = MARKETS.getMakerFees(marketID)
  // marketInfo[2] = numOutcomes
  // marketInfo[3] = MARKETS.getTradingPeriod(marketID)
  // marketInfo[4] = MARKETS.getTradingFee(marketID)
  // marketInfo[5] = MARKETS.getBranchID(marketID)
  // marketInfo[6] = MARKETS.getCumScale(marketID)
  // marketInfo[7] = MARKETS.getCreationTime(marketID)
  // marketInfo[8] = MARKETS.getVolume(marketID)
  // marketInfo[9] = INFO.getCreationFee(marketID)
  // marketInfo[10] = INFO.getCreator(marketID)
  // tags = MARKETS.returnTags(marketID, outitems=3)
  // marketInfo[11] = tags[0]
  // marketInfo[12] = tags[1]
  // marketInfo[13] = tags[2]
  // marketInfo[14] = eventID
  // marketInfo[15] = endDate
  // marketInfo[16] = rawReport fixed.
  // marketInfo[17] = minValue
  // marketInfo[18] = maxValue
  // marketInfo[19] = unused in this function.
  // marketInfo[20] = fixed EventBond
  // marketInfo[21] = isUnethical
  // makretInfo[22] = proportionCorrect

  // here's where things are out of place depending on the market. the next groups of 3 positions are outcomes. so a binary market containing just 2 outcomes would look like so:

  // marketInfo[23] = outcome1.outstandingShares
  // marketInfo[24] = outcome1.price
  // marketInfo[25] = outcome1.sharesPurchased
  // marketInfo[26] = outcome2.outstandingShares
  // marketInfo[27] = outcome2.price
  // marketInfo[28] = outcome2.sharesPurchased

  // after outcomes are complete the next entry will be the description length in hex, then the description byte array as individual entries in the rawInfo array.

  // marketInfo[29] = description length in hex
  // marketInfo[30] = Description byte array start

  // next two entries are vairiable depending on the length of the previous entry, so description for resolution...

  // marketInfo[?? - 1] = resolution length in hex
  // marketInfo[??] = resolution

  // and resolution for extraInfo...

  // marketInfo[??? - 1] = extraInfo length in hex
  // marketInfo[???] = extraInfo
  test({
    rawInfo: [],
    assertions: function (info) {
      assert.isNull(info);
    }
  });
  test({
    rawInfo: ['0xa1', abi.fix('0.23'), '2', 1500000, abi.fix('0.026'), '0xb1', abi.fix('1'), 1000000, '0x64', abi.fix('10000'), abi.fix('0.0375'), '0xabc123', abi.short_string_to_int256('tag1'), abi.short_string_to_int256('tag2'), abi.short_string_to_int256('tag3'), '0xf1', 1600000, abi.fix('0'), abi.fix('1'), abi.fix('200'), undefined, abi.fix('3.5'), abi.fix('1'), abi.fix('0'), abi.fix('0'), abi.fix('100'), abi.fix('9500.00'), abi.fix('0'), abi.fix('101'), abi.fix('500.0'), '29', '1b', '35'],
    description: abi.hex_to_bytes(abi.hex('This is a scalar market that has a report')),
    resolution: abi.hex_to_bytes(abi.hex('https://www.resolutions.com')),
    extraInfo: abi.hex_to_bytes(abi.hex('This is extra information used to help with reporting')),
    assertions: function (info) {
      assert.deepEqual(info, {
      	id: '0x00000000000000000000000000000000000000000000000000000000000000a1',
      	network: null,
      	makerFee: '0.00598',
      	takerFee: '0.03302',
      	tradingFee: '0.026',
      	numOutcomes: 2,
      	tradingPeriod: 22020096,
      	branchID: '0xb1',
      	cumulativeScale: '1',
      	creationTime: 16777216,
        creationBlock: 100,
      	volume: '10000',
      	creationFee: '0.0375',
      	author: '0x0000000000000000000000000000000000abc123',
      	topic: 'tag1',
      	tags: ['tag1', 'tag2', 'tag3'],
      	minValue: '1',
      	maxValue: '200',
      	endDate: 23068672,
      	eventID: '0x00000000000000000000000000000000000000000000000000000000000000f1',
      	eventBond: '3.5',
      	type: 'scalar',
      	consensus: null,
      	outcomes: [{
      			id: 1,
      			outstandingShares: '0',
      			price: '100',
      			sharesPurchased: '9500'
      		},
      		{
      			id: 2,
      			outstandingShares: '0',
      			price: '101',
      			sharesPurchased: '500'
      		}
      	],
      	description: 'This is a scalar market that has a report',
      	resolutionSource: 'https://www.resolutions.com',
      	extraInfo: 'This is extra information used to help with reporting'
      });
    }
  });
  test({
    rawInfo: [
    	'0xa2', abi.fix('0.37'), '2', 1500000, abi.fix('0.03'), '0xb1', abi.fix('1'), 1000000, '0x64', abi.fix('2500.00'), abi.fix('0.035'), '0xabc123', abi.short_string_to_int256('tag1'), abi.short_string_to_int256('tag2'), abi.short_string_to_int256('tag3'), '0xf1', 1600000, abi.fix('0'), abi.fix('1'), abi.fix('2'), undefined, abi.fix('3.53'), abi.fix('1'), abi.fix('0'), abi.fix('1000'), abi.fix('0.45'), abi.fix('1000'), abi.fix('500'), abi.fix('0.55'), abi.fix('1500'), '18', '1b', '1e'
    ],
    description: abi.hex_to_bytes(abi.hex('This describes my market')),
    resolution: abi.hex_to_bytes(abi.hex('https://www.resolutions.com')),
    extraInfo: abi.hex_to_bytes(abi.hex('This is some extra information')),
    assertions: function (info) {
      assert.deepEqual(info, {
      	id: '0x00000000000000000000000000000000000000000000000000000000000000a2',
      	network: null,
      	makerFee: '0.0111',
      	takerFee: '0.0339',
      	tradingFee: '0.03',
      	numOutcomes: 2,
      	tradingPeriod: 22020096,
      	branchID: '0xb1',
      	cumulativeScale: '1',
      	creationTime: 16777216,
        creationBlock: 100,
      	volume: '2500',
      	creationFee: '0.035',
      	author: '0x0000000000000000000000000000000000abc123',
      	topic: 'tag1',
      	tags: ['tag1', 'tag2', 'tag3'],
      	minValue: '1',
      	maxValue: '2',
      	endDate: 23068672,
      	eventID: '0x00000000000000000000000000000000000000000000000000000000000000f1',
      	eventBond: '3.53',
      	type: 'binary',
      	consensus: null,
      	outcomes: [{
      			id: 1,
      			outstandingShares: '1000',
      			price: '0.45',
      			sharesPurchased: '1000'
      		},
      		{
      			id: 2,
      			outstandingShares: '500',
      			price: '0.55',
      			sharesPurchased: '1500'
      		}
      	],
      	description: 'This describes my market',
      	resolutionSource: 'https://www.resolutions.com',
      	extraInfo: 'This is some extra information'
      });
    }
  });
  test({
    rawInfo: [
      '0xa3', abi.fix('0.37'), '4', 1500000, abi.fix('0.03'), '0xb1', abi.fix('1'), 1000000, '0x64', abi.fix('5000.00'), abi.fix('0.029'), '0xabc123', abi.short_string_to_int256('tag1'), abi.short_string_to_int256('tag2'), abi.short_string_to_int256('tag3'), '0xf1', 1600000, abi.fix('4'), abi.fix('1'), abi.fix('4'), undefined, abi.fix('3.53'), abi.fix('1'), abi.fix('0.99'), abi.fix('0'), abi.fix('0.05'), abi.fix('500'), abi.fix('0'), abi.fix('0.05'), abi.fix('800'), abi.fix('0'), abi.fix('0.05'), abi.fix('200'), abi.fix('0'), abi.fix('0.85'), abi.fix('3500'), abi.strip_0x(abi.hex('33')), '1b', abi.strip_0x(abi.hex('59'))
    ],
    description: abi.hex_to_bytes(abi.hex('Generally, What color is the sky?')),
    resolution: abi.hex_to_bytes(abi.hex('https://www.resolutions.com')),
    extraInfo: abi.hex_to_bytes(abi.hex('This is some extra information about my categorical market.')),
    assertions: function (info) {
      assert.deepEqual(info, {
      	id: '0x00000000000000000000000000000000000000000000000000000000000000a3',
      	network: null,
      	makerFee: '0.0111',
      	takerFee: '0.0339',
      	tradingFee: '0.03',
      	numOutcomes: 4,
      	tradingPeriod: 22020096,
      	branchID: '0xb1',
      	cumulativeScale: '1',
      	creationTime: 16777216,
        creationBlock: 100,
      	volume: '5000',
      	creationFee: '0.029',
      	author: '0x0000000000000000000000000000000000abc123',
      	topic: 'tag1',
      	tags: ['tag1', 'tag2', 'tag3'],
      	minValue: '1',
      	maxValue: '4',
      	endDate: 23068672,
      	eventID: '0x00000000000000000000000000000000000000000000000000000000000000f1',
      	eventBond: '3.53',
      	type: 'categorical',
      	consensus: {
      		outcomeID: '4',
      		isIndeterminate: false,
      		isUnethical: false,
      		proportionCorrect: '0.99'
      	},
      	outcomes: [{
      			id: 1,
      			outstandingShares: '0',
      			price: '0.05',
      			sharesPurchased: '500'
      		},
      		{
      			id: 2,
      			outstandingShares: '0',
      			price: '0.05',
      			sharesPurchased: '800'
      		},
      		{
      			id: 3,
      			outstandingShares: '0',
      			price: '0.05',
      			sharesPurchased: '200'
      		},
      		{
      			id: 4,
      			outstandingShares: '0',
      			price: '0.85',
      			sharesPurchased: '3500'
      		}
      	],
      	description: 'Generally, What color is the sky?',
      	resolutionSource: 'https://www.resolutions.com',
      	extraInfo: 'This is some extra information about my categorical market.'
      });
    }
  });
});

describe("augur.create.calculateRequiredMarketValue", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(augur.create.calculateRequiredMarketValue(t.gasPrice));
    });
  };
  test({
    gasPrice: '0.00354',
    assertions: function (marketValue) {
      assert.deepEqual(marketValue, '0x1782');
    }
  });
  test({
    gasPrice: '0.07502',
    assertions: function (marketValue) {
      assert.deepEqual(marketValue, '0x1f22e');
    }
  });
  test({
    gasPrice: '0.53',
    assertions: function (marketValue) {
      assert.deepEqual(marketValue, '0xdbf88');
    }
  });
});

describe("augur.trading.fees.calculateMakerTakerFees", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(augur.trading.fees.calculateMakerTakerFees(t.tradingFee, t.makerProportionOfFee, t.isUnfixed, t.returnBigNumber));
    });
  };
  test({
    tradingFee: abi.fix('0.03'),
    makerProportionOfFee: abi.fix('0.67'),
    isUnfixed: false,
    returnBigNumber: true,
    assertions: function (makerTaker) {
      assert.deepEqual(JSON.stringify(makerTaker), JSON.stringify({
        trading: abi.bignum('0.03'),
        maker: abi.bignum('0.0201'),
        taker: abi.bignum('0.0249')
      }));
    }
  });
  test({
    tradingFee: '0.026',
    makerProportionOfFee: '0.392',
    isUnfixed: true,
    returnBigNumber: false,
    assertions: function (makerTaker) {
      assert.deepEqual(JSON.stringify(makerTaker), JSON.stringify({
        trading: '0.026',
        maker: '0.010192',
        taker: '0.028808'
      }));
    }
  });
});

describe("augur.trading.shrinkScalarPrice", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(augur.trading.shrinkScalarPrice(t.minValue, t.price));
    });
  };
  test({
    minValue: new BigNumber('10'),
    price: new BigNumber('.5'),
    assertions: function (shrunkenScalarPrice) {
      assert.deepEqual(shrunkenScalarPrice, '-9.5');
    }
  });
  test({
    minValue: '100',
    price: '20',
    assertions: function (shrunkenScalarPrice) {
      assert.deepEqual(shrunkenScalarPrice, '-80');
    }
  });
  test({
    minValue: '-20',
    price: '20',
    assertions: function (shrunkenScalarPrice) {
      assert.deepEqual(shrunkenScalarPrice, '40');
    }
  });
});

describe("augur.trading.expandScalarPrice", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(augur.trading.expandScalarPrice(t.minValue, t.price));
    });
  };
  test({
    minValue: new BigNumber('10'),
    price: new BigNumber('.5'),
    assertions: function (expandedScalarPrice) {
      assert.deepEqual(expandedScalarPrice, '10.5');
    }
  });
  test({
    minValue: '100',
    price: '5',
    assertions: function (expandedScalarPrice) {
      assert.deepEqual(expandedScalarPrice, '105');
    }
  });
  test({
    minValue: '-10',
    price: '50',
    assertions: function (expandedScalarPrice) {
      assert.deepEqual(expandedScalarPrice, '40');
    }
  });
});

describe("augur.trading.adjustScalarSellPrice", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      t.assertions(augur.trading.adjustScalarSellPrice(t.maxValue, t.price));
    });
  };
  test({
    maxValue: new BigNumber('100'),
    price: new BigNumber('.5'),
    assertions: function (adjustedScalarPrice) {
      assert.deepEqual(adjustedScalarPrice, '99.5');
    }
  });
  test({
    maxValue: '50',
    price: '.7',
    assertions: function (adjustedScalarPrice) {
      assert.deepEqual(adjustedScalarPrice, '49.3');
    }
  });
  test({
    maxValue: '500',
    price: '320',
    assertions: function (adjustedScalarPrice) {
      assert.deepEqual(adjustedScalarPrice, '180');
    }
  });
});

"use strict";

var assert = require("chai").assert;
var async = require("async");
var abi = require("augur-abi");
var clone = require("clone");
var pass = require("../../../src/utils/pass");
var isFunction = require("../../../src/utils/is-function");
var augurpath = "../../../src/index";
var constants = require("../../../src/constants");
var tools = require("../../tools");

var augur = tools.setup(require(augurpath));

var amount = "1";
var branchID = augur.constants.DEFAULT_BRANCH_ID;
var accounts = tools.get_test_accounts(augur, tools.MAX_TEST_ACCOUNTS);
var outcome = 1;
var numMarkets = parseInt(augur.Branches.getNumMarketsBranch(branchID), 10);
var markets = augur.Branches.getSomeMarketsInBranch(branchID, numMarkets - 100, numMarkets);
var numMarkets = markets.length;
var marketId = tools.select_random(markets);
if (numMarkets > tools.MAX_TEST_SAMPLES) {
  var randomMarkets = [];
  numMarkets = tools.MAX_TEST_SAMPLES;
  do {
    if (randomMarkets.indexOf(marketId) === -1) {
      randomMarkets.push(marketId);
    }
    marketId = tools.select_random(markets);
  } while (randomMarkets.length < tools.MAX_TEST_SAMPLES);
  markets = randomMarkets;
}
tools.TIMEOUT *= 2;

var errorCheck = function (output, done) {
  done = done || pass;
  if (output && output.constructor === Object && output.error) {
    return done(new Error(JSON.stringify(output)));
  }
  return {output: output, done: done};
};

var runtests = function (method, test) {
  var arglen = arguments.length;
  var params = new Array(arglen - 2);
  if (params.length) {
    for (var i = 2; i < arglen; ++i) {
      params[i - 2] = arguments[i];
    }
  }
  describe(params.toString(), function () {
    it("async", function (done) {
      this.timeout(tools.TIMEOUT);
      augur[method].apply(augur, params.concat(function (output) {
        test(errorCheck(output, done), params);
      }));
    });
    it("sync", function (done) {
      this.timeout(tools.TIMEOUT);
      var output = augur[method].apply(augur, params);
      test(errorCheck(output, done), params);
    });
  });
};

var testMarketInfo = function (market, info) {
  var r = info;
  assert(info.constructor === Object);
  assert.isObject(r);
  assert.property(r, "network");
  assert(r.network === "7" || r.network === "10101" || r.network === constants.DEFAULT_NETWORK_ID);
  assert.property(r, "makerFee");
  assert.isNotNull(r.makerFee);
  assert.property(r, "takerFee");
  assert.isNotNull(r.takerFee);
  assert.property(r, "tradingFee");
  assert.isNotNull(r.tradingFee);
  assert.property(r, "tags");
  assert.isNotNull(r.tags);
  assert.property(r, "numOutcomes");
  assert.isAbove(r.numOutcomes, 1);
  assert.strictEqual(parseInt(augur.getMarketNumOutcomes(market)), r.numOutcomes);
  assert.property(r, "tradingPeriod");
  assert.isNumber(r.tradingPeriod);
  assert.strictEqual(parseInt(augur.getTradingPeriod(market)), r.tradingPeriod);
  assert.property(r, "branchID");
  assert.strictEqual(parseInt(augur.getBranchID(market)), parseInt(r.branchID));
  assert.strictEqual(parseInt(augur.getNumEvents(market)), r.numEvents);
  assert.property(r, "cumulativeScale");
  assert.property(r, "creationFee");
  assert.strictEqual(augur.getCreationFee(market), r.creationFee);
  assert.property(r, "author");
  assert.strictEqual(augur.getCreator(market), r.author);
  assert.property(r, "endDate");
  assert.property(r, "outcomes");
  assert.isArray(r.outcomes);
  assert.isAbove(r.outcomes.length, 1);
  for (var i = 0, len = r.outcomes.length; i < len; ++i) {
    assert.property(r.outcomes[i], "id");
    assert.isNumber(r.outcomes[i].id);
    assert.property(r.outcomes[i], "outstandingShares");
    assert(abi.number(r.outcomes[i].outstandingShares) >= 0);
  }
  assert.property(r, "eventID");
  assert.isString(r.eventID);
};

before(function () {
  augur = tools.setup(require(augurpath));
});
describe("getMarketInfo", function () {
  var test = function (t, params) {
    testMarketInfo(params[0], t.output);
    t.done();
  };
  for (var i = 0; i < numMarkets; ++i) {
    runtests(this.title, test, markets[i]);
  }
});
describe("batchGetMarketInfo", function () {
  var test = function (t, params) {
    for (var market in t.output) {
      if (t.output.hasOwnProperty(market)) {
        testMarketInfo(market, t.output[market]);
      }
    }
    t.done();
  };
  runtests(this.title, test, markets);
});
describe("getMarketsInfo", function () {
  var test = function (info, options, done) {
    if (isFunction(options) && !done) {
      done = options;
      options = undefined;
    }
    options = options || {};
    assert.isObject(info);
    var numMarkets = options.numMarkets || parseInt(augur.Branches.getNumMarketsBranch(branchID));
    var market;
    assert.strictEqual(Object.keys(info).length, numMarkets);
    for (var marketId in info) {
      if (info.hasOwnProperty(marketId)) {
        market = info[marketId];
        assert.isNumber(market.tradingPeriod);
        assert.isString(market.tradingFee);
        assert.isString(market.makerFee);
        assert.isString(market.takerFee);
        assert.isNumber(market.creationTime);
        assert.isString(market.volume);
        assert.isArray(market.tags);
        assert.isNumber(market.endDate);
        assert.isString(market.description);
      }
    }
    if (done) done();
  };
  var params = {
    branch: branchID,
    offset: 0,
    numMarketsToLoad: 3
  };
  it("sync", function () {
    this.timeout(tools.TIMEOUT);
    test(augur.getMarketsInfo(params), {numMarkets: params.numMarketsToLoad});
  });
  it("sync/missing offset", function () {
    this.timeout(tools.TIMEOUT);
    var p = tools.copy(params);
    delete p.offset;
    test(augur.getMarketsInfo(p), {numMarkets: p.numMarketsToLoad});
  });
  it("async", function (done) {
    this.timeout(tools.TIMEOUT);
    params.callback = function (info) {
      if (info.error) return done(info);
      test(info, {numMarkets: params.numMarketsToLoad}, done);
    };
    augur.getMarketsInfo(params);
  });
  it("async/offset=1/numMarketsToLoad=2", function (done) {
    this.timeout(tools.TIMEOUT);
    var numMarketsToLoad = 3;
    augur.getMarketsInfo({
      branch: branchID,
      offset: 1,
      numMarketsToLoad: numMarketsToLoad,
      callback: function (info) {
        if (info.error) return done(info);
        assert.strictEqual(Object.keys(info).length, numMarketsToLoad);
        test(info, {numMarkets: numMarketsToLoad}, done);
      }
    });
  });
});
describe("shrink/expandScalarPrice", function () {
  var test = function (t) {
    it(JSON.stringify(t), function () {
      var smallPrice = augur.shrinkScalarPrice(t.minValue, t.price);
      assert.strictEqual(smallPrice, t.expected);
      assert.strictEqual(augur.expandScalarPrice(t.minValue, smallPrice), t.price);
      assert.isAtMost(parseFloat(smallPrice), abi.bignum(t.maxValue).minus(abi.bignum(t.minValue)).toNumber());
    });
  };
  test({
    maxValue: "10",
    minValue: "5",
    price: "10",
    expected: "5"
  });
  test({
    maxValue: "10",
    minValue: "5",
    price: "5",
    expected: "0"
  });
  test({
    maxValue: "10",
    minValue: "5",
    price: "7.5",
    expected: "2.5"
  });
  test({
    maxValue: "5",
    minValue: "-3",
    price: "4",
    expected: "7"
  });
  test({
    maxValue: "4",
    minValue: "-12",
    price: "3",
    expected: "15"
  });
  test({
    maxValue: "-2",
    minValue: "-3",
    price: "-2.1",
    expected: "0.9"
  });
  test({
    maxValue: "0",
    minValue: "-1000",
    price: "-10",
    expected: "990"
  });
  test({
    maxValue: "50000",
    minValue: "2000",
    price: "2001",
    expected: "1"
  });
});
describe("getOrderBook", function () {
  var test = function (t) {
    var marketInfo;
    assert.isObject(t.output);
    for (var type in t.output) {
      if (t.output.hasOwnProperty(type)) {
        assert.isObject(t.output[type]);
        for (var orderId in t.output[type]) {
          if (t.output[type].hasOwnProperty(orderId)) {
            var order = t.output[type][orderId];
            marketInfo = augur.getMarketInfo(order.market);
            assert.isNotNull(marketInfo);
            assert.isString(marketInfo.type);
            assert.strictEqual(type, order.type);
            assert.isString(order.id);
            assert.isString(order.market);
            assert.isString(order.amount);
            assert.isString(order.price);
            assert.isString(order.owner);
            assert.strictEqual(order.owner, abi.format_address(order.owner));
            assert.isNumber(order.block);
            assert.isString(order.outcome);
            assert.deepEqual(augur.get_trade(order.id), order);
          }
        }
      }
    }
    t.done();
  };
  for (var i = 0; i < numMarkets; ++i) {
    runtests(this.title, test, markets[i]);
  }
});

"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var abi = require("augur-abi");
var proxyquire = require('proxyquire');
var augur = new (require("../../../src"))();
var constants = require("../../../src/constants");

describe("positions", function () {

  function fix(n) {
    return abi.format_int256(abi.fix(n, "hex"));
  }

  function stripFix(n) {
    return abi.strip_0x(abi.format_int256(abi.fix(n, "hex")));
  }

  describe("modifyPosition", function () {
    var test = function (t) {
      it(t.description, function () {
        t.assertions(require('../../../src/trading/positions/modify-position')(t.typeCode, t.position, t.numShares));
      });
    };
    test({
      description: "buy 1 share, no position",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000001",
      position: new BigNumber("0"),
      numShares: fix("1"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("1", 10));
      }
    });
    test({
      description: "buy 1 share, position 1",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000001",
      position: new BigNumber("1", 10),
      numShares: fix("1"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("2", 10));
      }
    });
    test({
      description: "buy 0.1 share, position 0.2",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000001",
      position: new BigNumber("0.2", 10),
      numShares: fix("0.1"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("0.3", 10));
      }
    });
    test({
      description: "buy 0.2 shares, position 123.4567",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000001",
      position: new BigNumber("123.4567", 10),
      numShares: fix("0.2"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("123.6567", 10));
      }
    });
    test({
      description: "buy 123.4567 shares, position 0.2",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000001",
      position: new BigNumber("0.2", 10),
      numShares: fix("123.4567"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("123.6567", 10));
      }
    });
    test({
      description: "sell 1 share, position 0",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000002",
      position: new BigNumber("0"),
      numShares: fix("1"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("-1", 10));
      }
    });
    test({
      description: "sell 1 share, position 1",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000002",
      position: new BigNumber("1", 10),
      numShares: fix("1"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("0"));
      }
    });
    test({
      description: "sell 0.1 share, position 0.2",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000002",
      position: new BigNumber("0.2", 10),
      numShares: fix("0.1"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("0.1", 10));
      }
    });
    test({
      description: "sell 0.2 shares, position 123.4567",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000002",
      position: new BigNumber("123.4567", 10),
      numShares: fix("0.2"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("123.2567", 10));
      }
    });
    test({
      description: "sell 123.4567 shares, position 0.2",
      typeCode: "0x0000000000000000000000000000000000000000000000000000000000000002",
      position: new BigNumber("0.2", 10),
      numShares: fix("123.4567"),
      assertions: function (output) {
        assert.deepEqual(output, new BigNumber("-123.2567", 10));
      }
    });
  });

  describe("calculateCompleteSetsShareTotals", function () {
    var test = function (t) {
      it(t.description, function () {
        t.assertions(require('../../../src/trading/positions/calculate-complete-sets-share-totals')(t.logs));
      });
    };
    test({
      description: 'logs completely missing',
      logs: undefined,
      assertions: function (output) {
        assert.deepEqual(output, {});
      }
    });
    test({
      description: "no logs",
      logs: [],
      assertions: function (output) {
        assert.deepEqual(output, {});
      }
    });
    test({
      description: "1 log, 1 market: buy 1 share",
      logs: [{
        data: fix("1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("1", 10)
        });
      }
    });
    test({
      description: "2 logs, 1 market: [buy 1, sell 1]",
      logs: [{
        data: fix("1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000002"
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("0")
        });
      }
    });
    test({
      description: "2 logs, 1 market: [buy 3.1415, sell 2.1]",
      logs: [{
        data: fix("3.1415"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("2.1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000002"
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("1.0415", 10)
        });
      }
    });
    test({
      description: "2 logs, 1 market: [sell 3.1415, buy 2.1]",
      logs: [{
        data: fix("3.1415"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000002"
        ]
      }, {
        data: fix("2.1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("-1.0415", 10)
        });
      }
    });
    test({
      description: "4 logs, 1 market: [buy 3.1415, buy 2, buy 10.1, sell 0.5]",
      logs: [{
        data: fix("3.1415"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("2"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("10.1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("0.5"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000002"
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("14.7415", 10)
        });
      }
    });
    test({
      description: "4 logs, 2 markets: [buy 50 of 1, buy 0.1 of 1, buy 0.42 of 2, sell 0.1 of 2]",
      logs: [{
        data: fix("50"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("0.1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("0.42"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x8000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("0.1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x8000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000002"
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("50.1", 10),
          "0x8000000000000000000000000000000000000000000000000000000000000000": new BigNumber("0.32", 10)
        });
      }
    });
    test({
      description: "4 logs, 4 markets: [sell 50 of 1, buy 0.1 of 2, buy 0.42 of 3, buy 1 of 4]",
      logs: [{
        data: fix("50"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x0000000000000000000000000000000000000000000000000000000000000002"
        ]
      }, {
        data: fix("0.1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x8000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("0.42"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x00000000000000000000000000000000000000000000000000000000deadbeef",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }, {
        data: fix("1"),
        topics: [
          "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
          "0x0000000000000000000000000000000000000000000000000000000000000b0b",
          "0x1111111111111111111111111111111111111111111111111111111111111111",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("-50", 10),
          "0x8000000000000000000000000000000000000000000000000000000000000000": new BigNumber("0.1", 10),
          "0x00000000000000000000000000000000000000000000000000000000deadbeef": new BigNumber("0.42", 10),
          "0x1111111111111111111111111111111111111111111111111111111111111111": new BigNumber("1", 10)
        });
      }
    });
  });

  describe("calculateCompleteSetsEffectivePrice", function () {
    var test = function (t) {
      it(JSON.stringify(t), function () {
        t.assertions(require('../../../src/trading/positions/calculate-complete-sets-effective-price')(t.logs));
      });
    };
    test({
      logs: undefined,
      assertions: function (out) {
        assert.deepEqual(out, {});
      }
    });
    test({
      logs: [],
      assertions: function (out) {
        assert.deepEqual(out, {});
      }
    });
    test({
      logs: [{
        topics: ['0x0', '0x0', '0xa1'],
        data: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005'
      },
      {
        topics: ['0x0', '0x0', '0xa2'],
        data: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003'
      }],
      assertions: function (out) {
        assert.deepEqual(JSON.stringify(out), JSON.stringify({
          '0xa1': '0.2',
          '0xa2': '0.33333333333333333333'
        }));
      }
    });
  });

  describe("calculateShortSellBuyCompleteSetsEffectivePrice", function () {
    // 3 tests total
    var test = function (t) {
      it(JSON.stringify(t), function () {
        t.assertions(require('../../../src/trading/positions/calculate-short-sell-buy-complete-sets-effective-price')(t.logs));
      });
    };
    test({
      logs: undefined,
      assertions: function (effectivePrice) {
        assert.deepEqual(effectivePrice, {});
      }
    });
    test({
      logs: [],
      assertions: function (effectivePrice) {
        assert.deepEqual(effectivePrice, {});
      }
    });
    test({
      logs: [{
        data: fix('1') + stripFix('2') + stripFix('3') + stripFix('4') + stripFix('5') + stripFix('6') + stripFix('7')+ stripFix('0.000000000000000002'),
        topics: ['0x0', '0xa1'],
      }],
      assertions: function (effectivePrice) {
        assert.deepEqual(JSON.stringify(effectivePrice), JSON.stringify({
          '0xa1': new BigNumber('.5')
        }));
      }
    });
  });

  describe("calculateShortSellShareTotals", function () {
    var test = function (t) {
      it(t.description, function () {
        t.assertions(require('../../../src/trading/positions/calculate-short-sell-share-totals')(t.logs));
      });
    };
    test({
      description: "logs undefined",
      logs: undefined,
      assertions: function (output) {
        assert.deepEqual(output, {});
      }
    });
    test({
      description: "no logs",
      logs: [],
      assertions: function (output) {
        assert.deepEqual(output, {});
      }
    });
    test({
      description: "1 log, 1 market: 1 outcome 1",
      logs: [{
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("1").replace("0x", "")+
                    "0000000000000000000000000000000100000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("1", 10)
        });
      }
    });
    test({
      description: "2 logs, 1 market: [0.1 outcome 1, 0.2 outcome 1]",
      logs: [{
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("0.1").replace("0x", "")+
                    "0000000000000000000000000000000100000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }, {
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("0.2").replace("0x", "")+
                    "0000000000000000000000000000000200000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("0.3", 10)
        });
      }
    });
    test({
      description: "2 logs, 2 markets: [123.456789 outcome 1 market 1, 987654.321 outcome 3 market 2]",
      logs: [{
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("123.456789").replace("0x", "")+
                    "0000000000000000000000000000000100000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }, {
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("987654.321").replace("0x", "")+
                    "0000000000000000000000000000000200000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x8000000000000000000000000000000000000000000000000000000000000000",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("123.456789", 10),
          "0x8000000000000000000000000000000000000000000000000000000000000000": new BigNumber("987654.321", 10)
        });
      }
    });
    test({
      description: "4 logs, 2 markets: [50 outcome 1 market 1, 10 outcome 1 market 1, 3.1415 outcome 2 market 1, 123.456789 outcome 1 market 2]",
      logs: [{
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("50").replace("0x", "")+
                    "0000000000000000000000000000000100000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }, {
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("10").replace("0x", "")+
                    "0000000000000000000000000000000200000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }, {
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("3.1415").replace("0x", "")+
                    "0000000000000000000000000000000200000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000002", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }, {
        data: "0x"+
                    "1000000000000000000000000000000000000000000000000000000000000000"+
                    fix("123.456789").replace("0x", "")+
                    "0000000000000000000000000000000200000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001", // outcome
        topics: [
          "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
          "0x8000000000000000000000000000000000000000000000000000000000000000",
          "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
          "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
        ]
      }],
      assertions: function (output) {
        assert.deepEqual(output, {
          "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("60", 10),
          "0x8000000000000000000000000000000000000000000000000000000000000000": new BigNumber("123.456789", 10)
        });
      }
    });
  });

  describe("calculateShareTotals", function () {
    var test = function (t) {
      it(t.description, function () {
        t.assertions(require('../../../src/trading/positions/calculate-share-totals')(t.logs));
      });
    };
    test({
      description: "no logs",
      logs: {
        shortAskBuyCompleteSets: [],
        shortSellBuyCompleteSets: [],
        sellCompleteSets: []
      },
      assertions: function (output) {
        assert.deepEqual(output, {
          shortAskBuyCompleteSets: {},
          shortSellBuyCompleteSets: {},
          sellCompleteSets: {}
        });
      }
    });
    test({
      description: "4 short ask logs, 1 short sell log, 2 complete sets logs",
      logs: {
        shortAskBuyCompleteSets: [{
          data: fix("50"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }, {
          data: fix("0.1"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }, {
          data: fix("0.42"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x8000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }, {
          data: fix("0.1"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x8000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }],
        shortSellBuyCompleteSets: [{
          data: "0x"+
                "1000000000000000000000000000000000000000000000000000000000000000"+
                fix("1").replace("0x", "")+
                "0000000000000000000000000000000100000000000000000000000000000000"+
                "0000000000000000000000000000000000000000000000000000000000000001", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }],
        sellCompleteSets: [{
          data: fix("3.1415"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }]
      },
      assertions: function (output) {
        assert.deepEqual(output, {
          shortAskBuyCompleteSets: {
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("50.1", 10),
            "0x8000000000000000000000000000000000000000000000000000000000000000": new BigNumber("0.32", 10)
          },
          shortSellBuyCompleteSets: {
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("1", 10)
          },
          sellCompleteSets: {
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": new BigNumber("-3.1415", 10)
          }
        });
      }
    });
  });

  describe("decreasePosition", function () {
    var test = function (t) {
      it(t.description, function () {
        t.assertions(require('../../../src/trading/positions/decrease-position')(t.position, t.adjustment));
      });
    };
    test({
      description: "no position, no adjustment",
      position: {
        "1": "0",
        "2": "0"
      },
      adjustment: new BigNumber("0"),
      assertions: function (output) {
        assert.deepEqual(output, {
          "1": "0",
          "2": "0"
        });
      }
    });
    test({
      description: "position [1, 1], adjustment 1",
      position: {
        "1": "1",
        "2": "1"
      },
      adjustment: new BigNumber("1", 10),
      assertions: function (output) {
        assert.deepEqual(output, {
          "1": "0",
          "2": "0"
        });
      }
    });
    test({
      description: "position [1, 1], adjustment 0.75",
      position: {
        "1": "1",
        "2": "1"
      },
      adjustment: new BigNumber("0.75", 10),
      assertions: function (output) {
        assert.deepEqual(output, {
          "1": "0.25",
          "2": "0.25"
        });
      }
    });
    test({
      description: "position [2, 1], adjustment 2",
      position: {
        "1": "2",
        "2": "1"
      },
      adjustment: new BigNumber("2", 10),
      assertions: function (output) {
        assert.deepEqual(output, {
          "1": "0",
          "2": "-1"
        });
      }
    });
    test({
      description: "position [2.1, 0.9], adjustment 0.2",
      position: {
        "1": "2.1",
        "2": "0.9"
      },
      adjustment: new BigNumber("0.2", 10),
      assertions: function (output) {
        assert.deepEqual(output, {
          "1": "1.9",
          "2": "0.7"
        });
      }
    });
    test({
      description: "position [2.1, 0.9], adjustment 0.9",
      position: {
        "1": "2.1",
        "2": "0.9"
      },
      adjustment: new BigNumber("0.9", 10),
      assertions: function (output) {
        assert.deepEqual(output, {
          "1": "1.2",
          "2": "0"
        });
      }
    });
    test({
      description: "position [2.1, 0.9], adjustment 2",
      position: {
        "1": "2.1",
        "2": "0.9"
      },
      adjustment: new BigNumber("2", 10),
      assertions: function (output) {
        assert.deepEqual(output, {
          "1": "0.1",
          "2": "-1.1"
        });
      }
    });
  });

  describe("findUniqueMarketIDs", function () {
    var test = function (t) {
      it(t.description, function () {
        t.assertions(require('../../../src/trading/positions/find-unique-market-ids')(t.shareTotals));
      });
    };
    test({
      description: "no markets",
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {},
        sellCompleteSets: {}
      },
      assertions: function (output) {
        assert.deepEqual(output, []);
      }
    });
    test({
      description: "1 short ask market, 1 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {"0x1": null},
        shortSellBuyCompleteSets: {},
        sellCompleteSets: {}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1"]);
      }
    });
    test({
      description: "1 short sell market, 1 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {"0x1": null},
        sellCompleteSets: {}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1"]);
      }
    });
    test({
      description: "1 complete sets market, 1 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {},
        sellCompleteSets: {"0x1": null}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1"]);
      }
    });
    test({
      description: "2 short ask markets, 2 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {"0x1": null, "0x2": null},
        shortSellBuyCompleteSets: {},
        sellCompleteSets: {}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1", "0x2"]);
      }
    });
    test({
      description: "2 short sell markets, 2 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {"0x1": null, "0x2": null},
        sellCompleteSets: {}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1", "0x2"]);
      }
    });
    test({
      description: "2 short ask markets, 1 short sell market, 3 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {"0x1": null, "0x2": null},
        shortSellBuyCompleteSets: {"0x3": null},
        sellCompleteSets: {}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1", "0x2", "0x3"]);
      }
    });
    test({
      description: "2 short ask markets, 1 short sell market, 2 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {"0x1": null, "0x2": null},
        shortSellBuyCompleteSets: {"0x1": null},
        sellCompleteSets: {}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1", "0x2"]);
      }
    });
    test({
      description: "2 short ask markets, 1 short sell market, 3 complete sets markets, 3 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {"0x1": null, "0x2": null},
        shortSellBuyCompleteSets: {"0x3": null},
        sellCompleteSets: {"0x1": null, "0x2": null, "0x3": null}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1", "0x2", "0x3"]);
      }
    });
    test({
      description: "3 short ask markets, 3 short sell markets, 1 complete sets market, 7 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {"0x1": null, "0x2": null, "0x3": null},
        shortSellBuyCompleteSets: {"0x4": null, "0x5": null, "0x6": null},
        sellCompleteSets: {"0x7": null}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1", "0x2", "0x3", "0x4", "0x5", "0x6", "0x7"]);
      }
    });
    test({
      description: "3 short ask markets, 3 short sell markets, 1 complete sets market, 6 unique",
      shareTotals: {
        shortAskBuyCompleteSets: {"0x1": null, "0x2": null, "0x3": null},
        shortSellBuyCompleteSets: {"0x2": null, "0x4": null, "0x5": null},
        sellCompleteSets: {"0x6": null}
      },
      assertions: function (output) {
        assert.deepEqual(output, ["0x1", "0x2", "0x3", "0x4", "0x5", "0x6"]);
      }
    });
  });

  describe("adjustPositions", function () {
    var finished;
    var test = function (t) {
      it(t.description, function (done) {
        finished = done;
        var adjustPositions = proxyquire('../../../src/trading/positions/adjust-positions', {
          '../../markets/get-position-in-market': function (p, callback) {
            if (!callback) return t.onChainPosition[p.market];
            callback(t.onChainPosition[p.market]);
          }
        });
        adjustPositions(t.account, t.marketIDs, t.shareTotals, t.assertions);
      });
    };
    test({
      description: "1 market, 2 outcomes, no position, short ask 0, short sell 0",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {},
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "0",
          "2": "0"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "0",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "handle an undefined onChainPosition from getPositionInMarket",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {},
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": undefined
      },
      assertions: function (err, output) {
        assert.deepEqual(err, "couldn't load position in 0x1");
        assert.isUndefined(output);
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 1 position, short ask 0, short sell 0",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {},
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "1",
          "2": "0"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "1",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 1 position, short ask 0, short sell 1",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("1", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "0",
          "2": "1"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 1, short sell 0",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("1", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "1",
          "2": "1"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "0",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 1, short sell 1",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("1", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("1", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "1",
          "2": "2"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 1 position, short ask 0, short sell 2",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "2",
          "2": "0"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "0",
            "2": "-2"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 0, short sell 2 [1 outcome 1, 1 outcome 2]",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {},
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "1",
          "2": "1"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1",
            "2": "-1"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 2, short sell 2",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "2",
          "2": "4"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-2",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 2, short sell 2 [1 outcome 1, 1 outcome 2]",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "3",
          "2": "3"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1",
            "2": "-1"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 2, short sell 5",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("5", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "7",
          "2": "2"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "0",
            "2": "-5"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 5, short sell 2",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "5",
          "2": "7"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-2",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 2 outcomes, 2 positions, short ask 5.1, short sell 2.2 [1.2 outcome 1, 1 outcome 2]",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5.1", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2.2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "6.1",
          "2": "6.3"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1.2",
            "2": "-1"
          }
        });
        finished();
      }
    });
    test({
      description: "2 markets, short ask 5.1 market 1, short sell 2.2 market 1 [1.2 outcome 1, 1 outcome 2] 2 market 2 [2 outcome 5]",
      account: "0xb0b",
      marketIDs: ["0x1", "0x2"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5.1", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2.2", 10),
          "0x2": new BigNumber("2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "6.1",
          "2": "6.3"
        },
        "0x2": {
          "1": "2",
          "2": "2",
          "3": "2",
          "4": "2",
          "5": "0",
          "6": "2",
          "7": "2"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1.2",
            "2": "-1"
          },
          "0x2": {
            "1": "0",
            "2": "0",
            "3": "0",
            "4": "0",
            "5": "-2",
            "6": "0",
            "7": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "2 markets, short ask [5.1 market 1, 0.1 market 2], short sell 2.2 market 1 [1.2 outcome 1, 1 outcome 2] 2 market 2 [2 outcome 5]",
      account: "0xb0b",
      marketIDs: ["0x1", "0x2"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5.1", 10),
          "0x2": new BigNumber("0.1", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2.2", 10),
          "0x2": new BigNumber("2", 10)
        },
        sellCompleteSets: {}
      },
      onChainPosition: {
        "0x1": {
          "1": "6.1",
          "2": "6.3"
        },
        "0x2": {
          "1": "2.1",
          "2": "2.1",
          "3": "2.1",
          "4": "2.1",
          "5": "0.1",
          "6": "2.1",
          "7": "2.1"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1.2",
            "2": "-1"
          },
          "0x2": {
            "1": "0",
            "2": "0",
            "3": "0",
            "4": "0",
            "5": "-2",
            "6": "0",
            "7": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, short ask 5, short sell [2 outcome 1, 1 outcome 2], sell complete sets 6",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        sellCompleteSets: {
          "0x1": new BigNumber("-6", 10)
        }
      },
      onChainPosition: {
        "0x1": {
          "1": "0", // change:  +5   0  +1  -6
                    // balance: +5  +5  +6   0
                    // display:  0  -2  -2  -1
                    //           0  -2   0  +1

          "2": "1"  // change:  +5  +2   0  -6
                    // balance: +5  +7  +7  +1
                    // display:  0   0  -1   0
                    //           0   0  -1  +1
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-1",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, short ask 5.1, short sell [1.2 outcome 1, 1 outcome 2], sell complete sets 6.1",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5.1", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("1.2", 10),
        },
        sellCompleteSets: {
          "0x1": new BigNumber("-6.1", 10)
        }
      },
      onChainPosition: {
        "0x1": {
          "1": "0",  // change:  +5.1   0.0  +1.0  -6.1
                     // balance: +5.1  +5.1  +6.1   0.0
                     // display:  0.0  -1.2  -1.2  -0.2
                     //           0.0  -1.2  -1.2  +1.0

          "2": "0.2" // change:  +5.1  +1.2   0.0  -6.1
                     // balance: +5.1  +6.3  +6.3  +0.2
                     // display:  0.0   0.0  -1.0   0.0
                     //           0.0   0.0  -1.0  +1.0
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-0.2",
            "2": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "2 markets, short ask [5.1 market 1, 1.2345 market 2], short sell market 1 [1.2 outcome 1, 1 outcome 2] market 2 [2 outcome 5], sell complete sets [6.1 market 1, sell 1.2345 market 2]",
      account: "0xb0b",
      marketIDs: ["0x1", "0x2"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5.1", 10),
          "0x2": new BigNumber("1.2345", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("1.2", 10),
          "0x2": new BigNumber("2", 10)
        },
        sellCompleteSets: {
          "0x1": new BigNumber("-6.1", 10),
          "0x2": new BigNumber("-1.2345", 10)
        }
      },
      onChainPosition: {
        "0x1": {
          "1": "0",
          "2": "0.2"
        },
        "0x2": {
          "1": "2",
          "2": "2",
          "3": "2",
          "4": "2",
          "5": "0",
          "6": "2",
          "7": "2"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-0.2",
            "2": "0"
          },
          "0x2": {
            "1": "0",
            "2": "0",
            "3": "0",
            "4": "0",
            "5": "-2",
            "6": "0",
            "7": "0"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, initial position [3, 1], short ask 5, short sell [2 outcome 1, 1 outcome 2], sell complete sets 6",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("2", 10)
        },
        sellCompleteSets: {
          "0x1": new BigNumber("-6", 10)
        }
      },
      onChainPosition: {
        "0x1": {
          "1": "3",
          "2": "2"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "2",
            "2": "1"
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, initial position [1.2, 10.101], short ask 5.1, short sell [1.2 outcome 1, 1 outcome 2], sell complete sets 6.1",
      account: "0xb0b",
      marketIDs: ["0x1"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5.1", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("1.2", 10),
        },
        sellCompleteSets: {
          "0x1": new BigNumber("-6.1", 10)
        }
      },
      onChainPosition: {
        "0x1": {
          "1": "1.2",
          "2": "10.301"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "1",
            "2": "10.101"
          }
        });
        finished();
      }
    });
    test({
      description: "2 markets, initial position ([0.1, 0], [0, 71, 0, 0, 0, 0.112, 0]), short ask [5.1 market 1, 1.2345 market 2], short sell market 1 [1.2 outcome 1, 1 outcome 2] market 2 [2 outcome 5], sell complete sets [6.1 market 1, sell 1.2345 market 2]",
      account: "0xb0b",
      marketIDs: ["0x1", "0x2"],
      shareTotals: {
        shortAskBuyCompleteSets: {
          "0x1": new BigNumber("5.1", 10),
          "0x2": new BigNumber("1.2345", 10)
        },
        shortSellBuyCompleteSets: {
          "0x1": new BigNumber("1.2", 10),
          "0x2": new BigNumber("2", 10)
        },
        sellCompleteSets: {
          "0x1": new BigNumber("-6.1", 10),
          "0x2": new BigNumber("-1.2345", 10)
        }
      },
      onChainPosition: {
        "0x1": {
          "1": "0.1",
          "2": "0.2"
        },
        "0x2": {
          "1": "2",
          "2": "73",
          "3": "2",
          "4": "2",
          "5": "0",
          "6": "2.112",
          "7": "2"
        }
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          "0x1": {
            "1": "-0.1",
            "2": "0"
          },
          "0x2": {
            "1": "0",
            "2": "71",
            "3": "0",
            "4": "0",
            "5": "-2",
            "6": "0.112",
            "7": "0"
          }
        });
        finished();
      }
    });
  });

  describe("getAdjustedPositions", function () {
    var finished;
    var test = function (t) {
      it(t.description, function (done) {
        finished = done;
        var getAdjustedPositions = proxyquire('../../../src/trading/positions/get-adjusted-positions', {
          './adjust-positions': function(account, marketIDs, shareTotals, callback) {
            callback(null, { account: account, marketIDs: marketIDs, shareTotals: shareTotals });
          },
          '../../logs/get-short-ask-buy-complete-sets-logs': function (p, callback) {
            if (!callback) return t.logs.shortAskBuyCompleteSets;
            callback(null, t.logs.shortAskBuyCompleteSets);
          },
          '../../logs/get-taker-short-sell-logs': function (p, callback) {
            if (!callback) return t.logs.shortSellBuyCompleteSets;
            callback(null, t.logs.shortSellBuyCompleteSets);
          },
          '../../logs/get-sell-complete-sets-logs': function (p, callback) {
            if (!callback) return t.logs.sellCompleteSets;
            callback(null, t.logs.sellCompleteSets);
          },
        });

        getAdjustedPositions(t.params, t.assertions);
      });
    };
    test({
      description: "no logs",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [],
        shortSellBuyCompleteSets: [],
        sellCompleteSets: []
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(output, {
          account: '0xb0b',
          marketIDs: [],
          shareTotals: {
            shortAskBuyCompleteSets: {},
            shortSellBuyCompleteSets: {},
            sellCompleteSets: {},
          }
        });
        finished();
      }
    });
    test({
      description: "1 market, 1 short ask",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [{
          data: fix("3"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }],
        shortSellBuyCompleteSets: [],
        sellCompleteSets: []
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ],
          shareTotals: {
            shortAskBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '3'
            },
            shortSellBuyCompleteSets: {},
            sellCompleteSets: {}
          }
        }));
        finished();
      }
    });
    test({
      description: "1 market, 1 short sell",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [],
        shortSellBuyCompleteSets: [{
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("1").replace("0x", "")+
                        "0000000000000000000000000000000100000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000001", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }],
        sellCompleteSets: []
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ],
          shareTotals: {
            shortAskBuyCompleteSets: {},
            shortSellBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '1'
            },
            sellCompleteSets: {}
          }
        }));
        finished();
      }
    });
    test({
      description: "1 market, 2 sell complete sets",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [],
        shortSellBuyCompleteSets: [],
        sellCompleteSets: [{
          data: fix("3"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }, {
          data: fix("2.1"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }]
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ],
          shareTotals: {
            shortAskBuyCompleteSets: {},
            shortSellBuyCompleteSets: {},
            sellCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '-5.1'
            }
          }
        }));
        finished();
      }
    });
    test({
      description: "1 market, 1 short ask, 2 sell complete sets",
      params: {
        account: "0xb0b",
        filter: { market: '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' }
      },
      logs: {
        shortAskBuyCompleteSets: [{
          data: fix("6"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }],
        shortSellBuyCompleteSets: [],
        sellCompleteSets: [{
          data: fix("3"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }, {
          data: fix("2.1"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }]
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ],
          shareTotals: {
            shortAskBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '6'
            },
            shortSellBuyCompleteSets: {},
            sellCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '-5.1'
            }
          }
        }));
        finished();
      }
    });
    test({
      description: "1 market, 1 short ask, 1 short sell, 1 sell complete sets",
      params: {
        account: '0xb0b',
      },
      logs: {
        shortAskBuyCompleteSets: [{
          data: fix("3"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }],
        shortSellBuyCompleteSets: [{
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("1").replace("0x", "")+
                        "0000000000000000000000000000000100000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000001", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }],
        sellCompleteSets: [{
          data: fix("0.9"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }]
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ],
          shareTotals: {
            shortAskBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '3'
            },
            shortSellBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '1'
            },
            sellCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '0.9'
            }
          }
        }));
        finished();
      }
    });
    test({
      description: "1 market, 1 short ask, 2 short sells [0.1 outcome 1, 0.2 outcome 1], 1 sell complete sets",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [{
          data: fix("3"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }],
        shortSellBuyCompleteSets: [{
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.1").replace("0x", "")+
                        "0000000000000000000000000000000100000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000001", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }, {
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.2").replace("0x", "")+
                        "0000000000000000000000000000000200000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000001", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }],
        sellCompleteSets: [{
          data: fix("0.9"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }]
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ],
          shareTotals: {
            shortAskBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '3'
            },
            shortSellBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '0.3'
            },
            sellCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '0.9'
            }
          }
        }));
        finished();
      }
    });
    test({
      description: "1 market, 1 short ask, 2 short sells [0.1 outcome 1, 0.2 outcome 2], 2 complete sets [buy 3, sell 2.1]",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [{
          data: fix("3"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }],
        shortSellBuyCompleteSets: [{
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.1").replace("0x", "")+
                        "0000000000000000000000000000000100000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000001", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }, {
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.2").replace("0x", "")+
                        "0000000000000000000000000000000200000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000002", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }],
        sellCompleteSets: [{
          data: fix("3"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ]
        }, {
          data: fix("2.1"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }]
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ],
          shareTotals: {
            shortAskBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '3'
            },
            shortSellBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '0.2'
            },
            sellCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '0.9'
            }
          }
        }));
        finished();
      }
    });
    test({
      description: "2 markets, position ([0, 0], [2, 2, 2, 2, 2, 2, 2, 2]), 2 short sells [0.1 outcome 2 market 1, 0.2 outcome 2 market 2], 1 sell complete sets [1 market 2]",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [],
        shortSellBuyCompleteSets: [{
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.1").replace("0x", "")+
                        "0000000000000000000000000000000100000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000002", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }, {
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.2").replace("0x", "")+
                        "0000000000000000000000000000000200000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000002", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x8000000000000000000000000000000000000000000000000000000000000000",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }],
        sellCompleteSets: [{
          data: fix("1"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x8000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }]
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', '0x8000000000000000000000000000000000000000000000000000000000000000' ],
          shareTotals: {
            shortAskBuyCompleteSets: {},
            shortSellBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '0.1', '0x8000000000000000000000000000000000000000000000000000000000000000': '0.2'
            },
            sellCompleteSets: {
              '0x8000000000000000000000000000000000000000000000000000000000000000': '-1'
            }
          }
        }));
        finished();
      }
    });
    test({
      description: "2 markets, 3 short sells [0.1 outcome 2 market 1, 1.2 outcome 2 market 2, 10000.00001 outcome 7 market 2], 1 sell complete sets [1.2 market 2]",
      params: {
        account: "0xb0b",
      },
      logs: {
        shortAskBuyCompleteSets: [],
        shortSellBuyCompleteSets: [{
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.1").replace("0x", "")+
                        "0000000000000000000000000000000100000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000002", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }, {
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("0.2").replace("0x", "")+
                        "0000000000000000000000000000000200000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000002", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x8000000000000000000000000000000000000000000000000000000000000000",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }, {
          data: "0x"+
                        "1000000000000000000000000000000000000000000000000000000000000000"+
                        fix("10000.00001").replace("0x", "")+
                        "0000000000000000000000000000000300000000000000000000000000000000"+
                        "0000000000000000000000000000000000000000000000000000000000000007", // outcome
          topics: [
            "0x17c6c0dcf7960856660a58fdb9238dc76130b17e20b6511d08e811a3a92ca8c7",
            "0x8000000000000000000000000000000000000000000000000000000000000000",
            "0x000000000000000000000000000000000000000000000000000000000000d00d", // taker
            "0x0000000000000000000000000000000000000000000000000000000000000b0b"  // maker
          ]
        }],
        sellCompleteSets: [{
          data: fix("1.2"),
          topics: [
            "0x2e6b18139c987afb05efb85deddaa40262aa36c9ddebb9be215461cb22078175",
            "0x0000000000000000000000000000000000000000000000000000000000000b0b",
            "0x8000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000002"
          ]
        }]
      },
      assertions: function (err, output) {
        assert.isNull(err);
        assert.deepEqual(JSON.stringify(output), JSON.stringify({
          account: '0xb0b',
          marketIDs: [ '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', '0x8000000000000000000000000000000000000000000000000000000000000000' ],
          shareTotals: {
            shortAskBuyCompleteSets: {},
            shortSellBuyCompleteSets: {
              '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff': '0.1', '0x8000000000000000000000000000000000000000000000000000000000000000': '10000.00001'
            },
            sellCompleteSets: {
              '0x8000000000000000000000000000000000000000000000000000000000000000': '-1.2'
            }
          }
        }));
        finished();
      }
    });
  });

  describe("calculateNetEffectiveTrades", function () {
    var test = function (t) {
      it(JSON.stringify(t), function() {
        t.assertions(require('../../../src/trading/positions/calculate-net-effective-trades')(t.logs));
      });
    };
    test({
      logs: {
        shortAskBuyCompleteSets: [{
          topics: ['0x0', '0x0', '0xa1', '0x1'],
          data: fix('10') + abi.strip_0x(abi.hex('30'))
        },
        {
          topics: ['0x0', '0x0', '0xa2', '0x1'],
          data: fix('10') + abi.strip_0x(abi.hex('15'))
        }],
        shortSellBuyCompleteSets: [{
          data: fix('1') + stripFix('2') + stripFix('3') + stripFix('4') + stripFix('5') + stripFix('6') + stripFix('7')+ stripFix('0.000000000000000002'),
          topics: ['0x0', '0xa1'],
        },
        {
          data: fix('1') + stripFix('2') + stripFix('3') + stripFix('4') + stripFix('5') + stripFix('6') + stripFix('7')+ stripFix('0.000000000000000008'),
          topics: ['0x0', '0xa2'],
        }],
        sellCompleteSets: [{
          topics: ['0x0', '0x0', '0xa1', '0x2'],
          data: fix('5') + abi.strip_0x(abi.hex('10'))
        },
        {
          topics: ['0x0', '0x0', '0xa2', '0x2'],
          data: fix('5') + abi.strip_0x(abi.hex('25'))
        }],
      },
      assertions: function (out) {
        assert.deepEqual(JSON.stringify(out), JSON.stringify({
          '0xa1': {
            shortAskBuyCompleteSets: {
              type: 'buy',
              price: '0.03333333333333333333',
              shares: '10'
            },
            shortSellBuyCompleteSets: {
              type: 'buy',
              price: '0.5',
              shares: '2'
            },
            sellCompleteSets: {
              type: 'sell',
              price: '0.1',
              shares: '5'
            },
          },
          '0xa2': {
            shortAskBuyCompleteSets: {
              type: 'buy',
              price: '0.06666666666666666667',
              shares: '10'
            },
            shortSellBuyCompleteSets: {
              type: 'buy',
              price: '0.125',
              shares: '2'
            },
            sellCompleteSets: {
              type: 'sell',
              price: '0.04',
              shares: '5'
            },
          },
        }));
      }
    });
  });

  describe("calculateUnrealizedPL", function () {
    var test = function (t) {
      it(JSON.stringify(t), function () {
        t.assertions(require('../../../src/trading/positions/calculate-unrealized-pl')(t.position, t.meanOpenPrice, t.lastTradePrice));
      });
    };
    test({
      position: null,
      meanOpenPrice: null,
      lastTradePrice: constants.ZERO,
      assertions: function (out) {
        assert.deepEqual(out, constants.ZERO);
      }
    });
  });

  describe("calculateProfitLoss", function () {
    var test = function (t) {
      it(t.description, function () {
        t.assertions(require('../../../src/trading/positions/calculate-profit-loss')(t.trades, t.lastPrice));
      });
    };
    test({
      description: "no trades, last price 2",
      trades: [],
      lastPrice: "2",
      assertions: function (output) {
        assert.deepEqual(output, {
          position: "0",
          meanOpenPrice: "0",
          realized: "0",
          unrealized: "0",
          queued: "0"
        });
      }
    });
    test({
      description: "no trades, last price 2",
      trades: [],
      lastPrice: "2",
      assertions: function (output) {
        assert.deepEqual(output, {
          position: "0",
          meanOpenPrice: "0",
          realized: "0",
          unrealized: "0",
          queued: "0"
        });
      }
    });

    describe("taker trades", function () {
      test({
        description: "trades: [buy 1 @ 2], last price 2",
        trades: [{
          type: "buy",
          amount: "1",
          price: "2",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "2",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 1 @ 1], last price 2",
        trades: [{
          type: "buy",
          amount: "1",
          price: "1",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "0",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 1 @ 3], last price 2",
        trades: [{
          type: "buy",
          amount: "1",
          price: "3",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "3",
            realized: "0",
            unrealized: "-1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 2 @ 3], last price 2",
        trades: [{
          type: "buy",
          amount: "2",
          price: "3",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "2",
            meanOpenPrice: "3",
            realized: "0",
            unrealized: "-2",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 2 @ 1], last price 1",
        trades: [{
          type: "buy",
          amount: "2",
          price: "1",
          maker: false
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "2",
            meanOpenPrice: "1",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 2 @ 1, sell 1 @ 1], last price 2",
        trades: [{
          type: "buy",
          amount: "2",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "0",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 2 @ 1, sell 1 @ 2], last price 2",
        trades: [{
          type: "buy",
          amount: "2",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "2",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 2 @ 1, sell 2 @ 2], last price 2",
        trades: [{
          type: "buy",
          amount: "2",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "2",
          price: "2",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "2",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 2 @ 1, sell 1 @ 1, sell 1 @ 2], last price 2",
        trades: [{
          type: "buy",
          amount: "2",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "2",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 3 @ 1, sell 1 @ 1, sell 1 @ 2], last price 2",
        trades: [{
          type: "buy",
          amount: "3",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "2",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 3 @ 1, sell 1 @ 2, sell 1 @ 1], last price 2",
        trades: [{
          type: "buy",
          amount: "3",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "2",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 3 @ 1, sell 1 @ 2, sell 1 @ 1], last price 1",
        trades: [{
          type: "buy",
          amount: "3",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "2",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 3 @ 1, sell 1 @ 3, sell 1 @ 1], last price 1",
        trades: [{
          type: "buy",
          amount: "3",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "3",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "2",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 3 @ 2, sell 1 @ 1], last price 1",
        trades: [{
          type: "buy",
          amount: "3",
          price: "2",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "2",
            meanOpenPrice: "2",
            realized: "-1",
            unrealized: "-2",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 3 @ 2, sell 1 @ 1, sell 2 @ 2], last price 1",
        trades: [{
          type: "buy",
          amount: "3",
          price: "2",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "1",
          maker: false
        }, {
          type: "sell",
          amount: "2",
          price: "2",
          maker: false
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "-1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 100 @ 0.5, sell 10 @ 0.5], last price 0.5",
        trades: [{
          type: "buy",
          amount: "100",
          price: "0.5",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: false
        }],
        lastPrice: "0.5",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "90",
            meanOpenPrice: "0.5",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.5, buy 90 @ 0.5, sell 10 @ 0.5], last price 0.5",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: false
        }, {
          type: "buy",
          amount: "90",
          price: "0.5",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: false
        }],
        lastPrice: "0.5",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "90",
            meanOpenPrice: "0.5",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.4, sell 10 @ 0.5], last price 0.5",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.4",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: false
        }],
        lastPrice: "0.5",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.4, buy 10 @ 0.5], last price 0.6",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.4",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: false
        }],
        lastPrice: "0.6",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "20",
            meanOpenPrice: "0.45",
            realized: "0",
            unrealized: "3",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.4, buy 10 @ 0.5], last price 0.3",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.4",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: false
        }],
        lastPrice: "0.3",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "20",
            meanOpenPrice: "0.45",
            realized: "0",
            unrealized: "-3",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.4, buy 10 @ 0.5], last price 0.1",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.4",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "20",
            meanOpenPrice: "0.45",
            realized: "0",
            unrealized: "-7",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.1, buy 10 @ 0.5, sell 10 @ 0.2], last price 0.2",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.3",
            realized: "-1",
            unrealized: "-1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 15 @ 0.1, buy 5 @ 0.5, sell 10 @ 0.2], last price 0.2",
        trades: [{
          type: "buy",
          amount: "15",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "5",
          price: "0.5",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.2",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 15 @ 0.1, buy 5 @ 0.5, sell 10 @ 0.2], last price 0.1",
        trades: [{
          type: "buy",
          amount: "15",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "5",
          price: "0.5",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.2",
            realized: "0",
            unrealized: "-1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.1, sell 5 @ 0.1, buy 10 @ 0.1, sell 5 @ 0.1], last price 0.1",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.1",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.1, sell 5 @ 0.1, buy 10 @ 0.1, sell 5 @ 0.2], last price 0.1",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.1",
            realized: "0.5",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.1, sell 5 @ 0.1, buy 10 @ 0.2, sell 5 @ 0.2], last price 0.1",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.166666666666666666667",
            realized: "0.166666666666666666665",
            unrealized: "-0.66666666666666666667",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.1, sell 5 @ 0.2, buy 10 @ 0.2, sell 5 @ 0.3], last price 0.3",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.2",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          type: "sell",
          amount: "5",
          price: "0.3",
          maker: false
        }],
        lastPrice: "0.3",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.166666666666666666667",
            realized: "1.166666666666666666665",
            unrealized: "1.33333333333333333333",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, sell 10 @ 0.1], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-20",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, sell 10 @ 0.2], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-20",
            meanOpenPrice: "0.15",
            realized: "0",
            unrealized: "-1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, sell 10 @ 0.2], last price 0.3",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.3",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-20",
            meanOpenPrice: "0.15",
            realized: "0",
            unrealized: "-3",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.1], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.2], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "0",
            unrealized: "-1",
            queued: "-1"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.2, buy 10 @ 0.1], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "0",
            unrealized: "1",
            queued: "1"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.2, sell complete sets 10], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "10",
          price: "0.2"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "-1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.2, buy 10 @ 0.1, sell complete sets 10], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "10",
          price: "0.2"
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.2, sell complete sets 5], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "5",
          price: "0.2"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "-0.5",
            unrealized: "-0.5",
            queued: "-0.5"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.2, sell complete sets 2, sell complete sets 3], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "2",
          price: "0.2"
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "3",
          price: "0.2"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "-0.5",
            unrealized: "-0.5",
            queued: "-0.5"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.2, buy complete sets 5 @ 0.2], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          isCompleteSet: true,
          type: "buy",
          amount: "5",
          price: "0.2"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "5",
            meanOpenPrice: "0.2",
            realized: "0",
            unrealized: "-1",
            queued: "-1"
          });
        }
      });
      test({
        description: "trades: [buy complete sets 5 @ 0.5], last price 0.2",
        trades: [{
          isCompleteSet: true,
          type: "buy",
          amount: "5",
          price: "0.5"
        }],
        lastPrice: "0.5",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "5",
            meanOpenPrice: "0.5",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.2, buy 10 @ 0.2, buy complete sets 1 @ 0.25], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          isCompleteSet: true,
          type: "buy",
          amount: "1",
          price: "0.25"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "0.25",
            realized: "0",
            unrealized: "-0.05",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.2, buy complete sets 5 @ 0.5], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          isCompleteSet: true,
          type: "buy",
          amount: "5",
          price: "0.5"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "5",
            meanOpenPrice: "0.5",
            realized: "0",
            unrealized: "-2.5",
            queued: "-1"
          });
        }
      });
      test({
        description: "trades: [buy complete sets 5, sell complete sets 5], last price 0.2",
        trades: [{
          isCompleteSet: true,
          type: "buy",
          amount: "5",
          price: "0.2"
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "5",
          price: "0.2"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.05], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.05",
          maker: false
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            queued: "0.5",
            realized: "0",
            unrealized: "0.5"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 10 @ 0.05, sell complete sets 10], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.05",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "10"
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            queued: "0",
            realized: "0.5",
            unrealized: "0"
          });
        }
      });
      test({
        description: "trades: [sell 1 @ 0.1, buy 1 @ 0.05], last price 0.05",
        trades: [{
          type: "sell",
          amount: "1",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "1",
          price: "0.05",
          maker: false
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "0",
            unrealized: "0.05",
            queued: "0.05"
          });
        }
      });
      test({
        description: "trades: [sell 2 @ 0.1, buy 1 @ 0.05], last price 0.05",
        trades: [{
          type: "sell",
          amount: "2",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "1",
          price: "0.05",
          maker: false
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-1",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "0.1",
            queued: "0.05"
          });
        }
      });
      test({
        description: "trades: [buy 2 @ 0.05, sell 1 @ 0.1], last price 0.1",
        trades: [{
          type: "buy",
          amount: "2",
          price: "0.05",
          maker: false
        }, {
          type: "sell",
          amount: "1",
          price: "0.1",
          maker: false
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "0.05",
            realized: "0.05",
            unrealized: "0.05",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 5 @ 0.05], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "5",
          price: "0.05",
          maker: false
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-5",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "0.5",
            queued: "0.25"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 5 @ 0.15], last price 0.15",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "5",
          price: "0.15",
          maker: false
        }],
        lastPrice: "0.15",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-5",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "-0.5",
            queued: "-0.25"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 20 @ 0.15], last price 0.15",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "20",
          price: "0.15",
          maker: false
        }],
        lastPrice: "0.15",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.15",
            realized: "0",
            unrealized: "-0.5",
            queued: "-0.5"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 5 @ 0.05, sell complete sets 5], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "5",
          price: "0.05",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: 5,
          price: "0.2"
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-5",
            meanOpenPrice: "0.1",
            realized: "0.25",
            unrealized: "0.25",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 1 @ 0.05, buy 4 @ 0.05], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "1",
          price: "0.05",
          maker: false
        }, {
          type: "buy",
          amount: "4",
          price: "0.05",
          maker: false
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-5",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "0.5",
            queued: "0.25"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 1 @ 0.05, buy 4 @ 0.05, sell complete sets 5], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "1",
          price: "0.05",
          maker: false
        }, {
          type: "buy",
          amount: "4",
          price: "0.05",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "5",
          price: "0.05"
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-5",
            meanOpenPrice: "0.1",
            realized: "0.25",
            unrealized: "0.25",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 1 @ 0.05, buy 4 @ 0.1], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "1",
          price: "0.05",
          maker: false
        }, {
          type: "buy",
          amount: "4",
          price: "0.1",
          maker: false
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-5",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "0.3",
            queued: "0.05"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, buy 1 @ 0.05, buy 4 @ 0.1, sell complete sets 5], last price 0.05",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "buy",
          amount: "1",
          price: "0.05",
          maker: false
        }, {
          type: "buy",
          amount: "4",
          price: "0.1",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "5",
          price: "0.1"
        }],
        lastPrice: "0.05",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-5",
            meanOpenPrice: "0.1",
            realized: "0.05",
            unrealized: "0.25",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, sell 10 @ 0.2, buy 10 @ 0.2], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-10",
            meanOpenPrice: "0.15",
            realized: "0",
            unrealized: "-1",
            queued: "-0.5"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.1, sell 10 @ 0.2, buy 10 @ 0.2, sell complete sets 10], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "10",
          price: "0.2"
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-10",
            meanOpenPrice: "0.15",
            realized: "-0.5",
            unrealized: "-0.5",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.52, sell 10 @ 0.48, sell 10 @ 0.48], last price 0.48",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.52",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.48",
          maker: false
        }, {
          type: "sell",
          amount: "10",
          price: "0.48",
          maker: false
        }],
        lastPrice: "0.48",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-10",
            meanOpenPrice: "0.48",
            realized: "-0.4",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.52, sell 20 @ 0.48], last price 0.48",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.52",
          maker: false
        }, {
          type: "sell",
          amount: "20",
          price: "0.48",
          maker: false
        }],
        lastPrice: "0.48",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-10",
            meanOpenPrice: "0.48",
            realized: "-0.4",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.52, sell complete sets 10 @ 0.48, sell 10 @ 0.48], last price 0.48",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.52",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "10",
          price: "0.48"
        }, {
          type: "sell",
          amount: "10",
          price: "0.48",
          maker: false
        }],
        lastPrice: "0.48",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-10",
            meanOpenPrice: "0.48",
            realized: "-0.4",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy complete sets 10 @ 0.52, sell complete sets 10 @ 0.48, sell 10 @ 0.48], last price 0.48",
        trades: [{
          isCompleteSet: true,
          type: "buy",
          amount: "10",
          price: "0.52"
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "10",
          price: "0.48"
        }, {
          type: "sell",
          amount: "10",
          price: "0.48",
          maker: false
        }],
        lastPrice: "0.48",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "-10",
            meanOpenPrice: "0.48",
            realized: "-0.4",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.52, sell 5 @ 0.48, sell complete sets 5 @ 0.48], last price 0.48",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.52"
        }, {
          type: "sell",
          amount: "5",
          price: "0.48",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "5",
          price: "0.48"
        }],
        lastPrice: "0.48",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "-0.4",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.52, sell 6 @ 0.48], last price 0.48",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.52"
        }, {
          type: "sell",
          amount: "6",
          price: "0.48",
          maker: false
        }],
        lastPrice: "0.48",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "4",
            meanOpenPrice: "0.52",
            realized: "-0.24",
            unrealized: "-0.16",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [buy 10 @ 0.52, sell 5 @ 0.48, sell complete sets 1 @ 0.48], last price 0.48",
        trades: [{
          type: "buy",
          amount: "10",
          price: "0.52"
        }, {
          type: "sell",
          amount: "5",
          price: "0.48",
          maker: false
        }, {
          isCompleteSet: true,
          type: "sell",
          amount: "1",
          price: "0.48"
        }],
        lastPrice: "0.48",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "4",
            meanOpenPrice: "0.52",
            realized: "-0.24",
            unrealized: "-0.16",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.48, buy 10 @ 0.52, buy 10 @ 0.52], last price 0.52",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.48",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.52",
          maker: false
        }, {
          type: "buy",
          amount: "10",
          price: "0.52",
          maker: false
        }],
        lastPrice: "0.52",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.52",
            realized: "0",
            unrealized: "-0.4",
            queued: "-0.4"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.48, buy 20 @ 0.52], last price 0.52",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.48",
          maker: false
        }, {
          type: "buy",
          amount: "20",
          price: "0.52",
          maker: false
        }],
        lastPrice: "0.52",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.52",
            realized: "0",
            unrealized: "-0.4",
            queued: "-0.4"
          });
        }
      });
      test({
        description: "trades: [sell 10 @ 0.48, buy complete sets 20 @ 0.52], last price 0.52",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.48",
          maker: false
        }, {
          isCompleteSet: true,
          type: "buy",
          amount: "20",
          price: "0.52"
        }],
        lastPrice: "0.52",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.52",
            realized: "0",
            unrealized: "-0.4",
            queued: "-0.4"
          });
        }
      });
    });

    describe("maker trades", function () {
      test({
        description: "trades: [ask 1 @ 2], last price 2",
        trades: [{
          type: "sell",
          amount: "1",
          price: "2",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "2",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 1 @ 1], last price 2",
        trades: [{
          type: "sell",
          amount: "1",
          price: "1",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "0",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 1 @ 3], last price 2",
        trades: [{
          type: "sell",
          amount: "1",
          price: "3",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "3",
            realized: "0",
            unrealized: "-1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 2 @ 3], last price 2",
        trades: [{
          type: "sell",
          amount: "2",
          price: "3",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "2",
            meanOpenPrice: "3",
            realized: "0",
            unrealized: "-2",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 2 @ 1], last price 1",
        trades: [{
          type: "sell",
          amount: "2",
          price: "1",
          maker: true
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "2",
            meanOpenPrice: "1",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 2 @ 1, bid 1 @ 1], last price 2",
        trades: [{
          type: "sell",
          amount: "2",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "0",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 2 @ 1, bid 1 @ 2], last price 2",
        trades: [{
          type: "sell",
          amount: "2",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "2",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 2 @ 1, bid 2 @ 2], last price 2",
        trades: [{
          type: "sell",
          amount: "2",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "2",
          price: "2",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "2",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 2 @ 1, bid 1 @ 1, bid 1 @ 2], last price 2",
        trades: [{
          type: "sell",
          amount: "2",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "2",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 3 @ 1, bid 1 @ 1, bid 1 @ 2], last price 2",
        trades: [{
          type: "sell",
          amount: "3",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "2",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 3 @ 1, bid 1 @ 2, bid 1 @ 1], last price 2",
        trades: [{
          type: "sell",
          amount: "3",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "2",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }],
        lastPrice: "2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 3 @ 1, bid 1 @ 2, bid 1 @ 1], last price 1",
        trades: [{
          type: "sell",
          amount: "3",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "2",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 3 @ 1, bid 1 @ 3, bid 1 @ 1], last price 1",
        trades: [{
          type: "sell",
          amount: "3",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "3",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "1",
            meanOpenPrice: "1",
            realized: "2",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 3 @ 2, bid 1 @ 1], last price 1",
        trades: [{
          type: "sell",
          amount: "3",
          price: "2",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "2",
            meanOpenPrice: "2",
            realized: "-1",
            unrealized: "-2",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 3 @ 2, bid 1 @ 1, bid 2 @ 2], last price 1",
        trades: [{
          type: "sell",
          amount: "3",
          price: "2",
          maker: true
        }, {
          type: "buy",
          amount: "1",
          price: "1",
          maker: true
        }, {
          type: "buy",
          amount: "2",
          price: "2",
          maker: true
        }],
        lastPrice: "1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "-1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 100 @ 0.5, bid 10 @ 0.5], last price 0.5",
        trades: [{
          type: "sell",
          amount: "100",
          price: "0.5",
          maker: true
        }, {
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: true
        }],
        lastPrice: "0.5",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "90",
            meanOpenPrice: "0.5",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.5, ask 90 @ 0.5, bid 10 @ 0.5], last price 0.5",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: true
        }, {
          type: "sell",
          amount: "90",
          price: "0.5",
          maker: true
        }, {
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: true
        }],
        lastPrice: "0.5",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "90",
            meanOpenPrice: "0.5",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.4, bid 10 @ 0.5], last price 0.5",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.4",
          maker: true
        }, {
          type: "buy",
          amount: "10",
          price: "0.5",
          maker: true
        }],
        lastPrice: "0.5",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "0",
            meanOpenPrice: "0",
            realized: "1",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.4, ask 10 @ 0.5], last price 0.6",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.4",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: true
        }],
        lastPrice: "0.6",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "20",
            meanOpenPrice: "0.45",
            realized: "0",
            unrealized: "3",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.4, ask 10 @ 0.5], last price 0.3",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.4",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: true
        }],
        lastPrice: "0.3",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "20",
            meanOpenPrice: "0.45",
            realized: "0",
            unrealized: "-3",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.4, ask 10 @ 0.5], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.4",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: true
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "20",
            meanOpenPrice: "0.45",
            realized: "0",
            unrealized: "-7",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.1, ask 10 @ 0.5, bid 10 @ 0.2], last price 0.2",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.5",
          maker: true
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: true
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.3",
            realized: "-1",
            unrealized: "-1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 15 @ 0.1, ask 5 @ 0.5, bid 10 @ 0.2], last price 0.2",
        trades: [{
          type: "sell",
          amount: "15",
          price: "0.1",
          maker: true
        }, {
          type: "sell",
          amount: "5",
          price: "0.5",
          maker: true
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: true
        }],
        lastPrice: "0.2",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.2",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 15 @ 0.1, ask 5 @ 0.5, bid 10 @ 0.2], last price 0.1",
        trades: [{
          type: "sell",
          amount: "15",
          price: "0.1",
          maker: true
        }, {
          type: "sell",
          amount: "5",
          price: "0.5",
          maker: true
        }, {
          type: "buy",
          amount: "10",
          price: "0.2",
          maker: true
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.2",
            realized: "0",
            unrealized: "-1",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.1, bid 5 @ 0.1, ask 10 @ 0.1, bid 5 @ 0.1], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.1",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.1",
          maker: true
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.1",
            realized: "0",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.1, bid 5 @ 0.1, ask 10 @ 0.1, bid 5 @ 0.2], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.1",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.2",
          maker: true
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.1",
            realized: "0.5",
            unrealized: "0",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.1, bid 5 @ 0.1, ask 10 @ 0.2, bid 5 @ 0.2], last price 0.1",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.1",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.2",
          maker: true
        }],
        lastPrice: "0.1",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.166666666666666666667",
            realized: "0.166666666666666666665",
            unrealized: "-0.66666666666666666667",
            queued: "0"
          });
        }
      });
      test({
        description: "trades: [ask 10 @ 0.1, bid 5 @ 0.2, ask 10 @ 0.2, bid 5 @ 0.3], last price 0.3",
        trades: [{
          type: "sell",
          amount: "10",
          price: "0.1",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.2",
          maker: true
        }, {
          type: "sell",
          amount: "10",
          price: "0.2",
          maker: true
        }, {
          type: "buy",
          amount: "5",
          price: "0.3",
          maker: true
        }],
        lastPrice: "0.3",
        assertions: function (output) {
          assert.deepEqual(output, {
            position: "10",
            meanOpenPrice: "0.166666666666666666667",
            realized: "1.166666666666666666665",
            unrealized: "1.33333333333333333333",
            queued: "0"
          });
        }
      });
    });
  });
});

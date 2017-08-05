"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var simulateMakeBidOrder = require("../../../../src/trading/simulation/simulate-make-bid-order");

describe("trading/simulation/simulate-make-bid-order", function () {
  var test = function (t) {
    it(t.description, function () {
      var output;
      try {
        output = simulateMakeBidOrder(t.params.numShares, t.params.price, t.params.minPrice, t.params.outcomeID, t.params.shareBalances);
      } catch (exc) {
        output = exc;
      }
      t.assertions(output);
    });
  };
  test({
    description: "[0, 0] shares held, 0 minimum price, bid 2 shares of outcome 1 @ 0.6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("0.6", 10),
      minPrice: new BigNumber("0", 10),
      outcomeID: 1,
      shareBalances: [new BigNumber("0", 10), new BigNumber("0", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        gasFees: new BigNumber("0", 10),
        otherSharesDepleted: new BigNumber("0", 10),
        tokensDepleted: new BigNumber("1.2", 10),
        shareBalances: [new BigNumber("0", 10), new BigNumber("0", 10)]
      });
    }
  });
  test({
    description: "[0, 0] shares held, 7 minimum price, bid 2 shares of outcome 1 @ 7.6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("7.6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 1,
      shareBalances: [new BigNumber("0", 10), new BigNumber("0", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        gasFees: new BigNumber("0", 10),
        otherSharesDepleted: new BigNumber("0", 10),
        tokensDepleted: new BigNumber("1.2", 10),
        shareBalances: [new BigNumber("0", 10), new BigNumber("0", 10)]
      });
    }
  });
  test({
    description: "[3, 0] shares held, 7 minimum price, bid 2 shares of outcome 1 @ 7.6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("7.6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 1,
      shareBalances: [new BigNumber("3", 10), new BigNumber("0", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        gasFees: new BigNumber("0", 10),
        otherSharesDepleted: new BigNumber("0", 10),
        tokensDepleted: new BigNumber("1.2", 10),
        shareBalances: [new BigNumber("3", 10), new BigNumber("0", 10)]
      });
    }
  });
  test({
    description: "[3, 4] shares held, 7 minimum price, bid 2 shares of outcome 1 @ 7.6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("7.6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 1,
      shareBalances: [new BigNumber("3", 10), new BigNumber("4", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        gasFees: new BigNumber("0", 10),
        otherSharesDepleted: new BigNumber("2", 10),
        tokensDepleted: new BigNumber("0", 10),
        shareBalances: [new BigNumber("3", 10), new BigNumber("2", 10)]
      });
    }
  });
  test({
    description: "[3, 1] shares held, 7 minimum price, bid 2 shares of outcome 2 @ 7.6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("7.6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 2,
      shareBalances: [new BigNumber("3", 10), new BigNumber("1", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        gasFees: new BigNumber("0", 10),
        otherSharesDepleted: new BigNumber("2", 10),
        tokensDepleted: new BigNumber("0", 10),
        shareBalances: [new BigNumber("1", 10), new BigNumber("1", 10)]
      });
    }
  });
  test({
    description: "[3, 1, 4, 1.2] shares held, 7 minimum price, bid 2 shares of outcome 2 @ 7.6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("7.6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 2,
      shareBalances: [new BigNumber("3", 10), new BigNumber("1", 10), new BigNumber("4", 10), new BigNumber("1.2", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        gasFees: new BigNumber("0", 10),
        otherSharesDepleted: new BigNumber("1.2", 10),
        tokensDepleted: new BigNumber("0.48", 10),
        shareBalances: [new BigNumber("1.8", 10), new BigNumber("1", 10), new BigNumber("2.8", 10), new BigNumber("0", 10)]
      });
    }
  });
  test({
    description: "[3.1, 1.2] shares held, 6.9 minimum price, bid 2.4 shares of outcome 1 @ 7.6",
    params: {
      numShares: new BigNumber("2.4", 10),
      price: new BigNumber("7.6", 10),
      minPrice: new BigNumber("6.9", 10),
      outcomeID: 1,
      shareBalances: [new BigNumber("3.1", 10), new BigNumber("1.2", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        gasFees: new BigNumber("0", 10),
        otherSharesDepleted: new BigNumber("1.2", 10),
        tokensDepleted: new BigNumber("0.84", 10),
        shareBalances: [new BigNumber("3.1", 10), new BigNumber("0", 10)]
      });
    }
  });
  test({
    description: "[3, 1] shares held, 7 minimum price, bid 0 shares of outcome 1 @ 7.6",
    params: {
      numShares: new BigNumber("0", 10),
      price: new BigNumber("7.6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 1,
      shareBalances: [new BigNumber("3", 10), new BigNumber("1", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, new Error("Number of shares is too small"));
    }
  });
  test({
    description: "[3, 1] shares held, 7 minimum price, bid 2 shares of outcome 1 @ 6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 1,
      shareBalances: [new BigNumber("3", 10), new BigNumber("1", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, new Error("Price is below the minimum price"));
    }
  });
  test({
    description: "[3, 1] shares held, 7 minimum price, bid 2 shares of outcome 0 @ 6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 0,
      shareBalances: [new BigNumber("3", 10), new BigNumber("1", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, new Error("Invalid outcome ID"));
    }
  });
  test({
    description: "[3, 1] shares held, 7 minimum price, bid 2 shares of outcome 3 @ 6",
    params: {
      numShares: new BigNumber("2", 10),
      price: new BigNumber("6", 10),
      minPrice: new BigNumber("7", 10),
      outcomeID: 3,
      shareBalances: [new BigNumber("3", 10), new BigNumber("1", 10)]
    },
    assertions: function (output) {
      assert.deepEqual(output, new Error("Invalid outcome ID"));
    }
  });
});
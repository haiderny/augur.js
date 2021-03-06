/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var proxyquire = require("proxyquire").noPreserveCache();
var subscriptions = require("../../../src/filters/subscriptions");
var addFilter = require("../../../src/filters/add-filter");

describe("filters/add-filter", function () {
  var test = function (t) {
    it(t.description, function (done) {
      addFilter(t.params.blockStream, t.params.label, t.params.eventAPI, t.params.contracts, t.params.addSubscription, function (message) {
        t.assertions(message, subscriptions.getSubscriptions());
        done();
      });
    });
  };
  test({
    description: "Subscribe to new blocks",
    params: {
      blockStream: {
        subscribeToOnBlockAdded: function (callback) {
          callback({ number: "0x42" });
        },
      },
      label: "block",
      eventAPI: undefined,
      contracts: undefined,
      addSubscription: function (id, token, callback) {
        assert.fail();
      }
    },
    assertions: function (message, subscriptions) {
      assert.strictEqual(message, "0x42");
    }
  });
  test({
    description: "Subscribe to all Augur logs",
    params: {
      blockStream: {
        addLogFilter: function (filter) {
          assert.deepEqual(filter, { address: ["0x1", "0x3"] });
          return "add-log-filter-token";
        }
      },
      label: "allLogs",
      contracts: {
        CreateMarket: "0x1",
        Trade: "0x3"
      },
      addSubscription: function (id, token, callback) {
        subscriptions.addSubscription(id, token, callback);
        callback({
          address: "0x2e5a882aa53805f1a9da3cf18f73673bca98fa0f",
          topics: [
            "0x8f9d87fc01c4c1a9057249423e7e9c38c4f8899a494502d7aaa64c0b7c40cf9e",
            "0x0000000000000000000000000e52ec96687f8281dae987934f4619d1990ecbde",
            "0xbcec0378dfeeb59908c886aff93b0e820bb579f63acaeb4b3d4004ec01153115",
            "0x726f666c636f7074657200000000000000000000000000000000000000000000"
          ],
          data: "0xebf353dd9fc2f5fb49913414dd192d3c2835291917be735bb22a8c473badeeab000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000003e733628714200000000000000000000000000000000000000000000000000000000000058588fee",
          blockNumber: "0x1ad",
          transactionIndex: "0x0",
          transactionHash: "0x2f83b7150b3061d4364d190fb91b94d4f3343f0ef91366105ca5245ee06e5229",
          blockHash: "0xde4dc83efe62a660c56245b96c5ff884975292e096450d92edf8a9db403d9ca6",
          logIndex: "0x0",
          removed: false
        });
      }
    },
    assertions: function (message, subscriptions) {
      assert.deepEqual(message, {
        address: "0x2e5a882aa53805f1a9da3cf18f73673bca98fa0f",
        topics: [
          "0x8f9d87fc01c4c1a9057249423e7e9c38c4f8899a494502d7aaa64c0b7c40cf9e",
          "0x0000000000000000000000000e52ec96687f8281dae987934f4619d1990ecbde",
          "0xbcec0378dfeeb59908c886aff93b0e820bb579f63acaeb4b3d4004ec01153115",
          "0x726f666c636f7074657200000000000000000000000000000000000000000000"
        ],
        data: "0xebf353dd9fc2f5fb49913414dd192d3c2835291917be735bb22a8c473badeeab000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000003e733628714200000000000000000000000000000000000000000000000000000000000058588fee",
        blockNumber: "0x1ad",
        transactionIndex: "0x0",
        transactionHash: "0x2f83b7150b3061d4364d190fb91b94d4f3343f0ef91366105ca5245ee06e5229",
        blockHash: "0xde4dc83efe62a660c56245b96c5ff884975292e096450d92edf8a9db403d9ca6",
        logIndex: "0x0",
        removed: false
      });
      assert.isObject(subscriptions.allLogs);
      assert.strictEqual(subscriptions.allLogs.token, "add-log-filter-token")
      assert.isFunction(subscriptions.allLogs.callback);
    }
  });
  test({
    description: "Subscribe to marketCreated logs",
    params: {
      blockStream: {
        addLogFilter: function (filter) {
          assert.deepEqual(filter, { address: "0x1", topics: ["0x2"] });
          return "add-marketCreated-log-filter-token";
        }
      },
      label: "marketCreated",
      eventAPI: {
        contract: "CreateMarket",
        signature: "0x2",
        inputs: [
          {
            "indexed": true, 
            "name": "sender", 
            "type": "int256"
          }, 
          {
            "indexed": true, 
            "name": "marketID", 
            "type": "int256"
          }, 
          {
            "indexed": true, 
            "name": "topic", 
            "type": "int256"
          }, 
          {
            "indexed": false, 
            "name": "branch", 
            "type": "int256"
          }, 
          {
            "indexed": false, 
            "name": "marketCreationFee", 
            "type": "int256"
          }, 
          {
            "indexed": false, 
            "name": "eventBond", 
            "type": "int256"
          }, 
          {
            "indexed": false, 
            "name": "timestamp", 
            "type": "int256"
          }
        ]
      },
      contracts: {
        CreateMarket: "0x1"
      },
      addSubscription: function (id, token, callback) {
        subscriptions.addSubscription(id, token, callback);
        callback({
          address: "0x2e5a882aa53805f1a9da3cf18f73673bca98fa0f",
          topics: [
            "0x8f9d87fc01c4c1a9057249423e7e9c38c4f8899a494502d7aaa64c0b7c40cf9e",
            "0x0000000000000000000000000e52ec96687f8281dae987934f4619d1990ecbde",
            "0xbcec0378dfeeb59908c886aff93b0e820bb579f63acaeb4b3d4004ec01153115",
            "0x726f666c636f7074657200000000000000000000000000000000000000000000"
          ],
          data: "0xebf353dd9fc2f5fb49913414dd192d3c2835291917be735bb22a8c473badeeab000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000003e733628714200000000000000000000000000000000000000000000000000000000000058588fee",
          blockNumber: "0x1ad",
          transactionIndex: "0x0",
          transactionHash: "0x2f83b7150b3061d4364d190fb91b94d4f3343f0ef91366105ca5245ee06e5229",
          blockHash: "0xde4dc83efe62a660c56245b96c5ff884975292e096450d92edf8a9db403d9ca6",
          logIndex: "0x0",
          removed: false
        });
      }
    },
    assertions: function (message, subscriptions) {
      assert.deepEqual(message, {
        sender: "0x0e52ec96687f8281dae987934f4619d1990ecbde",
        marketID: "0xbcec0378dfeeb59908c886aff93b0e820bb579f63acaeb4b3d4004ec01153115",
        topic: "roflcopter",
        branch: "0xebf353dd9fc2f5fb49913414dd192d3c2835291917be735bb22a8c473badeeab",
        marketCreationFee: "0.01",
        eventBond: "4.5",
        timestamp: 1482199022,
        blockNumber: 429,
        transactionHash: "0x2f83b7150b3061d4364d190fb91b94d4f3343f0ef91366105ca5245ee06e5229",
        removed: false
      });
      assert.strictEqual(subscriptions["0x2"].token, "add-marketCreated-log-filter-token");
      assert.isFunction(subscriptions["0x2"].callback);
    }
  });
});

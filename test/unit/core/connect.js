"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var Contracts = require('augur-contracts');
var augur = new (require("../../../src"))();
var constants = require("../../../src/constants");
var clearCallCounts = require("../../tools").clearCallCounts;
var noop = require("../../../src/utils/noop");
var proxyquire = require("proxyquire").noCallThru().noPreserveCache();
// 22 tests total

describe('connect.bindContractFunction', function () {
  // 13 tests total
  var test = function (t) {
    it(t.description, function () {
        var bindContractFunction = proxyquire('../../../src/api/bind-contract-function', {
          '../rpc-interface': {
            transact: t.transact,
            callContractFunction: t.callContractFunction,
          },
          '../parsers': t.parsers || {}
        });
        // in case of further setup, which is just the final test right now...
        if (t.prepare) t.prepare();

        t.callMethod(bindContractFunction(Contracts.api.functions[t.contract][t.method]));
    });
  };
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method required inputs and has no callback. no parser, not fixed, send false',
    contract: 'Cash',
    method: 'balance',
    callMethod: function (method) {
      // ({ address }, callback)
      method({
        address: '0xa1'
      }, undefined);
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.deepEqual(tx, {
      	inputs: ['address'],
      	label: 'Balance',
      	method: 'balance',
      	returns: 'unfix',
      	signature: ['int256'],
      	params: ['0xa1']
      });
      assert.isUndefined(cb);
      assert.isUndefined(parsers);
      assert.isUndefined(extraArgs);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method required inputs and has callback. no parser, not fixed, send false',
    contract: 'Cash',
    method: 'balance',
    callMethod: function (method) {
      // (address, callback)
      method({ address: '0xa1' }, noop);
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.deepEqual(tx, {
      	inputs: ['address'],
      	label: 'Balance',
      	method: 'balance',
      	returns: 'unfix',
      	signature: ['int256'],
      	params: ['0xa1']
      });
      assert.isFunction(cb);
      assert.isUndefined(parsers);
      assert.isUndefined(extraArgs);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method has inputs, without callback. method transaction has a parser, not fixed, send false',
    contract: 'Topics',
    method: 'getTopicsInfo',
    callMethod: function (method) {
      // ({ branch, offset, numTopicsToLoad }, cb)
      method({ branch: '1010101', offset: 0, numTopicsToLoad: 1 }, undefined);
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.deepEqual(tx, { inputs: [ 'branch', 'offset', 'numTopicsToLoad' ],
        label: 'Get Topics Info',
        method: 'getTopicsInfo',
        parser: 'parseTopicsInfo',
        returns: 'int256[]',
        signature: [ 'int256', 'int256', 'int256' ],
        params: [ '1010101', 0, 1 ]
      });
      assert.isUndefined(cb);
      assert.isUndefined(parsers);
      assert.isUndefined(extraArgs);
      return ['the returned value goes to getTopicsInfo for parsing...'];
    },
    parsers: {
      parseTopicsInfo: function(topicsInfo) {
        assert.deepEqual(topicsInfo, ['the returned value goes to getTopicsInfo for parsing...']);
      }
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method has inputs, with callback. method transaction has a parser, not fixed, send false',
    contract: 'Topics',
    method: 'getTopicsInfo',
    callMethod: function (method) {
      // ({ branch, offset, numTopicsToLoad }, cb)
      method({ branch: '1010101', offset: 0, numTopicsToLoad: 1 }, noop);
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.deepEqual(tx, { inputs: [ 'branch', 'offset', 'numTopicsToLoad' ],
        label: 'Get Topics Info',
        method: 'getTopicsInfo',
        parser: 'parseTopicsInfo',
        returns: 'int256[]',
        signature: [ 'int256', 'int256', 'int256' ],
        params: [ '1010101', 0, 1 ]
      });
      assert.isFunction(cb);
      assert.isFunction(parsers);
      assert.isUndefined(extraArgs);
      parsers(['the returned value goes to getTopicsInfo for parsing...']);
    },
    parsers: {
      parseTopicsInfo: function(topicsInfo) {
        assert.deepEqual(topicsInfo, ['the returned value goes to getTopicsInfo for parsing...']);
      }
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method has inputs, without callback. method transaction without a parser, fixed, send false',
    contract: 'Topics',
    method: 'updateTopicPopularity',
    callMethod: function (method) {
      // (branch, topic, fxpAmount, cb)
      method({ branch: '1010101', topic: 'politics', fxpAmount: '10000000000000000'}, undefined);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      assert.deepEqual(tx,{
        fixed: [ 2 ],
        inputs: [ 'branch', 'topic', 'fxpAmount' ],
        label: 'Update Topic Popularity',
        method: 'updateTopicPopularity',
        returns: 'number',
        send: true,
        signature: [ 'int256', 'int256', 'int256' ],
        params: [ '1010101', 'politics', '0x1ed09bead87c0378d8e6400000000' ]
      });
      assert.isUndefined(signer);
      assert.isUndefined(onSent);
      assert.isUndefined(onSuccess);
      assert.isUndefined(onFailed);
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      // Shouldn't get hit in this case
      assert.isTrue(false);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method has inputs, with callbacks. method transaction without a parser, fixed, send false, signer and all one arg.',
    contract: 'Topics',
    method: 'updateTopicPopularity',
    callMethod: function (method) {
      // (branch, topic, fxpAmount, cb)
      method({branch: '1010101', topic: 'politics', fxpAmount: '10000000000000000', _signer: '0xdeadbeef', onSent: noop, onSuccess: noop, onFailed: noop });
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.isFalse(true);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      assert.deepEqual(tx,{
        fixed: [ 2 ],
        inputs: [ 'branch', 'topic', 'fxpAmount' ],
        label: 'Update Topic Popularity',
        method: 'updateTopicPopularity',
        returns: 'number',
        send: true,
        signature: [ 'int256', 'int256', 'int256' ],
        params: [ '1010101', 'politics', '0x1ed09bead87c0378d8e6400000000' ]
      });
      assert.deepEqual(signer, '0xdeadbeef');
      assert.isFunction(onSent);
      assert.isFunction(onSuccess);
      assert.isFunction(onFailed);
    },
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method required inputs and has no callback. no parser, fixed tx, send true',
    contract: 'Cash',
    method: 'addCash',
    callMethod: function (method) {
      // (ID, amount, callback)
      method({ ID: '0xa1', amount: '10000000000000000', _signer: '0xdeadbeef' }, undefined);
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      // Shouldn't get hit in this case
      assert.isTrue(false);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      assert.deepEqual(tx, {
        fixed: [ 1 ],
        inputs: [ 'ID', 'amount' ],
        label: 'Add Cash',
        method: 'addCash',
        returns: 'number',
        send: true,
        signature: [ 'int256', 'int256' ],
        params: [ '0xa1', '0x1ed09bead87c0378d8e6400000000' ]
      });
      assert.deepEqual(signer, '0xdeadbeef');
      assert.isUndefined(onSent);
      assert.isUndefined(onSuccess);
      assert.isUndefined(onFailed);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method required inputs and has all callbacks. no parser, fixed tx, send true',
    contract: 'Cash',
    method: 'addCash',
    callMethod: function (method) {
      // (ID, amount, onSent, onSuccess, onFailed)
      method({ ID: '0xa1', amount: '10000000000000000', onSent: noop, onSuccess: noop, onFailed: noop });
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      // Shouldn't get hit in this case
      assert.isTrue(false);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      assert.deepEqual(tx, {
        fixed: [ 1 ],
        inputs: [ 'ID', 'amount' ],
        label: 'Add Cash',
        method: 'addCash',
        returns: 'number',
        send: true,
        signature: [ 'int256', 'int256' ],
        params: [ '0xa1', '0x1ed09bead87c0378d8e6400000000' ]
      });
      assert.isUndefined(signer);
      assert.deepEqual(onSent, noop);
      assert.deepEqual(onSuccess, noop);
      assert.deepEqual(onFailed, noop);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method passed no args and is a method where send is true',
    contract: 'Cash',
    method: 'addCash',
    callMethod: function (method) {
      // (ID, amount, callback)
      method();
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      assert.deepEqual(tx, {
        fixed: [ 1 ],
        inputs: [ 'ID', 'amount' ],
        label: 'Add Cash',
        method: 'addCash',
        returns: 'number',
        send: true,
        signature: [ 'int256', 'int256' ],
      });
      assert.isUndefined(signer);
      assert.isUndefined(onSent);
      assert.isUndefined(onSuccess);
      assert.isUndefined(onFailed);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly when the method passed no args and is a method where send is false',
    contract: 'Cash',
    method: 'balance',
    callMethod: function (method) {
      // (account, callback)
      method();
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.deepEqual(tx, {
        inputs: [ 'address' ],
        label: 'Balance',
        method: 'balance',
        returns: 'unfix',
        signature: [ 'int256' ],
      });
      assert.isUndefined(cb);
      assert.isUndefined(parsers);
      assert.isUndefined(extraArgs);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly send is false, args are present, not fixed, no parser',
    contract: 'MakeReports',
    method: 'makeHash',
    callMethod: function (method) {
      // (account, callback)
      method({ salt: '1337', report: '1', eventID: '0xe1', sender: '0xf1', callback: noop });
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.deepEqual(tx, {
        inputs: [ 'salt', 'report', 'eventID', 'sender' ],
        label: 'Make Hash',
        method: 'makeHash',
        params: [ '1337', '1', '0xe1', '0xf1' ],
        returns: 'int256',
        signature: [ 'int256', 'int256', 'int256', 'int256' ],
      });
      assert.isFunction(cb);
      assert.isUndefined(parsers);
      assert.isUndefined(extraArgs);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly send is false, args are present, fixed, no parser',
    contract: 'MakeReports',
    method: 'validateReport',
    callMethod: function (method) {
      // (account, callback)
      method({ eventID: '0xe1', branch: '0xb1', votePeriod: '1000', report: '1', forkedOverEthicality: '0', forkedOverThisEvent: '0', roundTwo: '1001', balance: '1000', callback: noop });
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      assert.deepEqual(tx, {
        fixed: [ 3, 7 ],
        inputs: [ 'eventID', 'branch', 'votePeriod', 'report', 'forkedOverEthicality', 'forkedOverThisEvent', 'roundTwo', 'balance' ],
        label: 'Validate Report',
        method: 'validateReport',
        params: [ '0xe1', '0xb1', '1000', '0xde0b6b3a7640000', '0', '0', '1001', '0x3635c9adc5dea00000' ],
        returns: 'number',
        signature: [ 'int256', 'int256', 'int256', 'int256', 'int256', 'int256', 'int256', 'int256' ],
      });
      assert.isFunction(cb);
      assert.isUndefined(parsers);
      assert.isUndefined(extraArgs);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    }
  });
  test({
    description: 'Should handle binding a method and then handling the method correctly send is true, parser',
    contract: 'FakeContract',
    method: 'fakeMethod',
    prepare: function() {
      // because no functions currently exist where send is true and we require a parser, we are going to make a fake function to do this so we can unit test.
      Contracts.api.functions.FakeContract = {
        fakeMethod: {
          inputs: [ 'branch' ],
          label: 'Fake Method',
          method: 'fakeMethod',
          parser: 'parseFakeStuff',
          returns: 'number',
          send: true,
          signature: [ 'int256' ],
        }
      };
    },
    callMethod: function (method) {
      method({ branch: '0xb1', callback: noop });
      // clean up the fakeContract and it's fakeMethod
      delete Contracts.api.functions.fakeContract;
    },
    callContractFunction: function (tx, cb, parsers, extraArgs) {
      // Shouldn't get hit in this case
      assert.isFalse(true);
    },
    transact: function (tx, signer, onSent, onSuccess, onFailed) {
      assert.deepEqual(tx, {
        inputs: [ 'branch' ],
        label: 'Fake Method',
        method: 'fakeMethod',
        params: [ '0xb1' ],
        parser: 'parseFakeStuff',
        returns: 'number',
        send: true,
        signature: [ 'int256' ],
      });
      assert.isUndefined(signer);
      assert.isUndefined(onSent);
      assert.isNull(onSuccess);
      assert.isUndefined(onFailed);
    }
  });
});

describe.skip('connect.bindContractAPI', function () {
  // 2 tests total
  var callCounts = {
    bindContractMethod: 0
  };
  afterEach(function () {
    clearCallCounts(callCounts);
  });
  var test = function (t) {
    it(t.description, function (done) {
      // These tests will be slightly different then the usual format. This is designed to isolate only the bindContractAPI method so we don't start messing with augur.js object as a whole and then have to clean it up.
      var isolatedBindContractAPI = proxyquire('../../../src/modules/connect.js', {}).bindContractAPI.bind(t.testThis);
      t.assertions(isolatedBindContractAPI(t.methods), done);
    });
  };
  test({
    description: 'For each of the methods passed in, bindContractMethod should be called and we should return the methods bound.',
    testThis: {
      api: { functions: {} },
      bindContractMethod: function (contract, method) {
        callCounts.bindContractMethod++;
        assert.oneOf(contract, ['testFunctionGroup1', 'testFunctionGroup2']);
        assert.oneOf(method, ['testFunction1', 'testFunction2', 'testFunction3', 'testFunction4']);
      }
    },
    methods: {
    	testFunctionGroup1: {
        testFunction1: {
          inputs: [
            'event',
            'amount'
          ],
          label: 'test function one',
          method: "testFunction1",
          returns: 'int256',
          signature: [
            'int256',
            'int256'
          ]
        },
        testFunction2: {
          inputs: [
            'market',
            'event'
          ],
          label: 'test function two',
          method: "testFunction2",
          returns: 'int256',
          signature: [
            'int256',
            'int256'
          ]
        },
    	},
      testFunctionGroup2: {
        testFunction3: {
          inputs: [
            'event',
            'amount'
          ],
          label: 'test function three',
          method: "testFunction3",
          returns: 'int256',
          signature: [
            'int256',
            'int256'
          ]
        },
        testFunction4: {
          inputs: [
            'market',
            'event'
          ],
          label: 'test function four',
          method: "testFunction4",
          returns: 'int256',
          signature: [
            'int256',
            'int256'
          ]
        },
    	}
    },
    assertions: function (methods, done) {
      assert.deepEqual(methods, {
      	testFunctionGroup1: {
      		testFunction1: {
      			inputs: ['event', 'amount'],
      			label: 'test function one',
      			method: 'testFunction1',
      			returns: 'int256',
      			signature: ['int256', 'int256']
      		},
      		testFunction2: {
      			inputs: ['market', 'event'],
      			label: 'test function two',
      			method: 'testFunction2',
      			returns: 'int256',
      			signature: ['int256', 'int256']
      		}
      	},
      	testFunctionGroup2: {
      		testFunction3: {
      			inputs: ['event', 'amount'],
      			label: 'test function three',
      			method: 'testFunction3',
      			returns: 'int256',
      			signature: ['int256', 'int256']
      		},
      		testFunction4: {
      			inputs: ['market', 'event'],
      			label: 'test function four',
      			method: 'testFunction4',
      			returns: 'int256',
      			signature: ['int256', 'int256']
      		}
      	}
      });
      assert.deepEqual(callCounts, {
        bindContractMethod: 4
      });
      done();
    }
  });
  test({
    description: 'If no args are passed then it should use store.getState().contractsAPI.functions instead. bindContractMethod should be called for each function and we should return the methods bound.',
    testThis: {
  		api: {
  			functions: {
  				testFunctionGroup1: {
  					testFunction1: {
  						inputs: [
  							'event',
  							'amount'
  						],
  						label: 'test function one',
  						method: "testFunction1",
  						returns: 'int256',
  						signature: [
  							'int256',
  							'int256'
  						]
  					},
  					testFunction2: {
  						inputs: [
  							'market',
  							'event'
  						],
  						label: 'test function two',
  						method: "testFunction2",
  						returns: 'int256',
  						signature: [
  							'int256',
  							'int256'
  						]
  					},
  				}
  			}
  		},
      bindContractMethod: function (contract, method) {
        callCounts.bindContractMethod++;
        assert.oneOf(contract, ['testFunctionGroup1']);
        assert.oneOf(method, ['testFunction1', 'testFunction2']);
      }
    },
    methods: undefined,
    assertions: function (methods, done) {
      assert.deepEqual(methods, {
      	testFunctionGroup1: {
      		testFunction1: {
      			inputs: ['event', 'amount'],
      			label: 'test function one',
      			method: 'testFunction1',
      			returns: 'int256',
      			signature: ['int256', 'int256']
      		},
      		testFunction2: {
      			inputs: ['market', 'event'],
      			label: 'test function two',
      			method: 'testFunction2',
      			returns: 'int256',
      			signature: ['int256', 'int256']
      		}
      	}
      });
      assert.deepEqual(callCounts, {
        bindContractMethod: 2
      });
      done();
    }
  });
});

describe('connect.connect', function () {
  // 9 tests total (5 async, 4 sync)
  var test = function (t) {
    var rpcInterface = { createRpcInterface: function(rpc) {
        return { rpc: 'testing placeholder' };
      }
    };
    var ethrpc = 'ethrpc';
    // for the one test where rpcinfo is passed as a function the sync test is not required...
    if (t.rpcinfo.constructor !== Function) {
      it(t.description + ' sync', function () {
        var connect = proxyquire('../../../src/connect.js', {
          'ethereumjs-connect': t.connector,
          './rpc-interface': rpcInterface,
          'ethrpc': ethrpc
        });

        t.assertions(connect.call(t.testThis, t.rpcinfo, undefined));
      });
    }
    it(t.description + ' async', function (done) {
      var connect = proxyquire('../../../src/connect.js', {
        'ethereumjs-connect': t.connector,
        './rpc-interface': rpcInterface,
          'ethrpc': ethrpc
      });
      // this is in place to call this function different for one test
      if (t.rpcinfo.constructor === Function) {
        connect.call(t.testThis, function (connection) {
          t.assertions(connection);
          done();
        }, undefined);
      } else {
        // all tests except for the test passing rpcinfo as a function will use this call
        connect.call(t.testThis, t.rpcinfo, function (connection) {
          t.assertions(connection);
          done();
        });
      }

    });
  };
  test({
    description: 'Should handle a missing rpcinfo',
    rpcinfo: [],
    testThis: {
      sync: noop
    },
    connector: {
      connect: function (options, cb) {
        assert.deepEqual(options, {
          rpc: 'ethrpc',
          httpAddresses: [],
          wsAddresses: [],
          ipcAddresses: [],
          contracts: Contracts,
          api: Contracts.api
        });

        if (cb && cb.constructor === Function) {
          cb(null, options);
        } else {
          return options;
        }
      },
      rpc: { unsubscribe: function (_, callback) { setImmediate(function () { callback({ error: -32601, message: "Method not found"}) }); } }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        rpc: 'ethrpc',
        contracts: Contracts,
        api: Contracts.api,
        httpAddresses: [],
        wsAddresses: [],
        ipcAddresses: []
      });
    }
  });
  test({
    description: 'Should handle a rpcinfo string',
    rpcinfo: 'https://eth3.augur.net',
    testThis: {
      sync: noop
    },
    connector: {
      connect: function (options, cb) {
        assert.deepEqual(options, {
          rpc: 'ethrpc',
          httpAddresses: ['https://eth3.augur.net'],
          wsAddresses: [],
          ipcAddresses: [],
          contracts: Contracts,
          api: Contracts.api
        });
        var vitals = {
          rpc: options.rpc,
          httpAddresses: options.httpAddresses,
          wsAddresses: options.wsAddresses,
          ipcAddresses: options.ipcAddresses,
        };

        if (cb && cb.constructor === Function) {
          cb(null, vitals);
        } else {
          return vitals;
        }
      },
      rpc: { unsubscribe: function (_, callback) { setImmediate(function () { callback({ error: -32601, message: "Method not found"}) }); } }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        rpc: 'ethrpc',
        contracts: Contracts[constants.DEFAULT_NETWORK_ID],
        api: Contracts.api,
        httpAddresses: ['https://eth3.augur.net'],
        wsAddresses: [],
        ipcAddresses: []
      })
    }
  });
  test({
    description: 'Should handle a rpcinfo as an object with addresses arrays',
    rpcinfo: {
      httpAddresses: ['https://eth3.augur.net'],
      ipcAddresses: ['/path/to/geth.ipc'],
      wsAddresses: ['wss://ws.augur.net']
    },
    testThis: {
      sync: noop,
    },
    connector: {
      connect: function (options, cb) {
        assert.deepEqual(options, {
          rpc: 'ethrpc',
          httpAddresses: ['https://eth3.augur.net'],
          ipcAddresses: ['/path/to/geth.ipc'],
          wsAddresses: ['wss://ws.augur.net'],
          contracts: Contracts,
          api: Contracts.api
        });

        if (cb && cb.constructor === Function) {
          cb(null, options);
        } else {
          return options;
        }
      },
      rpc: { unsubscribe: function (_, callback) { setImmediate(function () { callback({ error: -32601, message: "Method not found"}) }); } }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        rpc: 'ethrpc',
        httpAddresses: ['https://eth3.augur.net'],
        ipcAddresses: ['/path/to/geth.ipc'],
        wsAddresses: ['wss://ws.augur.net'],
        contracts: Contracts,
        api: Contracts.api
      });
    }
  });
  test({
    description: 'Should handle a rpcinfo as an object - error back from connect',
    rpcinfo: {
      http: 'https://eth3.augur.net',
      ipc: '/path/to/geth.ipc',
      ws: 'wss://ws.augur.net'
    },
    testThis: {
      sync: noop,
    },
    connector: {
      connect: function (options, cb) {
        assert.deepEqual(options, {
          rpc: 'ethrpc',
          httpAddresses: ['https://eth3.augur.net'],
          ipcAddresses: ['/path/to/geth.ipc'],
          wsAddresses: ['wss://ws.augur.net'],
          contracts: Contracts,
          api: Contracts.api
        });

        if (cb && cb.constructor === Function) {
          cb({ error: 999, message: "Uh-Oh!"});
        } else {
          var err = new Error('Uh-Oh!');
          err.error = 999;
          return err;
        }
      },
      rpc: { unsubscribe: function (_, callback) { setImmediate(function () { callback({ error: -32601, message: "Method not found"}) }); } }
    },
    assertions: function (connection) {
      assert.deepEqual(connection.error, 999);
      assert.deepEqual(connection.message, 'Uh-Oh!');
    }
  });
  // this final test is going to async only. It passes rpcinfo as a function which triggers conditionals in our test function. Please take note of this when reading this test.
  test({
    description: 'Should handle a rpcinfo as a function',
    rpcinfo: function () {
      // simple set this to a function, we are going to pass through to assertions anyway and skip the sync tests in this case.
    },
    testThis: {
      sync: noop
    },
    connector: {
      connect: function (options, cb) {
        assert.deepEqual(options, {
          rpc: 'ethrpc',
          httpAddresses: [],
          wsAddresses: [],
          ipcAddresses: [],
          contracts: Contracts,
          api: Contracts.api
        });

        if (cb && cb.constructor === Function) {
          cb(null, options);
        } else {
          return options;
        }
      },
      rpc: { unsubscribe: function (_, callback) { setImmediate(function () { callback({ error: -32601, message: "Method not found"}) }); } }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        rpc: 'ethrpc',
        httpAddresses: [],
        wsAddresses: [],
        ipcAddresses: [],
        contracts: Contracts,
        api: Contracts.api
      });
    }
  });
});

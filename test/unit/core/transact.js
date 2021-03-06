"use strict";

var assert = require("chai").assert;
var augur = new (require("../../../src"))();

describe("Transact", function () {
	// 16 total tests
  var rpcFire = augur.rpc.callContractFunction;
  var rpcTransact = augur.rpc.transact;
  // var coinbase = augur.store.getState().coinbaseAddress;
  // var from = augur.store.getState().fromAddress;
  var web = augur.accounts;
  function noop() {};

  // describe("fire", function () {
	// 	// 8 total tests
  //   var test = function (t) {
  //     it(t.description, function () {
  //       t.setup();
  //       t.assertions(augur.fire(t.tx, t.callback, t.wrapper, t.aux));
  //       t.tearDown();
  //     });
  //   };
	//
  //   before(function () {
  //     augur.rpc.callContractFunction = function (tx, callback, wrapper, aux) {
  //       assert.deepEqual(callback, noop);
  //       assert.deepEqual(wrapper, noop);
  //       assert.deepEqual(aux, noop);
	// 			// return tx so we can assert that tx.from was set as expected.
  //       return tx;
  //     };
  //   });
	//
  //   after(function () {
  //     augur.rpc.callContractFunction = rpcFire;
  //   });
	//
	//
  //   test({
  //     description: "fire with no defined this.accounts.account, this.from, this.coinbase, tx.from",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000']
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {},
  //     tearDown: function () {},
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, null);
  //     }
  //   });
  //   test({
  //     description: "fire with no defined this.accounts.account, this.from, this.coinbase, but a tx.from passed in",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //       from: 'txFromAddress'
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {},
  //     tearDown: function () {},
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'txFromAddress');
  //     }
  //   });
  //   test({
  //     description: "fire with no defined this.accounts.account, this.from, tx.from but this.coinbase is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'coinbase');
  //     }
  //   });
  //   test({
  //     description: "fire with no defined this.accounts.account, tx.from, this.coinbase but this.from is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().fromAddress = from;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'augurFromAddress');
  //     }
  //   });
  //   test({
  //     description: "fire with no defined this.from, tx.from, this.coinbase but this.accounts.account is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {
  //       augur.accounts = { account: { address: 'browserAccountAddress' } };
  //     },
  //     tearDown: function () {
  //       augur.accounts = web;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'browserAccountAddress');
  //     }
  //   });
  //   test({
  //     description: "fire with defined this.from, tx.from, this.coinbase, and this.accounts.account is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //       from: 'txFromAddress'
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {
  //       augur.accounts = { account: { address: 'browserAccountAddress' } };
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.accounts = web;
  //       augur.store.getState().fromAddress = from;
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'browserAccountAddress');
  //     }
  //   });
  //   test({
  //     description: "fire with defined this.from, tx.from, this.coinbase, but  this.accounts.account is undefined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //       from: 'txFromAddress'
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().fromAddress = from;
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'txFromAddress');
  //     }
  //   });
  //   test({
  //     description: "fire with defined this.from and this.coinbase but  this.accounts.account and tx.from is undefined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     callback: noop,
  //     wrapper: noop,
  //     aux: noop,
  //     setup: function () {
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().fromAddress = from;
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'augurFromAddress');
  //     }
  //   });
  // });

  // describe("transact", function () {
	// 	// 8 total tests
  //   var test = function (t) {
  //     it(t.description, function () {
  //       t.setup();
  //       t.assertions(augur.transact(t.tx, t.onSent, t.onSuccess, t.onFailed));
  //       t.tearDown();
  //     });
  //   };
	//
  //   before(function () {
  //     augur.rpc.transact = function (tx, onSent, onSuccess, onFailed) {
  //       assert.deepEqual(onSent, noop);
  //       assert.deepEqual(onSuccess, noop);
  //       assert.deepEqual(onFailed, noop);
  //       return tx;
  //     };
  //   });
	//
  //   after(function () {
  //     augur.rpc.transact = rpcTransact;
  //   });
	//
	//
  //   test({
  //     description: "transact with no defined this.accounts.account, this.from, this.coinbase, tx.from",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000']
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {},
  //     tearDown: function () {},
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, null);
  //     }
  //   });
  //   test({
  //     description: "transact with no defined this.accounts.account, this.from, this.coinbase, but a tx.from passed in",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //       from: 'txFromAddress'
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {},
  //     tearDown: function () {},
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'txFromAddress');
  //     }
  //   });
  //   test({
  //     description: "transact with no defined this.accounts.account, this.from, tx.from but this.coinbase is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'coinbase');
  //     }
  //   });
  //   test({
  //     description: "transact with no defined this.accounts.account, tx.from, this.coinbase but this.from is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().fromAddress = from;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'augurFromAddress');
  //     }
  //   });
  //   test({
  //     description: "transact with no defined this.from, tx.from, this.coinbase but this.accounts.account is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {
  //       augur.accounts = { account: {
  //         address: 'browserAccountAddress',
  //         privateKey: 'browserAccountPrivateKey'
  //       } };
  //     },
  //     tearDown: function () {
  //       augur.accounts = web;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'browserAccountAddress');
  //     }
  //   });
  //   test({
  //     description: "transact with defined this.from, tx.from, this.coinbase, and this.accounts.account is defined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //       from: 'txFromAddress'
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {
  //       augur.accounts = { account: {
  //         address: 'browserAccountAddress',
  //         privateKey: 'browserAccountPrivateKey'
  //       } };
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.accounts = web;
  //       augur.store.getState().fromAddress = from;
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'browserAccountAddress');
  //     }
  //   });
  //   test({
  //     description: "transact with defined this.from, tx.from, this.coinbase, but  this.accounts.account is undefined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //       from: 'txFromAddress'
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().fromAddress = from;
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'txFromAddress');
  //     }
  //   });
  //   test({
  //     description: "transact with defined this.from and this.coinbase but  this.accounts.account and tx.from is undefined",
  //     tx: {
  //       inputs: ['branch', 'recver', 'value'],
  //       method: 'sendReputation',
  //       returns: 'unfix',
  //       send: true,
  //       signature: ['int256', 'int256', 'int256'],
  //       to: '0xd580b44476b80ed2ec59363a9a3df196538deef9',
  //       params: ['010101', 'recipientAddress', '0x8ac7230489e80000'],
  //     },
  //     onSent: noop,
  //     onSuccess: noop,
  //     onFailed: noop,
  //     setup: function () {
  //       augur.store.getState().fromAddress = 'augurFromAddress';
  //       augur.store.getState().coinbaseAddress = 'coinbase';
  //     },
  //     tearDown: function () {
  //       augur.store.getState().fromAddress = from;
  //       augur.store.getState().coinbaseAddress = coinbase;
  //     },
  //     assertions: function (out) {
  //       assert.deepEqual(out.from, 'augurFromAddress');
  //     }
  //   });
  // });
});

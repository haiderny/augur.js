"use strict";

var api = require("../api");
var rpcInterface = require("../rpc-interface");
var noop = require("../utils/noop");
var constants = require("../constants");

// { fromAddress, amount, registeredAddress, branch, onSent, onSuccess, onFailed }
function fundNewAccountFromAddress(p) {
  var onSentCallback = p.onSent || noop;
  var onSuccessCallback = p.onSuccess || noop;
  var onFailedCallback = p.onFailed || noop;
  rpcInterface.sendEther({
    to: p.registeredAddress,
    value: p.amount,
    from: p.fromAddress,
    onSent: noop,
    onSuccess: function () {
      api().Faucets.fundNewAccount({
        _signer: p._signer,
        branch: p.branch || constants.DEFAULT_BRANCH_ID,
        onSent: onSentCallback,
        onSuccess: onSuccessCallback,
        onFailed: onFailedCallback
      });
    },
    onFailed: onFailedCallback
  });
}

module.exports = fundNewAccountFromAddress;

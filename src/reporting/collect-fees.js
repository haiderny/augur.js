"use strict";

var assign = require("lodash.assign");
var abi = require("augur-abi");
var BigNumber = require("bignumber.js");
var getCurrentPeriodProgress = require("../reporting/get-current-period-progress");
var rpcInterface = require("../rpc-interface");
var api = require("../api");
var compose = require("../utils/compose");

// TODO break this apart
// { branch, sender, periodLength, onSent, onSuccess, onFailed }
function collectFees(p) {
  if (getCurrentPeriodProgress(p.periodLength) < 50) {
    return p.onFailed({ "-2": "needs to be second half of reporting period to claim rep" });
  }
  api().Branches.getVotePeriod({ branch: p.branch }, function (period) {
    api().ConsensusData.getFeesCollected({
      branch: p.branch,
      address: p.sender,
      period: period - 1
    }, function (feesCollected) {
      if (feesCollected === "1") return p.onSuccess({ callReturn: "2" });
      api().CollectFees.collectFees(assign({}, p, {
        tx: {
          value: abi.hex(new BigNumber("500000", 10).times(rpcInterface.getGasPrice()))
        },
        onSuccess: compose(function (res, callback) {
          if (res && (res.callReturn === "1" || res.callReturn === "2")) {
            return callback(res);
          }
          api().Branches.getVotePeriod({ branch: p.branch }, function (period) {
            api().ConsensusData.getFeesCollected({
              branch: p.branch,
              address: p.sender,
              period: period - 1
            }, function (feesCollected) {
              if (feesCollected !== "1") {
                res.callReturn = "2";
                return callback(res);
              }
              api().ExpiringEvents.getAfterRep({
                branch: p.branch,
                period: period - 1,
                sender: p.sender
              }, function (afterRep) {
                if (parseInt(afterRep, 10) <= 1) {
                  res.callReturn = "2";
                  return callback(res);
                }
                res.callReturn = "1";
                callback(res);
              });
            });
          });
        }, p.onSuccess)
      }));
    });
  });
}

module.exports = collectFees;

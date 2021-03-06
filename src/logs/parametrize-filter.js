"use strict";

var augurContracts = require("augur-contracts");
var buildTopicsList = require("./build-topics-list");
var rpcInterface = require("../rpc-interface");
var constants = require("../constants");

function parametrizeFilter(eventAPI, params) {
  return {
    fromBlock: params.fromBlock || constants.GET_LOGS_DEFAULT_FROM_BLOCK,
    toBlock: params.toBlock || constants.GET_LOGS_DEFAULT_TO_BLOCK,
    address: augurContracts[rpcInterface.getNetworkID()][eventAPI.contract],
    topics: buildTopicsList(eventAPI.signature, eventAPI.inputs, params)
  };
}

module.exports = parametrizeFilter;

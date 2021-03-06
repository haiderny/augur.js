"use strict";

var async = require("async");
var decreasePosition = require("./decrease-position");
var getPositionInMarket = require("../../markets/get-position-in-market");
var ZERO = require("../../constants").ZERO;

/**
 * Adjusts positions by subtracting out contributions from auto-generated
 * buyCompleteSets during shortAsk (or implicitly during short_sell).
 *
 * Standalone (non-delegated) buyCompleteSets are assumed to be part of
 * generateOrderBook, and are included in the user's position.
 *
 * sellCompleteSets - shortAskBuyCompleteSets
 *
 * Note: short_sell on-contract does not create a buyCompleteSets log.
 *
 * @param {string} account Ethereum account address.
 * @param {Array} marketIDs List of market IDs for position adjustment.
 * @param {Object} shareTotals Share totals keyed by log type.
 * @param {function=} callback Callback function (optional).
 * @return {Object} Adjusted positions keyed by marketID.
 */
function adjustPositions(account, marketIDs, shareTotals, callback) {
  var adjustedPositions = {};
  async.eachSeries(marketIDs, function (marketID, nextMarket) {
    getPositionInMarket({ market: marketID, account: account }, function (onChainPosition) {
      var shortAskBuyCompleteSetsShareTotal, shortSellBuyCompleteSetsShareTotal, sellCompleteSetsShareTotal;
      if (!onChainPosition) return nextMarket("couldn't load position in " + marketID);
      if (onChainPosition.error) return nextMarket(onChainPosition);
      shortAskBuyCompleteSetsShareTotal = shareTotals.shortAskBuyCompleteSets[marketID] || ZERO;
      shortSellBuyCompleteSetsShareTotal = shareTotals.shortSellBuyCompleteSets[marketID] || ZERO;
      sellCompleteSetsShareTotal = shareTotals.sellCompleteSets[marketID] || ZERO;
      if (sellCompleteSetsShareTotal.abs().gt(shortAskBuyCompleteSetsShareTotal.plus(shortSellBuyCompleteSetsShareTotal))) {
        sellCompleteSetsShareTotal = shortAskBuyCompleteSetsShareTotal.plus(shortSellBuyCompleteSetsShareTotal).neg();
      }
      adjustedPositions[marketID] = decreasePosition(
        onChainPosition,
        shortAskBuyCompleteSetsShareTotal.plus(shortSellBuyCompleteSetsShareTotal).plus(sellCompleteSetsShareTotal));
      nextMarket();
    });
  }, function (err) {
    if (err) return callback(err);
    callback(null, adjustedPositions);
  });
}

module.exports = adjustPositions;

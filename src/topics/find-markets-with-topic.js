"use strict";

var filterByBranchID = require("./filter-by-branch-id");
var getLogs = require("../logs/get-logs");
var encodeTag = require("../format/tag/encode-tag");

// TODO filter by endDate? (get active markets only)
// { topic, branchID }
function findMarketsWithTopic(p, callback) {
  getLogs({
    label: "marketCreated",
    filter: { topic: encodeTag(p.topic) },
    aux: null
  }, function (err, logs) {
    if (err) return callback(err);
    callback(null, filterByBranchID(p.branchID, logs));
  });
}

module.exports = findMarketsWithTopic;

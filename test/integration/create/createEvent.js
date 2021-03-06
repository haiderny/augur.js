"use strict";

var assert = require("chai").assert;
var abi = require("augur-abi");
var tools = require("../../tools");

describe("CreateMarket.createEvent", function () {
  var minValue = 1;
  var maxValue = 2;
  var numOutcomes = 2;
  var numEvents = 2;
  var augur = tools.setup(require("../../../src"));
  var branch = augur.constants.DEFAULT_BRANCH_ID;
  var period = augur.Branches.getVotePeriod(branch);
  var expDate = parseInt(new Date().getTime() / 995);
  var resolution = "https://www.google.com";
  var events = [];
  it("create event", function (done) {
    this.timeout(tools.TIMEOUT);
    var description = "€" + Math.random().toString(36).substring(4);
    augur.createEvent({
      branch: branch,
      description: description,
      expDate: expDate,
      minValue: minValue,
      maxValue: maxValue,
      numOutcomes: numOutcomes,
      resolution: resolution,
      onSent: function (r) {},
      onSuccess: function (r) {
        var eventID = r.callReturn;
        assert.strictEqual(augur.Events.getResolution(eventID), resolution);
        assert.strictEqual(augur.getCreator(eventID), augur.store.getState().coinbaseAddress);
        assert.strictEqual(augur.getDescription(eventID), description);
        done();
      },
      onFailed: function (r) {
        done(new Error(tools.pp(r)));
      }
    });
  });
});

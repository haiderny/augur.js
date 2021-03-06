"use strict";

var abi = require("augur-abi");

var parseAllLogsMessage = function (message, onMessage) {
  var i, len;
  if (message) {
    if (message.constructor === Object) {
      onMessage(message);
    } else if (message.length && message.constructor === Array) {
      for (i = 0, len = message.length; i < len; ++i) {
        if (message[i]) {
          if (message[i].constructor === Object && message[i].data) {
            message[i].data = abi.unroll_array(message[i].data);
          }
          onMessage(message[i]);
        }
      }
    }
  }
};

module.exports = parseAllLogsMessage;

"use strict";

module.exports = {
  fees: require("./fees"),
  group: require("./group"),
  makeOrder: require("./make-order"),
  orderBook: require("./order-book"),
  payout: require("./payout"),
  positions: require("./positions"),
  simulation: require("./simulation"),
  takeOrder: require("./take-order"),
  cancel: require("./cancel"),
  shrinkScalarPrice: require("./shrink-scalar-price"),
  expandScalarPrice: require("./expand-scalar-price"),
  adjustScalarSellPrice: require("./adjust-scalar-sell-price")
};

"use strict";

var sortedArray = require("alamid-sorted-array");

function sorted(List) {
    sortedArray(List.prototype);
}

module.exports = sorted;
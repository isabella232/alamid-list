"use strict";

var EventEmitter = require("events").EventEmitter,
    proto = EventEmitter.prototype;

function nodeEvents(List) {
    var config = List.prototype.config,
        constructor = List.prototype.constructor,
        key;

    config.emit = proto.emit;
    config.on = proto.on;
    config.removeListener = proto.removeListener;

    for (key in proto) { /* jshint forin: false */
        List.prototype[key] = proto[key];
    }

    List.prototype.constructor = function () {
        EventEmitter.call(this);
        constructor.apply(this, arguments);
    };
}

module.exports = nodeEvents;
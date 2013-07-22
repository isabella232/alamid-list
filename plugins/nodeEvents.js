"use strict";

var EventEmitter = require("events").EventEmitter,
    proto = EventEmitter.prototype;

function nodeEvents(List) {
    var key;

    List.config.adapter.emit = proto.emit;
    List.config.adapter.removeAllListeners = proto.removeAllListeners;

    for (key in proto) { /* jshint forin: false */
        List.prototype[key] = proto[key];
    }
}

module.exports = nodeEvents;
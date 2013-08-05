"use strict";

var EventEmitter = require("events").EventEmitter,
    proto = EventEmitter.prototype;

function nodeEvents(List) {
    var events = List.prototype.config.events,
        key;

    events.emit = proto.emit;
    events.removeAllListeners = proto.removeAllListeners;

    for (key in proto) { /* jshint forin: false */
        List.prototype[key] = proto[key];
    }
}

module.exports = nodeEvents;
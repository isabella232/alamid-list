"use strict";

var EventEmitter = require("events").EventEmitter,
    instance = EventEmitter.prototype;

function nodeEvents(List) {
    var events = List.prototype.config.events,
        key;

    events.emit = instance.emit;
    events.on = instance.on;
    events.removeListener = instance.removeListener;

    for (key in instance) { /* jshint forin: false */
        List.prototype[key] = instance[key];
    }
}

module.exports = nodeEvents;
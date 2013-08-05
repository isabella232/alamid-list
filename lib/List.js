"use strict";

var A = Array.prototype;

/**
 * Simple observable array. It acts just like an array but you can listen for
 * "add"-, "remove"- and "sort"-events. Instead of setting and retrieving
 * values via bracket notation you should use .set() and .at().
 *
 * @constructor
 */
function List() {
    List.prototype.constructor.apply(this, arguments);
}

/**
 * Internal array.
 *
 * @type {Array}
 * @private
 */
List.prototype._elements = null;

/**
 * The default config.
 *
 * @type {{events: {emit: *, removeAllListeners: *}}}
 */
List.prototype.config = {
    events: {
        emit: throwMethodMissingError("emit"),
        removeAllListeners: throwMethodMissingError("removeAllListeners")
    }
};

/**
 * Similar to the original Array-constructor this function takes either initial
 * elements or a number indicating the initial length of the array. For further documentation
 * take a look at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 *
 * Additionally you can also pass an array which will be taken as internal array.
 *
 * @param {Array|Number|*} arrOrLength
 */
List.prototype.constructor = function (arrOrLength) {
    var arr;

    if (arguments.length === 1 && typeof arrOrLength === "number") {
        this._elements = new Array(arrOrLength);
    } else if (arguments.length === 1 && Array.isArray(arrOrLength)) {
        this._elements = arrOrLength;
    } else {
        this._elements = arr = [];
        if (arguments.length > 0) {
            A.push.apply(arr, arguments);
        }
    }

    updateLength(this);
};

/**
 * Returns the internal array. Changing this array will also affect this list (but not emit any events, so be careful).
 * @returns {Array}
 */
List.prototype.toArray = function () {
    return this._elements;
};

/**
 * @type {number}
 */
List.prototype.length = 0;

/**
 * Mutates the list by appending the given elements and returning the new length of the list.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
 *
 * @param {...*} element1 new elements to append
 * @returns {Number}
 */
List.prototype.push = function (element1) {
    var arr = this._elements,
        i,
        currentLength,
        newLength;

    currentLength = arr.length;
    newLength = arr.push.apply(arr, arguments);
    updateLength(this);

    for (i = 0; i < arguments.length; i++) {
        emit(this, AddEvent, arguments[i], currentLength + i);
    }

    return newLength;
};

/**
 * Removes the last element from the list and returns that element.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop
 *
 * @returns {*}
 */
List.prototype.pop = function () {
    var arr = this._elements,
        element;

    element = arr.pop.apply(arr, arguments);
    updateLength(this);

    emit(this, RemoveEvent, element, arr.length);

    return element;
};

/**
 * Changes the content of an array, adding new elements while removing old elements.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
 *
 * @param {Number} index where the operation should take place
 * @param {Number} howMany elements to remove from this index
 * @param {...*} element1 new elements to insert at this index
 * @returns {Array}
 */
List.prototype.splice = function (index, howMany, element1) {
    var arr = this._elements,
        numOfNewElements = arguments.length - 2,
        i,
        removed;

    removed = arr.splice.apply(arr, arguments);
    updateLength(this);

    for (i = 0; i < howMany; i++) {
        emit(this, RemoveEvent, removed[i], index + i);
    }
    for (i = 0; i < numOfNewElements; i++) {
        emit(this, AddEvent, arguments[i + 2], index + i);
    }

    return removed;
};

/**
 * @returns {Number}
 */
List.prototype.unshift = function () {
    var arr = this._elements,
        i,
        newLength;

    newLength = arr.unshift.apply(arr, arguments);
    updateLength(this);

    for (i = 0; i < arguments.length; i++) {
        emit(this, AddEvent, arguments[i], i);
    }

    return newLength;
};

List.prototype.shift = function () {
    var arr = this._elements,
        element;

    element = arr.shift.apply(arr, arguments);
    updateLength(this);

    emit(this, RemoveEvent, element, 0);

    return element;
};

List.prototype.reverse = function () {
    var arr = this._elements,
        returned;

    returned = arr.reverse.apply(arr, arguments);
    emit(this, SortEvent, "reverse");

    return returned;
};

List.prototype.sort = function () {
    var arr = this._elements,
        returned;

    returned = arr.sort.apply(arr, arguments);
    emit(this, SortEvent, "sort");

    return returned;
};

List.prototype.at = function (index) {
    return this._elements[index];
};
List.prototype.get = List.prototype.at;

List.prototype.set = function (index, element) {
    var arr = this._elements,
        indexWithinBounds = index >= 0 && index < arr.length,
        prevElement;

    if (indexWithinBounds) {
        prevElement = this._elements[index];
    }
    this._elements[index] = element;

    if (indexWithinBounds) {
        emit(this, RemoveEvent, prevElement, index);
    }
    emit(this, AddEvent, element, index);
};

["concat", "join", "slice", "indexOf", "lastIndexOf", "toString", "forEach", "every", "some", "filter", "map", "reduce", "reduceRight"]
    .forEach(function (method) {
        List.prototype[method] = function () {
            return this._elements[method].apply(this._elements, arguments);
        };
    });

List.configure = function (newConfig) {
    var config = List.prototype.config,
        key;

    for (key in newConfig) {  /* jshint forin:false */
        config[key] = newConfig[key];
    }

    return this;
};

/**
 * Calls the given function with the List as argument. Plugins can be used to hook into class methods by
 * overriding them.
 *
 * @param {Function} plugin
 * @returns {List}
 */
List.use = function (plugin) {
    plugin(this);

    return this;
};

function throwMethodMissingError(method) {
    return function () {
        throw new Error("(alamid-list) You need to configure a '" + method + "'-method for the List");
    };
}

function updateLength(self) {
    self.length = self._elements.length;
}

function emit(self, Event, arg1, arg2, arg3) {
    self.config.events.emit.call(self, Event.prototype.name, new Event(self, arg1, arg2, arg3));
}

function AddEvent(target, element, index) {
    this.target = target;
    this.element = element;
    this.index = index;
}

/**
 * @type {string}
 */
AddEvent.prototype.name = "add";

/**
 * The list that emitted the event
 * @type {Function}
 */
AddEvent.prototype.target = null;

/**
 * The previous value
 * @type {*}
 */
AddEvent.prototype.element = null;

/**
 * The previous value
 * @type {Number}
 */
AddEvent.prototype.index = null;

function RemoveEvent(target, element, index) {
    this.target = target;
    this.element = element;
    this.index = index;
}

/**
 * @type {string}
 */
RemoveEvent.prototype.name = "remove";

/**
 * The list that emitted the event
 * @type {Function}
 */
RemoveEvent.prototype.target = null;

/**
 * The previous value
 * @type {*}
 */
RemoveEvent.prototype.element = null;

/**
 * The previous value
 * @type {Number}
 */
RemoveEvent.prototype.index = null;

function SortEvent(target, type) {
    this.target = target;
    this.type = type;
}

/**
 * @type {string}
 */
SortEvent.prototype.name = "sort";

/**
 * The list that emitted the event
 * @type {Function}
 */
SortEvent.prototype.target = null;

/**
 * Can be 'reverse' or 'sort' depending on the
 * operation that caused the sort-event.
 *
 * @type {String}
 */
SortEvent.prototype.type = null;

module.exports = List;
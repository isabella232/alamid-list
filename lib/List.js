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
 * @type {{emit: Function, on: Function, removeListener: Function, removeAllListeners: Function}}
 */
List.prototype.config = {
    emit: throwMethodMissingError("emit"),
    on: throwMethodMissingError("on"),
    removeListener: throwMethodMissingError("removeListener"),
    removeAllListeners: throwMethodMissingError("removeAllListeners")
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

List.prototype.dispose = function () {
    delete this._elements;
    this.config.removeAllListeners.call(this);
};

["concat", "join", "slice", "indexOf", "lastIndexOf", "toString", "forEach", "every", "some", "filter", "map", "reduce", "reduceRight"]
    .forEach(function (method) {
        List.prototype[method] = function () {
            return this._elements[method].apply(this._elements, arguments);
        };
    });

List.configure = function (newConfig) {
    this.prototype.config = newConfig;

    return this;
};

/**
 * Calls the given function with the List as first argument and the given config (optionally). Plugins can be used
 * to hook into class methods by overriding them.
 *
 * You may call this function multiple times with the same plugin, the plugin will only be applied once.
 *
 * @param {Function} plugin
 * @param {Object=} config
 * @returns {Function}
 */
List.use = function (plugin, config) {
    this._plugins = this._plugins || [];

    if (this._plugins.indexOf(plugin) === -1) {
        plugin(this, config);
        this._plugins.push(plugin);
    }

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
    self.config.emit.call(self, Event.prototype.type, new Event(self, arg1, arg2, arg3));
}

function AddEvent(target, element, index) {
    this.target = target;
    this.element = element;
    this.index = index;
}

/**
 * @type {String}
 */
AddEvent.prototype.type = "add";

/**
 * The list that emitted the event
 * @type {Function}
 */
AddEvent.prototype.target = null;

/**
 * @type {*}
 */
AddEvent.prototype.element = null;

/**
 * @type {Number}
 */
AddEvent.prototype.index = null;

function RemoveEvent(target, element, index) {
    this.target = target;
    this.element = element;
    this.index = index;
}

/**
 * @type {String}
 */
RemoveEvent.prototype.type = "remove";

/**
 * The list that emitted the event
 * @type {Function}
 */
RemoveEvent.prototype.target = null;

/**
 * @type {*}
 */
RemoveEvent.prototype.element = null;

/**
 * @type {Number}
 */
RemoveEvent.prototype.index = null;

function SortEvent(target, sortType) {
    this.target = target;
    this.sortType = sortType;
}

/**
 * @type {string}
 */
SortEvent.prototype.type = "sort";

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
SortEvent.prototype.sortType = null;

module.exports = List;
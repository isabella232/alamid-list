"use strict";

var A = Array.prototype;

function List() {
    List.prototype.constructor.apply(this, arguments);
}

List.prototype._elements = null;

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

List.prototype.toArray = function () {
    return this._elements;
};

List.prototype.length = 0;

List.prototype.push = function () {
    var arr = this._elements,
        i,
        currentLength,
        newLength;

    currentLength = arr.length;
    newLength = arr.push.apply(arr, arguments);
    updateLength(this);

    for (i = 0; i < arguments.length; i++) {
        emit(this, List.AddEvent, arguments[i], currentLength + i);
    }

    return newLength;
};

List.prototype.pop = function () {
    var arr = this._elements,
        element;

    element = arr.pop.apply(arr, arguments);
    updateLength(this);

    emit(this, List.RemoveEvent, element, arr.length);

    return element;
};

List.prototype.splice = function (index, howMany) {
    var arr = this._elements,
        numOfNewElements = arguments.length - 2,
        i,
        removed;

    removed = arr.splice.apply(arr, arguments);
    updateLength(this);

    for (i = 0; i < howMany; i++) {
        emit(this, List.RemoveEvent, removed[i], index + i);
    }
    for (i = 0; i < numOfNewElements; i++) {
        emit(this, List.AddEvent, arguments[i + 2], index + i);
    }

    return removed;
};

List.prototype.unshift = function () {
    var arr = this._elements,
        i,
        newLength;

    newLength = arr.unshift.apply(arr, arguments);
    updateLength(this);

    for (i = 0; i < arguments.length; i++) {
        emit(this, List.AddEvent, arguments[i], i);
    }

    return newLength;
};

List.prototype.shift = function () {
    var arr = this._elements,
        element;

    element = arr.shift.apply(arr, arguments);
    updateLength(this);

    emit(this, List.RemoveEvent, element, 0);

    return element;
};

List.prototype.reverse = function () {
    var arr = this._elements,
        returned;

    returned = arr.reverse.apply(arr, arguments);
    emit(this, List.OrderChangeEvent, "reverse");

    return returned;
};

List.prototype.sort = function () {
    var arr = this._elements,
        returned;

    returned = arr.sort.apply(arr, arguments);
    emit(this, List.OrderChangeEvent, "sort");

    return returned;
};

List.prototype.at = function (index) {
    return this._elements[index];
};
List.prototype.get = List.prototype.at;

List.prototype.set = function (index, element) {
    this._elements[index] = element;
};

List.prototype.concat = proxy("concat");
List.prototype.join = proxy("join");
List.prototype.slice = proxy("slice");
List.prototype.indexOf = proxy("indexOf");
List.prototype.lastIndexOf = proxy("lastIndexOf");
List.prototype.toString = proxy("toString");
List.prototype.forEach = proxy("forEach");
List.prototype.every = proxy("every");
List.prototype.some = proxy("some");
List.prototype.filter = proxy("filter");
List.prototype.map = proxy("map");
List.prototype.reduce = proxy("reduce");
List.prototype.reduceRight = proxy("reduceRight");

function proxy(method) {
    return function (a, b, c) {
        if (arguments.length === 0) {
            this._elements[method]();
        } else if (arguments.length === 1) {
            this._elements[method](a);
        } else if (arguments.length === 2) {
            this._elements[method](a, b);
        } else if (arguments.length === 3) {
            this._elements[method](a, b, c);
        } else {
            this._elements[method].apply(this._elements, arguments);
        }
    };
}

function updateLength(self) {
    self.length = self._elements.length;
}

function emit(self, Event, arg1, arg2, arg3) {
    self.emit(Event.prototype.name, new Event(self, arg1, arg2, arg3));
}

function AddEvent(target, element, index) {
    this.target = target;
    this.element = element;
    this.index = index;
}
List.AddEvent = AddEvent;

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
List.RemoveEvent = RemoveEvent;

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

function OrderChangeEvent(target, type) {
    this.target = target;
    this.type = type;
}
List.OrderChangeEvent = OrderChangeEvent;

/**
 * @type {string}
 */
OrderChangeEvent.prototype.name = "orderChange";

/**
 * The list that emitted the event
 * @type {Function}
 */
OrderChangeEvent.prototype.target = null;

/**
 * Can be 'reverse' or 'sort' depending on the
 * operation that caused the orderChange-event.
 *
 * @type {String}
 */
OrderChangeEvent.prototype.type = null;

module.exports = List;
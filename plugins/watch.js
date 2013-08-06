"use strict";

var proto = Watch.prototype;

function watch(List) {
    List.prototype.watch = proto.watch;
    List.prototype.unwatch = proto.unwatch;
}

function Watch() {}

Watch.prototype.watch = function (master) {
    var prevMaster,
        config,
        on;

    on = master.on || master.config.events.on;

    if (!this.config.watch) {
        initInstance(this);
    }
    config = this.config.watch;
    prevMaster = config.master;
    if (prevMaster) {
        this.unwatch();
    }

    config.master = master;

    on.call(master, "add", config.onMasterAdd);
    on.call(master, "remove", config.onMasterRemove);
    on.call(master, "sort", config.onMasterSort);

    return this;
};

Watch.prototype.unwatch = function () {
    var config = this.config.watch,
        master,
        removeListener;

    if (!config) {
        return this;
    }
    master = config.master;
    if (!master) {
        return this;
    }

    removeListener = master.removeListener || master.config.events.removeListener;

    config.master = null;

    removeListener.call(master, "add", config.onMasterAdd);
    removeListener.call(master, "remove", config.onMasterRemove);
    removeListener.call(master, "sort", config.onMasterSort);

    return this;
};

function initInstance(instance) {
    var config,
        isIndexBased;

    function onMasterAdd(event) {
        isIndexBased = typeof event.index === "number";

        // unshift() and push() are faster than splice()
        if (event.index === instance.length || isIndexBased === false) {
            instance.push(event.element);
        } else if (event.index === 0) {
            instance.unshift(event.element);
        } else {
            instance.splice(event.index, 0, event.element);
        }
    }

    function onMasterRemove(event) {
        var index;

        isIndexBased = typeof event.index === "number";

        // shift() and pop() are faster than splice()
        if (event.index === 0) {
            instance.shift();
        } else if (event.index === instance.length - 1) {
            instance.pop();
        } else {
            if (isIndexBased) {
                index = event.index;
            } else {
                index = instance.indexOf(event.element);
            }
            instance.splice(index, 1);
        }
    }

    function onMasterSort(event) {
        var arr,
            spliceArgs;

        if (event.type === "reverse") {
            instance.reverse();
        } else {
            arr = instance._elements;
            spliceArgs = [0, arr.length].concat(event.target._elements);
            arr.splice.apply(arr, spliceArgs);
        }
    }

    if (instance.hasOwnProperty("config") === false) {
        instance.config = Object.create(instance.config);
    }

    instance.config.watch = config = {
        master: null,
        onMasterAdd: onMasterAdd,
        onMasterRemove: onMasterRemove,
        onMasterSort: onMasterSort
    };
}

module.exports = watch;
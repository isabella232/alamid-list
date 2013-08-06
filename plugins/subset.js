"use strict";

function subset(List) {
    List.prototype.subset = function (options) {
        var master = this,
            on = master.config.events.on,
            subset = new List(master.toArray().slice());

        function onMasterAdd(event) {
            // unshift() and push() are faster than splice()
            if (event.index === 0) {
                subset.unshift(event.element);
            } else if (event.index === subset.length) {
                subset.push(event.element);
            } else {
                subset.splice(event.index, 0, event.element);
            }
        }

        function onMasterRemove(event) {
            // shift() and pop() are faster than splice()
            if (event.index === 0) {
                subset.shift();
            } else if (event.index === subset.length - 1) {
                subset.pop();
            } else {
                subset.splice(event.index, 1);
            }
        }

        function onMasterSort(event) {
            var arr;

            if (event.type === "reverse") {
                subset.reverse();
            } else {
                arr = master.slice();
                subset._elements = arr;
            }
        }

        if (options) {
            options = Object.create(options);
        } else {
            options = {};
        }
        subset.config.sync = options;
        subset.config = Object.create(subset.config);


        options.onMasterAdd = onMasterAdd;
        options.onMasterRemove = onMasterRemove;
        options.onMasterSort = onMasterSort;
        options.master = master;

        on.call(master, "add", onMasterAdd);
        on.call(master, "remove", onMasterRemove);
        on.call(master, "sort", onMasterSort);

        subset.unsync = Subset.prototype.unsync;
        subset.getMaster = Subset.prototype.getMaster;

        return subset;
    };
}

function Subset() {}

Subset.prototype.unsync = function () {
    var master = this.getMaster(),
        removeListener = master.config.events.removeListener;

    removeListener.call(master, "add", this.config.subset.onMasterAdd);
    removeListener.call(master, "remove", this.config.subset.onMasterRemove);
    removeListener.call(master, "sort", this.config.subset.onMasterSort);
};

Subset.prototype.getMaster = function () {
    return this.config.sync.master;
};

module.exports = subset;
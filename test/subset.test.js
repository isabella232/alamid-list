"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    List = require("../lib/List.js"),
    emitter = require("events").EventEmitter.prototype,
    subsetPlugin = require("../plugins/subset.js"),
    expect = chai.expect;

chai.use(require("sinon-chai"));

describe("plugins/subset", function () {
    var master,
        arr,
        subset;

    function MasterList() {
        List.apply(this, arguments);
    }

    function evenOnly(number) {
        return number % 2;
    }

    before(function () {
        MasterList.use = List.use;
        MasterList.configure = List.configure;
        MasterList.prototype = Object.create(List.prototype);
        MasterList.use(subsetPlugin);
        MasterList.configure({
            events: {
                emit: emitter.emit,
                on: emitter.on,
                removeListener: emitter.removeListener
            }
        });
    });

    beforeEach(function () {
        master = new MasterList([1, 2, 3, 4, 5]);
    });

    describe("when passing no options", function () {

        it("should return a copy of the master list", function () {
            subset = master.subset();
            expect(subset).not.to.equal(master);
            expect(subset.toArray()).not.to.equal(master.toArray());
            expect(subset.toArray()).to.eql([1, 2, 3, 4, 5]);
        });

        it("should listen for 'add'-events", function () {
            subset = master.subset();
            master.push(6);
            master.unshift(0);
            master.splice(1, 0, 1);
            expect(subset.toArray()).to.eql([0, 1, 1, 2, 3, 4, 5, 6]);
        });

        it("should listen for 'remove'-events", function () {
            subset = master.subset();
            master.pop();
            master.shift();
            master.splice(1, 1);
            expect(subset.toArray()).to.eql([2, 4]);
        });

        it("should listen for 'sort'-events", function () {
            arr = master.toArray();
            // mixing up the array
            arr.splice(0, arr.length, 5, 2, 3, 1, 4);

            subset = master.subset();
            master.sort();
            expect(subset.toArray()).to.eql([1, 2, 3, 4, 5]);
            master.reverse();
            expect(subset.toArray()).to.eql([5, 4, 3, 2, 1]);
        });

    });

    describe("when passing a filter", function () {

        it("should return a filtered list", function () {
            subset = master.subset({
                filter: evenOnly
            });
            expect(subset.toArray()).to.eql([2, 4]);
        });

        it("should only add elements on 'add' that pass the filter", function () {
            master.push(6, 7, 8);
            expect(subset.toArray()).to.eql([2, 4, 6, 8]);
        });

    });
});
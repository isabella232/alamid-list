"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    List = require("../lib/List.js"),
    sorted = require("../plugins/sorted.js"),
    expect = chai.expect;

chai.use(require("sinon-chai"));

describe("plugins/sorted", function () {
    var list,
        emit;

    function SortedList() {
        List.apply(this, arguments);
    }

    before(function () {
        List.configure({
            emit: function () {}
        });
        SortedList.use = List.use;
        SortedList.prototype = Object.create(List.prototype);
        SortedList.use(sorted);
    });

    beforeEach(function () {
        list = new SortedList();
    });

    it("should turn the list into a sorted list", function () {
        list.push(5, 2, 3);
        expect(list.toArray()).to.eql([2, 3, 5]);
    });

    it("should emit events as expected", function () {
        var event;

        List.prototype.config.emit = emit = sinon.spy();
        list.push(2, 4, 5);

        expect(emit).to.have.been.calledThrice;

        expect(emit.firstCall).to.have.been.calledWith("add");
        event = emit.firstCall.args[1];
        expect(event).to.eql({
            name: "add",
            target: list,
            element: 2,
            index: 0
        });
        expect(event.target.toArray()[event.index]).to.equal(event.element);

        expect(emit.secondCall).to.have.been.calledWith("add");
        event = emit.secondCall.args[1];
        expect(event).to.eql({
            name: "add",
            target: list,
            element: 4,
            index: 1
        });
        expect(event.target.toArray()[event.index]).to.equal(event.element);

        expect(emit.thirdCall).to.have.been.calledWith("add");
        event = emit.thirdCall.args[1];
        expect(event).to.eql({
            name: "add",
            target: list,
            element: 5,
            index: 2
        });
        expect(event.target.toArray()[event.index]).to.equal(event.element);

        List.prototype.config.emit = emit = sinon.spy();
        list.pop();

        expect(emit).to.have.been.calledOnce;

        expect(emit.firstCall).to.have.been.calledWith("remove");
        event = emit.firstCall.args[1];
        expect(event).to.eql({
            name: "remove",
            target: list,
            element: 5,
            index: 2
        });

        List.prototype.config.emit = emit = sinon.spy();
        list.sort();

        expect(emit.firstCall).to.have.been.calledWith("sort");
        event = emit.firstCall.args[1];
        expect(event).to.eql({
            name: "sort",
            target: list,
            type: "sort"
        });

    });
    
    it("should be possible to define a comparator", function () {
        function SortedListStrings() {
            List.apply(this, arguments);
        }
        SortedListStrings.prototype = Object.create(SortedList.prototype);
        SortedListStrings.prototype.comparator = function (a, b) {
            return a.length - b.length;
        };

        list = new SortedListStrings();
        list.push("a", "aa", "", "aaa", "aa");
        expect(list.toArray()).to.eql(["", "a", "aa", "aa", "aaa"]);
    });

});
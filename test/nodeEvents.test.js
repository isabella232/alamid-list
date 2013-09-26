"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    List = require("../lib/List.js"),
    nodeEvents = require("../plugins/nodeEvents.js"),
    emitter = require("events").EventEmitter.prototype,
    expect = chai.expect;

chai.use(require("sinon-chai"));

describe("plugins/nodeEvents", function () {
    var list;

    function MyList() {
        List.apply(this, arguments);
    }

    before(function () {
        MyList.prototype = Object.create(List.prototype);
        MyList.use = List.use;
        MyList.use(nodeEvents);
    });

    beforeEach(function () {
        list = new MyList();
    });

    it("should adjust the config", function () {
        expect(list.config.emit).to.equal(emitter.emit);
        expect(list.config.on).to.equal(emitter.on);
        expect(list.config.removeListener).to.equal(emitter.removeListener);
        expect(list.config.removeAllListeners).to.equal(emitter.removeAllListeners);
    });

    it("should enable working with node's EventEmitter", function () {
        var listener = sinon.spy();

        expect(list.on).to.be.a("function");
        expect(list.removeListener).to.be.a("function");

        list.on("add", listener);
        list.set("greeting", "hi");
        expect(listener).to.have.been.calledOnce;

        list.removeListener("add", listener);
        list.set("greeting", "ahoi");
        expect(listener).to.have.been.calledOnce;
    });

    it("should throw an error if the target api clashes with the EventEmitter api", function () {
        function WontWork() {}

        WontWork.prototype = Object.create(List.prototype);
        WontWork.prototype.on = function () {};
        WontWork.use = List.use;

        expect(function () {
            WontWork.use(nodeEvents);
        }).to.throw(Error, "There is already a 'on'-property defined");
    });

});
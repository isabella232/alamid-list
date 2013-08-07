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

    it("should adjust the config", function () {
        List.use(nodeEvents);
        list = new List();

        expect(list.config.emit).to.equal(emitter.emit);
        expect(list.config.on).to.equal(emitter.on);
        expect(list.config.removeListener).to.equal(emitter.removeListener);
    });

    it("should enable working with node's EventEmitter", function () {
        var listener = sinon.spy();

        List.use(nodeEvents);
        list = new List();

        expect(list.on).to.be.a("function");
        expect(list.removeListener).to.be.a("function");

        list.on("add", listener);
        list.set("greeting", "hi");
        expect(listener).to.have.been.calledOnce;

        list.removeListener("add", listener);
        list.set("greeting", "ahoi");
        expect(listener).to.have.been.calledOnce;
    });

});
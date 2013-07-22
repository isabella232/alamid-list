"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    List = require("../lib/List.js"),
    nodeEvents = require("../plugins/nodeEvents.js"),
    expect = chai.expect;

chai.use(require("sinon-chai"));

describe("plugins/nodeEvents", function () {
    var list;

    it("should enable working with node's EventEmitter", function () {
        var listener = sinon.spy();

        List.use(nodeEvents);
        list = new List();

        expect(list.on).to.be.a("function");
        expect(list.removeListener).to.be.a("function");

        list.on("add", listener);
        list.push(1);
        expect(listener).to.have.been.calledOnce;

        list.removeListener("add", listener);
        list.push(2);
        expect(listener).to.have.been.calledOnce;
    });

});
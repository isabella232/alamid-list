"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    List = require("../lib/List.js"),
    emitter = require("events").EventEmitter.prototype,
    watch = require("../plugins/watch.js"),
    expect = chai.expect;

chai.use(require("sinon-chai"));

describe("plugins/watch", function () {
    var master,
        slave;

    function Slave() {
        List.apply(this, arguments);
    }

    before(function () {
        Slave.use = List.use;
        Slave.prototype = Object.create(List.prototype);
        Slave.use(watch);
        List.configure({
            emit: emitter.emit,
            on: emitter.on,
            removeListener: emitter.removeListener,
            removeAllListeners: emitter.removeAllListeners
        });
    });

    beforeEach(function () {
        master = new List();
        slave = new Slave();
    });

    describe(".prototype", function () {

        describe(".watch()", function () {

            it("should listen for 'add'-events", function () {
                slave.watch(master);

                master.push(4);
                expect(slave.toArray()).to.eql([4]);
                master.unshift(1);
                expect(slave.toArray()).to.eql([1, 4]);
                master.splice(1, 0, 2, 3);
                expect(slave.toArray()).to.eql([1, 2, 3, 4]);
            });

            it("should listen for 'remove'-events", function () {
                master.push(1, 2, 3, 4);
                slave.push(1, 2, 3, 4);

                slave.watch(master);

                master.pop();
                expect(slave.toArray()).to.eql([1, 2, 3]);
                master.shift();
                expect(slave.toArray()).to.eql([2, 3]);
                master.splice(1, 1);
                expect(slave.toArray()).to.eql([2]);
            });

            it("should listen for 'sort'-events", function () {
                master.push(4, 1, 3, 2);
                slave.push(4, 1, 3, 2);

                slave.watch(master);

                master.sort();
                expect(slave.toArray()).to.eql([1, 2, 3, 4]);
                master.reverse();
                expect(slave.toArray()).to.eql([4, 3, 2, 1]);
            });

            it("should be chainable", function () {
                expect(slave.watch(master)).to.equal(slave);
            });

            describe("when there is already a master", function () {
                var newMaster;

                it("should .unwatch() the old master", function () {
                    newMaster = new List();
                    slave.watch(master);
                    slave.watch(newMaster);

                    master.push(1);
                    expect(slave.toArray()).to.eql([]);
                    newMaster.push(1);
                    expect(slave.toArray()).to.eql([1]);
                });

            });

        });

        describe(".unwatch()", function () {

            it("should not listen for any events of the old master", function () {
                master.push(4, 1, 3, 2);
                slave.push(4, 1, 3, 2);

                slave.watch(master);
                slave.unwatch();

                master.push(5);
                master.unshift(-1);
                master.pop();
                master.shift();
                master.sort();

                expect(slave.toArray()).to.eql([4, 1, 3, 2]);
            });

            it("should be chainable", function () {
                slave.watch(master);
                expect(slave.unwatch()).to.equal(slave);
            });

            describe("when .watch() has never been called before", function () {

                it("should do nothing", function () {
                    slave.unwatch();
                });

                it("should be chainable", function () {
                    expect(slave.unwatch()).to.equal(slave);

                    slave.watch(master);
                    slave.unwatch();

                    expect(slave.unwatch()).to.equal(slave);
                });

            });

        });
        
        describe(".dispose()", function () {

            it("should call .unwatch()", function () {
                var unwatch;

                slave.watch(master);
                slave.unwatch = unwatch = sinon.spy();

                slave.dispose();

                expect(unwatch).to.have.been.calledOnce;
            });

            it("should also call List.prototype.dispose()", function () {
                slave.watch(master);
                slave.dispose();

                // we cannot just monkey-patch List.prototype.dispose because the
                // original reference has already been stored by calling
                // List.use()
                // That's why we're checking for a side-effect of dispose()
                expect(slave._elements).to.not.be.ok;
            });

        });

    });

});
"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    List = require("../lib/List.js"),
    expect = chai.expect;

chai.use(require("sinon-chai"));

describe("List", function () {

    describe(".configure()", function () {

        function emit() {}
        function on() {}
        function removeListener() {}
        function removeAllListeners() {}

        it("should set the given config", function () {
            List.configure({
                emit: emit,
                on: on,
                removeListener: removeListener,
                removeAllListeners: removeAllListeners
            });

            expect(List.prototype.config.emit).to.equal(emit);
            expect(List.prototype.config.on).to.equal(on);
            expect(List.prototype.config.removeListener).to.equal(removeListener);
            expect(List.prototype.config.removeAllListeners).to.equal(removeAllListeners);
        });

    });

    describe(".use()", function () {

        it("should provide an plugin-interface", function () {
            var plugin = sinon.spy();

            List.use(plugin);
            expect(plugin).to.have.been.calledWith(List);
            expect(List.use(plugin)).to.equal(List);
        });

        it("should be chainable", function () {
            expect(List.use(function () {})).to.equal(List);
        });

    });

    describe(".prototype", function () {
        var list,
            emit,
            arr;

        beforeEach(function () {
            list = new List();
            List.prototype.config.emit = emit = sinon.spy();
        });

        describe(".config", function () {

            it("should be an object containing the current config", function () {
                expect(List.prototype.config).to.be.an("object");
            });

        });

        describe(".constructor()", function () {

            it("should be an override-able function", function () {
                var constructor = List.prototype.constructor;

                expect(constructor).to.be.a("function");

                List.prototype.constructor = sinon.spy();
                list = new List();
                expect(List.prototype.constructor).to.have.been.called;

                List.prototype.constructor = constructor;
            });

            it("should return an instance of List", function () {
                expect(new List()).to.be.an.instanceof(List);
            });

            it("should be callable with new elements", function () {
                list = new List(1, 2, 3);
                expect(list.toArray()).to.eql(new Array(1, 2, 3));
            });

            it("should be callable with a length", function () {
                list = new List(3);
                expect(list.toArray()).to.eql(new Array(3));
            });

            it("should be callable with an initial array", function () {
                arr = [1, 2, 3];
                list = new List(arr);
                expect(list.toArray()).to.equal(arr);
            });

            it("should update .length accordingly", function () {
                list = new List(3);
                expect(list.length).to.equal(3);
                list = new List("Hi");
                expect(list.length).to.equal(1);
                list = new List([1, 2, 3]);
                expect(list.length).to.equal(3);
            });

        });

        describe(".toArray()", function () {

            it("should return the internal array", function () {
                arr = list.toArray();
                expect(arr).to.be.an.instanceof(Array);
                list.push(1);
                expect(arr).to.eql([1]);
            });

        });

        describe(".push()", function () {

            it("should proxy to array.push()", function () {
                var arr = list.toArray(),
                    result;

                arr.push = sinon.spy();
                result = list.push(1, 2, 3);

                expect(arr.push).to.have.been.calledWith(1, 2, 3);
                expect(arr.push).to.have.returned(result);
            });

            it("should emit an 'add'-event for each added element", function () {
                list.push(1, 2);
                checkIfAddHasBeenEmitted();
            });

            it("should update .length accordingly", function () {
                list.push(1, 2);
                expect(list.length).to.equal(2);
                list.push(3, 4);
                expect(list.length).to.equal(4);
            });

        });

        describe(".pop()", function () {

            beforeEach(function () {
                list.toArray().push(1, 2, 3);
            });

            it("should proxy to array.pop()", function () {
                var result;

                arr = list.toArray();
                arr.pop = sinon.spy();
                result = list.pop();

                expect(arr.pop).to.have.been.calledWith();
                expect(arr.pop).to.have.returned(result);
            });

            it("should emit an 'remove'-event", function () {
                var firstCall,
                    secondCall;

                list.pop();
                list.pop();

                firstCall = {
                    element: 3,
                    index: 2
                };
                secondCall = {
                    element: 2,
                    index: 1
                };

                checkIfRemoveHasBeenEmitted(firstCall, secondCall);
            });

            it("should update .length accordingly", function () {
                list.pop();
                expect(list.length).to.equal(2);
                list.pop();
                expect(list.length).to.equal(1);
            });

        });

        describe(".splice()", function () {

            it("should proxy to array.splice()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2);
                arr.splice = sinon.spy();
                result = list.splice(2, 0, "a", "b", "c");

                expect(arr.splice).to.have.been.calledWith(2, 0, "a", "b", "c");
                expect(arr.splice).to.have.returned(result);
            });

            it("should emit an 'add'-event for each added element", function () {
                arr = list.toArray();
                arr.push(1, 2);

                list.splice(0, 0, 1, 2);
                checkIfAddHasBeenEmitted();
            });

            it("should emit an 'remove'-event for each removed element", function () {
                var firstCall,
                    secondCall;

                arr = list.toArray();
                arr.push(1, 2, 3);

                list.splice(1, 2);

                firstCall = {
                    element: 2,
                    index: 1
                };
                secondCall = {
                    element: 3,
                    index: 2
                };
                checkIfRemoveHasBeenEmitted(firstCall, secondCall);
            });

            it("should update .length accordingly", function () {
                arr = list.toArray();
                arr.push(1, 2, 3, 4, 5);

                list.splice(2, 2);
                expect(list.length).to.equal(3);
                list.splice(0, 0, 1, 2, 3);
                expect(list.length).to.equal(6);
            });

        });

        describe(".unshift()", function () {

            it("should proxy to array.unshift()", function () {
                var result;

                arr = list.toArray();
                arr.unshift = sinon.spy();
                result = list.unshift(1, 2, 3);

                expect(arr.unshift).to.have.been.calledWith(1, 2, 3);
                expect(arr.unshift).to.have.returned(result);
            });

            it("should emit an 'add'-event for each added element", function () {
                list.unshift(1, 2);
                checkIfAddHasBeenEmitted();
            });

            it("should update .length accordingly", function () {
                list.unshift(1, 2);
                expect(list.length).to.equal(2);
                list.unshift(3, 4);
                expect(list.length).to.equal(4);
            });

        });
        
        describe(".shift()", function () {

            beforeEach(function () {
                list.toArray().push(1, 2, 3);
            });

            it("should proxy to array.shift()", function () {
                var result;

                arr = list.toArray();
                arr.shift = sinon.spy();
                result = list.shift();

                expect(arr.shift).to.have.been.calledWith();
                expect(arr.shift).to.have.returned(result);
            });

            it("should emit an 'remove'-event", function () {
                var firstCall,
                    secondCall;

                list.shift();
                list.shift();

                firstCall = {
                    element: 1,
                    index: 0
                };
                secondCall = {
                    element: 2,
                    index: 0
                };

                checkIfRemoveHasBeenEmitted(firstCall, secondCall);
            });

            it("should update .length accordingly", function () {
                list.shift();
                expect(list.length).to.equal(2);
                list.shift();
                expect(list.length).to.equal(1);
            });

        });
        
        describe(".reverse()", function () {

            beforeEach(function () {
                list.toArray().push(1, 2, 3);
            });

            it("should proxy to array.reverse()", function () {
                var result;

                arr = list.toArray();
                arr.reverse = sinon.spy();
                result = list.reverse();

                expect(arr.reverse).to.have.been.calledWith();
                expect(arr.reverse).to.have.returned(result);
            });

            it("should emit an 'sort'-event", function () {
                var event;

                list.reverse();
                expect(emit.firstCall).to.have.been.calledWith("sort");
                event = emit.firstCall.args[1];
                expect(event).to.eql({
                    type: "sort",
                    target: list,
                    sortType: "reverse"
                });
            });

        });
        
        describe(".sort()", function () {

            beforeEach(function () {
                list.toArray().push(1, 3, 2);
            });

            it("should proxy to array.sort()", function () {
                var result;

                arr = list.toArray();
                arr.sort = sinon.spy();
                result = list.sort();

                expect(arr.sort).to.have.been.calledWith();
                expect(arr.sort).to.have.returned(result);
            });

            it("should emit an 'sort'-event", function () {
                var event;

                list.sort();
                expect(emit.firstCall).to.have.been.calledWith("sort");
                event = emit.firstCall.args[1];
                expect(event).to.eql({
                    type: "sort",
                    target: list,
                    sortType: "sort"
                });
            });

        });

        describe(".at()", function () {
            var arr;

            beforeEach(function () {
                arr = list.toArray();
                arr.push(1, 2, 3);
            });

            it("should behave like retrieving the value using the brackets syntax", function () {
                expect(list.at(-1)).to.equal(arr[-1]);
                expect(list.at(0)).to.equal(arr[0]);
                expect(list.at(1)).to.equal(arr[1]);
                expect(list.at(2)).to.equal(arr[2]);
                expect(list.at(3)).to.equal(arr[3]);
            });

        });

        describe(".get()", function () {

            it("should be an alias for .at()", function () {
                expect(list.get).to.equal(list.at);
            });

        });

        describe(".set()", function () {
            var arr;

            beforeEach(function () {
                arr = list.toArray();
            });

            it("should behave like setting the value using the brackets syntax", function () {
                list.set(0, "a");
                expect(arr[0]).to.equal("a");
                list.set(1, "b");
                expect(arr[1]).to.equal("b");
                list.set(1, "c");
                expect(arr[1]).to.equal("c");
            });

            it("should emit an 'add'-event", function () {
                list.set(0, 1);
                list.set(1, 2);
                checkIfAddHasBeenEmitted();
            });

            describe("if the given index is already occupied", function () {

                it("should emit an 'remove'-event and than an 'add'-event", function () {
                    var event;

                    arr.push(1);
                    list.set(0, "a");

                    expect(emit).to.have.been.calledTwice;

                    expect(emit.firstCall).to.have.been.calledWith("remove");
                    event = emit.firstCall.args[1];
                    expect(event).to.eql({
                        type: "remove",
                        target: list,
                        element: 1,
                        index: 0
                    });

                    expect(emit.secondCall).to.have.been.calledWith("add");
                    event = emit.secondCall.args[1];
                    expect(event).to.eql({
                        type: "add",
                        target: list,
                        element: "a",
                        index: 0
                    });
                    expect(event.target.toArray()[event.index]).to.equal(event.element);
                });

            });

        });

        describe(".dispose()", function () {

            it("should call removeAllListeners() on the set", function () {
                var removeAllListeners;

                list.config = Object.create(list.config);
                list.config.removeAllListeners = removeAllListeners = sinon.spy();

                list.dispose();

                expect(removeAllListeners).to.have.been.calledOnce;
            });

            it("should clear the _elements reference", function () {
                list.dispose();
                expect(list._elements).to.not.be.ok;
            });

        });
        
        describe(".concat()", function () {
            
            it("should proxy to array.concat()", function () {
                var otherArr = [1, 2, 3],
                    result;

                arr = list.toArray();
                arr.concat = sinon.spy();
                result = list.concat(otherArr);

                expect(arr.concat).to.have.been.calledWith(otherArr);
                expect(arr.concat).to.have.returned(result);
            });
            
        });
        
        describe(".join()", function () {
            
            it("should proxy to array.join()", function () {
                var result;

                arr = list.toArray();
                arr.join = sinon.spy();
                result = list.join(" + ");

                expect(arr.join).to.have.been.calledWith(" + ");
                expect(arr.join).to.have.returned(result);
            });
            
        });
        
        describe(".slice()", function () {
            
            it("should proxy to array.slice()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.slice = sinon.spy();

                result = list.slice(1);
                expect(arr.slice).to.have.been.calledWith(1);
                expect(arr.slice).to.have.returned(result);

                result = list.slice(1, 2);
                expect(arr.slice).to.have.been.calledWith(1, 2);
                expect(arr.slice).to.have.returned(result);
            });
            
        });
        
        describe(".indexOf()", function () {
            
            it("should proxy to array.indexOf()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.indexOf = sinon.spy();

                result = list.indexOf(1);
                expect(arr.indexOf).to.have.been.calledWith(1);
                expect(arr.indexOf).to.have.returned(result);

                result = list.indexOf(1, 2);
                expect(arr.indexOf).to.have.been.calledWith(1, 2);
                expect(arr.indexOf).to.have.returned(result);
            });
            
        });
        
        describe(".lastIndexOf()", function () {
            
            it("should proxy to array.lastIndexOf()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.lastIndexOf = sinon.spy();

                result = list.lastIndexOf(1);
                expect(arr.lastIndexOf).to.have.been.calledWith(1);
                expect(arr.lastIndexOf).to.have.returned(result);

                result = list.lastIndexOf(1, 2);
                expect(arr.lastIndexOf).to.have.been.calledWith(1, 2);
                expect(arr.lastIndexOf).to.have.returned(result);
            });
            
        });
        
        describe(".toString()", function () {
            
            it("should proxy to array.toString()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.toString = sinon.spy();
                result = list.toString();

                expect(arr.toString).to.have.been.calledWith();
                expect(arr.toString).to.have.returned(result);
            });
            
        });
        
        describe(".forEach()", function () {

            function iterator() {}
            
            it("should proxy to array.forEach()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.forEach = sinon.spy();

                result = list.forEach(iterator);
                expect(arr.forEach).to.have.been.calledWith(iterator);
                expect(arr.forEach).to.have.returned(result);

                result = list.forEach(iterator, this);
                expect(arr.forEach).to.have.been.calledWith(iterator, this);
                expect(arr.forEach).to.have.returned(result);
            });
            
        });
        
        describe(".every()", function () {

            function iterator() {}
            
            it("should proxy to array.every()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.every = sinon.spy();

                result = list.every(iterator);
                expect(arr.every).to.have.been.calledWith(iterator);
                expect(arr.every).to.have.returned(result);

                result = list.every(iterator, this);
                expect(arr.every).to.have.been.calledWith(iterator, this);
                expect(arr.every).to.have.returned(result);
            });
            
        });
        
        describe(".some()", function () {

            function iterator() {}
            
            it("should proxy to array.some()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.some = sinon.spy();

                result = list.some(iterator);
                expect(arr.some).to.have.been.calledWith(iterator);
                expect(arr.some).to.have.returned(result);

                result = list.some(iterator, this);
                expect(arr.some).to.have.been.calledWith(iterator, this);
                expect(arr.some).to.have.returned(result);
            });
            
        });
        
        describe(".filter()", function () {

            function iterator() {}
            
            it("should proxy to array.filter()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.filter = sinon.spy();

                result = list.filter(iterator);
                expect(arr.filter).to.have.been.calledWith(iterator);
                expect(arr.filter).to.have.returned(result);

                result = list.filter(iterator, this);
                expect(arr.filter).to.have.been.calledWith(iterator, this);
                expect(arr.filter).to.have.returned(result);
            });
            
        });
        
        describe(".map()", function () {

            function iterator() {}
            
            it("should proxy to array.map()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.map = sinon.spy();

                result = list.map(iterator);
                expect(arr.map).to.have.been.calledWith(iterator);
                expect(arr.map).to.have.returned(result);

                result = list.map(iterator, this);
                expect(arr.map).to.have.been.calledWith(iterator, this);
                expect(arr.map).to.have.returned(result);
            });
            
        });
        
        describe(".reduce()", function () {

            function iterator() {}
            
            it("should proxy to array.reduce()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.reduce = sinon.spy();

                result = list.reduce(iterator);
                expect(arr.reduce).to.have.been.calledWith(iterator);
                expect(arr.reduce).to.have.returned(result);

                result = list.reduce(iterator, this);
                expect(arr.reduce).to.have.been.calledWith(iterator, this);
                expect(arr.reduce).to.have.returned(result);
            });
            
        });
        
        describe(".reduceRight()", function () {

            function iterator() {}
            
            it("should proxy to array.reduceRight()", function () {
                var result;

                arr = list.toArray();
                arr.push(1, 2, 3);
                arr.reduceRight = sinon.spy();

                result = list.reduceRight(iterator);
                expect(arr.reduceRight).to.have.been.calledWith(iterator);
                expect(arr.reduceRight).to.have.returned(result);

                result = list.reduceRight(iterator, this);
                expect(arr.reduceRight).to.have.been.calledWith(iterator, this);
                expect(arr.reduceRight).to.have.returned(result);
            });
            
        });

        function checkIfAddHasBeenEmitted() {
            var event;

            expect(emit).to.have.been.calledTwice;

            expect(emit.firstCall).to.have.been.calledWith("add");
            event = emit.firstCall.args[1];
            expect(event).to.eql({
                type: "add",
                target: list,
                element: 1,
                index: 0
            });
            expect(event.target.toArray()[event.index]).to.equal(event.element);

            expect(emit.secondCall).to.have.been.calledWith("add");
            event = emit.secondCall.args[1];
            expect(event).to.eql({
                type: "add",
                target: list,
                element: 2,
                index: 1
            });
            expect(event.target.toArray()[event.index]).to.equal(event.element);
        }

        function checkIfRemoveHasBeenEmitted(firstCall, secondCall) {
            var event;

            expect(emit).to.have.been.calledTwice;

            expect(emit.firstCall).to.have.been.calledWith("remove");
            event = emit.firstCall.args[1];
            expect(event).to.eql({
                type: "remove",
                target: list,
                element: firstCall.element,
                index: firstCall.index
            });

            expect(emit.secondCall).to.have.been.calledWith("remove");
            event = emit.secondCall.args[1];
            expect(event).to.eql({
                type: "remove",
                target: list,
                element: secondCall.element,
                index: secondCall.index
            });
        }

    });

});
 
/**
 * @imports
 */
import { expect } from 'chai';
import * as Js from '../js/index.js';

describe(`JS Processing`, function() {

    describe(`mixin()`, function() {
 
        var methodACalled = 0, methodBCalled = 0, methodCCalled = 0;
        class A {
            methodA() {
                methodACalled ++;
            }
        }
        class B {
            methodB() {
                methodBCalled ++;
            }
        }
        class Bx extends B {}
        class By extends B {}

        class C extends Js._mixin(A, B) {
            methodC(callSuper = false) {
                if (callSuper) {
                    super.methodA();
                    super.methodB();
                }
                methodCCalled ++;
            }
        }

        const _C = new C;

        it(`Should ensure own and inheritted methods are called.`, function() {
            _C.methodA();
            _C.methodB();
            _C.methodC();
            expect(methodACalled).to.be.a('number').that.equals(1);
            expect(methodBCalled).to.be.a('number').that.equals(1);
            expect(methodCCalled).to.be.a('number').that.equals(1);
        });

        it(`Should ensure all ancestor methods are called on super[methodName]().`, function() {
            _C.methodC(true);
            expect(methodACalled).to.be.a('number').that.equals(2);
            expect(methodBCalled).to.be.a('number').that.equals(2);
            expect(methodCCalled).to.be.a('number').that.equals(2);
        });

        it(`Should ensure the native instanceof syntax works.`, function() {
            expect(_C instanceof A).to.be.true;
            expect(_C instanceof B).to.be.true;
            expect(_C instanceof C).to.be.true;
            expect(_C instanceof By).to.be.false;
            expect((new Bx) instanceof By).to.be.false;
        });

    });

});
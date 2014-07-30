'use strict';

describe('ngHtml5DragDrop', function () {

    beforeEach(module('ngHtml5DragDrop'));

    describe('Directive Toggle', function () {

        beforeEach(function () {
            spyOn(angular.element.prototype, 'bind');
        });

        it('should active with true parameter', inject(function($compile, $rootScope) {
            var element = $compile('<span draggable="true"></span>')($rootScope);
            expect(element.bind.callCount).toBe(2);
            expect(element.bind.argsForCall[0][0]).toBe('dragstart');
            expect(element.bind.mostRecentCall.args[0]).toBe('dragend');
        }));

        it('should not active without a true parameter', inject(function($compile, $rootScope) {
            var element = $compile('<span draggable="false"></span>')($rootScope);
            expect(element.bind).not.toHaveBeenCalled();
        }));

    });

});
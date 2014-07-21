(function () {
    'use strict';

    if (window.jQuery && (-1 == window.jQuery.event.props.indexOf("dataTransfer"))) {
        window.jQuery.event.props.push("dataTransfer");
    }

    angular.module("ngHtml5DragDrop", [])
        .directive("draggable", ['$rootScope', function ($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    draggable: '@',
                    dragData: '=',
                    dragChannel: '@'
                },
                link: function (scope, element, attr) {
                    if (scope.draggable === "false") return;
                    debugger;

                    element.bind("dragstart", function (e) {
                        debugger;
                        var dragDataJson = angular.toJson(scope.dragData);
                        e.dataTransfer.setData('text', dragDataJson);
                        $rootScope.$broadcast("ANGULAR_DRAG_START:" + scope.dragChannel, scope.dragData);
                    });

                    element.bind("dragend", function (e) {
                        $rootScope.$broadcast("ANGULAR_DRAG_END:" + scope.dragChannel, scope.dragData);
                    });
                }
            }
        }])
        .directive("droppable", ['$rootScope', function ($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    droppable: '@',
                    dropData: '=',
                    dropChannel: '@'
                },
                link: function (scope, element, attr) {
                    if (scope.droppable === "false") return;

                    $rootScope.$on("ANGULAR_DRAG_START:" + scope.dropChannel, function (event, data) {
                        element.bind("dragover", function (e) {
                            e.preventDefault();
                        });

                        if (scope.dropData) {
                            element.bind("drop", function (e) {
                                if (e.preventDefault) e.preventDefault();
                                if (e.stopPropagation) e.stopPropagation();

                                scope.$apply(function () {
                                    scope.dropData = data
                                });
                            });
                        }
                    });

                    $rootScope.$on("ANGULAR_DRAG_END:" + scope.dropChannel, function (event, channel) {
                        element.unbind("dragover");
                        element.unbind("drop");
                    });
                }
            }
        }])
        .directive("dragEvents", ['$parse', '$rootScope', function ($parse, $rootScope) {
            return function (scope, element, attr) {
                if (!attr.droppable === "false" || attr.draggable === "false") return;
                var channel = attr.dragChannel || attr.dropChannel;
                var dragEvents = scope.$eval(attr.dragEvents) || {};

                $rootScope.$on("ANGULAR_DRAG_START:" + attr.dropChannel, function (event, data) {
                    for (var eventName in dragEvents) {
                        element.bind(eventName, function (e) {
                            if (e.preventDefault) e.preventDefault();
                            if (e.stopPropagation) e.stopPropagation();

                            var fn = $parse(dragEvents[eventName]);
                            scope.$apply(function () {
                                fn(scope, { $data: data, $event: e });
                            });
                        });
                    }
                });

                $rootScope.$on("ANGULAR_DRAG_END:" + attr.dropChannel, function (event) {
                    for (var eventName in dragEvents) {
                        element.unbind(eventName);
                    }
                });
            }
        }])
        .directive("dragSuccess", ['$parse', function ($parse) {
            return function (scope, element, attr) {
                if (attr.draggable === "false") return;

                element.bind("dragend", function (e) {
                    if (e.preventDefault) e.preventDefault();
                    if (e.stopPropagation) e.stopPropagation();

                    if (e.dataTransfer && e.dataTransfer.dropEffect !== "none") {
                        var fn = $parse(attr.dragSuccess);
                        scope.$apply(function () {
                            fn(scope, { $event: e });
                        });
                    }
                });
            }
        }]);

})();

/// <reference path="../common/models.ts" />
/// <reference path="../common/messaging.ts" />
/// <amd-dependency path="ui.bootstrap"/>
/// <reference path="shared_directives.ts"/>
///<reference path="pair.ts"/>

import angular = require("angular");
import Models = require("../common/models");
import io = require("socket.io-client");
import moment = require("moment");
import Messaging = require("../common/messaging");
import Pair = require("./pair");
import Shared = require("./shared_directives");

interface PositionScope extends ng.IScope {
    baseCurrency : string;
    basePosition : number;
    quoteCurrency : string;
    quotePosition : number;
    baseHeldPosition : number;
    quoteHeldPosition : number;
    value : number;
    quoteValue : number;
}

var PositionController = ($scope : PositionScope, $log : ng.ILogService, subscriberFactory : Shared.SubscriberFactory) => {
    var clearPosition = () => {
        $scope.baseCurrency = null;
        $scope.quoteCurrency = null;
        $scope.basePosition = null;
        $scope.quotePosition = null;
        $scope.baseHeldPosition = null;
        $scope.quoteHeldPosition = null;
        $scope.value = null;
        $scope.quoteValue = null;
    };

    var updatePosition = (position : Models.PositionReport) => {
        $scope.baseCurrency = Models.Currency[position.pair.base];
        $scope.quoteCurrency = Models.Currency[position.pair.quote];
        $scope.basePosition = position.baseAmount;
        $scope.quotePosition = position.quoteAmount;
        $scope.baseHeldPosition = position.baseHeldAmount;
        $scope.quoteHeldPosition = position.quoteHeldAmount;
        $scope.value = position.value;
        $scope.quoteValue = position.quoteValue;
    };

    var positionSubscriber = subscriberFactory.getSubscriber($scope, Messaging.Topics.Position)
        .registerDisconnectedHandler(clearPosition)
        .registerSubscriber(updatePosition, us => us.forEach(updatePosition));

    $scope.$on('$destroy', () => {
        positionSubscriber.disconnect();
        $log.info("destroy position grid");
    });

    $log.info("started position grid");
};

export var positionDirective = "positionDirective";

angular
    .module(positionDirective, ['ui.bootstrap', 'sharedDirectives'])
    .directive("positionGrid", () => {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            templateUrl: "positions.html",
            controller: PositionController,
            scope: {
              exch: '='
            }
          }
    });

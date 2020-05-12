var app = angular.module('myApp', ['ngSanitize']);

// Change Underscore templating from ERB to Mustache style
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// Change Angular templating from {{var}} to {[var]} to avoid conflict
app.config(['$interpolateProvider', '$httpProvider',
            function($interpolateProvider, $httpProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);

app.controller('myCtrl', function($scope, $http, $sce, $q) {
	var $ = angular.element;

	$scope.currPage = null;

	/* Load views */

	$scope.loadPageView = function(pageId) {
		if (pageId==null) {
			$scope.currPage = null;
		} else {
			$scope.currPage = $scope.pages[pageId];
		}
	    // Update navbar select style
	    _.each($scope.pages, function(page) {
	      page.isSelected = (pageId == page.id);
	    });
	};

	$scope.toTrustedHTML = function(html) {
    return $sce.trustAsHtml(html);
	}

	/* Load JSON */
	$scope.loadJsonInScope = function(jsonUrl, scopeVar, callback) {
			var deferred = $q.defer();
	    $http({
	      method: 'GET',
	      url: jsonUrl,
	    }).then(function successCallback(response) {
	      $scope[scopeVar] = response.data;
	      if (callback && _.isFunction(callback)) { callback(); }
				deferred.resolve();
	    }, function errorCallback(response) {
				deferred.reject('Unable to fetch ' + jsonUrl);
	    });
			return deferred.promise;
	};

	$scope.getPageIdFromUrl = function() {
		return _.keys(window.urlparams.getUrlParams())[0];
	};

	/* Load page data */
	function loadPageData() {
		return $scope.loadJsonInScope('assets/groups.json', 'pages', function() {
			// display order
			$scope.orderedPageIds = _.pluck($scope.pages.pages, 'id');
			// hash lookup
			$scope.pages = _.object(_.map($scope.pages.pages, function(page) {
				return [page.id, page];
			}));
  	}).then(function() {
	  	return $scope.loadJsonInScope('assets/resources.json', 'resources');
		});
	}
	/* On completion, set up page */
	loadPageData().then(function() {
		console.log('Successfully loaded page data');
		// Load page id corresponding to current url hash, if relevant
		var urlPageId = $scope.getPageIdFromUrl();
		if (urlPageId === undefined) {
			// index. skip
		} else if (_.contains($scope.orderedPageIds, urlPageId)) {
			$scope.loadPageView(urlPageId);
		} else {
			console.error('page ' + urlPageId + ' does not exist, showing index')
		}
	}, function() {
		alert('Could not load page. Please try refreshing.');
	});

});

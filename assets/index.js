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
	$scope.getOrderedPages = function() {
		return _.map($scope.orderedPageIds, function(pid) {
			return $scope.pages[pid];
		});
	};

	/* Load views */

	var scrollToTop = function() {
		$('html, body').animate({
		    scrollTop: ($('body').offset().top)
		}, 200);
	};

	$scope.loadPageView = function(pageId) {
		if (pageId == null) {
			$scope.currPage = null;
		} else {
			$scope.currPage = $scope.pages[pageId];
			$scope.currPage.getResources = function() {
				return _.map($scope.currPage.items, function(itemId) {
					return $scope.resources[itemId];
				});
			};
		}
	    // Update navbar select style
	    _.each($scope.pages, function(page) {
	    	$scope.pages[page.id].isSelected = (pageId == page.id);
	    });
	    // If in responsive mode, close nav
	    $scope.isResponsiveNavOpen = false;
	    // Scroll to top
	    scrollToTop();
	};

	$scope.toTrustedHTML = function(html) {
    	return $sce.trustAsHtml(html);
	}

	$scope.itemIconClasses = {
		'book': 'fa-book',
		'instagram': 'fa-instagram',
		'app': 'fa-mobile',
		'talk': 'fa-user-circle',
		'audio': 'fa-podcast',
		'info': 'fa-info-circle',
		'tip': 'fa-lightbulb-o',
		'video': 'fa-video-camera',
		'article': 'fa-file-text-o',
	};
	$scope.getItemIconClasses = function(itemType) {
		return $scope.itemIconClasses[itemType] || '';
	}

	/* Toggle nav */
	$scope.isResponsiveNavOpen = false;
	$scope.toggleResponsiveNav = function() {
		console.log("toggle")
		$scope.isResponsiveNavOpen = !$scope.isResponsiveNavOpen;
	};

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
	  		return $scope.loadJsonInScope(
	  			'assets/resources.json', 'resources');
		});
	}

	function setup() {
		loadPageData().then(function() {
			console.log('Successfully loaded page data');
			// Load page id corresponding to current url hash, if relevant
			var urlPageId = $scope.getPageIdFromUrl();
			if (urlPageId === undefined) {
				// index. skip
			} else if (_.contains($scope.orderedPageIds, urlPageId)) {
				$scope.loadPageView(urlPageId);
			} else {
				console.error(
					'page ' + urlPageId + ' does not exist, showing index');
			}
		}, function() {
			alert('Could not load page. Please try refreshing.');
		});
	}
	setup();

});

// Bind html & also angular compile the bound contents
// Modified from: incuna/angular-bind-html-compile
app.directive('bindHtmlCompile', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return scope.$eval(attrs.bindHtmlCompile);
            }, function (value) {
                // In case value is a TrustedValueHolderType, sometimes it
                // needs to be explicitly called into a string in order to
                // get the HTML string.
                element.html(value && value.toString());
                // If scope is provided use it, otherwise use parent scope
                var compileScope = scope;
                if (attrs.bindHtmlScope) {
                    compileScope = scope.$eval(attrs.bindHtmlScope);
                }
                $compile(element.contents())(compileScope);
            });
        }
    };
}]);


/* Inline hyperlink to a defined resource
   Usage: <a resource-link resource-id="some-id"></a>
*/ 
app.directive('resourceLink', function() {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			'resourceId': '@', // required
		},
		template: (
			'<a href="{[resource.href]}" ' +
			'   bind-html-compile="displayTitle" ' +
			'   ></a>'
		),
		link: function(scope, element, attributes) {
			// Grab resource object from parent scope
			scope.resource = scope.$parent.resources[scope.resourceId];

			scope.displayTitle = (
				scope.resource.shortTitle || scope.resource.title);
		},
	};
});


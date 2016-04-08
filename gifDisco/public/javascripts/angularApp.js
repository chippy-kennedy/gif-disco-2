
//dependencies
var app = angular.module('gifDisco', ['ui.router']);// - ui-router instead of ngRoute 

//app configuration + routing
app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
			//resolve - ensure all gifs are loaded before page is displayed
			resolve: {
				gifPromise: ['gifs', function(gifs){
					return gifs.getAll();
				}]
			}
    });

	$stateProvider
		.state('gifs', {
			url: '/gifs/{id}',
			templateUrl: '/gifs.html',
			controller: 'GifsCtrl'
		});

  $urlRouterProvider.otherwise('home');
}]);

//Angular Services
	app.factory('gifs', ['$http', function($http){
		var o = {
			gifs: []
		};
		
		//getAll() - return all gifs
 		o.getAll = function() {
			return $http.get('/gifs').success(function(data){
				angular.copy(data, o.gifs);
			});
		};

		//create() - new gif added
		o.create = function(gif) {
			return $http.post('/gifs', gif).success(function(data){
				o.gifs.push(data);
			});
		};

		//increment upvote()
		o.upvote = function(gif) {
			return $http.put('/gifs/' + gif._id + '/upvote')
				.success(function(data){
					gif.upvotes += 1;
				});
		};

		return o;
	}]);


//Main Controller
	app.controller('MainCtrl', ['$scope', 'gifs',
		function($scope, gifs){
			
			//set scope test
			$scope.test = 'Hello world!';
			
			//
			$scope.gifs = gifs.gifs;
			
			$scope.addGif = function(){
				if(!$scope.title || $scope.title == '') {return;}
				gifs.create({
					title: $scope.title,
					link: $scope.link,
				});
				$scope.title = '';
				$scope.link = '';
			};

			$scope.incrementUpvotes = function(gif) {
				gifs.upvote(gif);
			};

	}]);

//Gif Controller
app.controller('GifsCtrl', ['$scope','$stateParams','gifs',
	function($scope, $stateParams, gifs){
		$scope.gif = gifs.gifs[$stateParams.id];

    // Add comment.
    $scope.addComment = function(){
      if($scope.body === '') { return; }
      $scope.gif.comments.push({
        body: $scope.body,
        author: 'user',
        upvotes: 0
      });
      $scope.body = '';
    };



}]);






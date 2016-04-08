
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
      controller: 'MainCtrl'
    });

	$stateProvider
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl'
		});

  $urlRouterProvider.otherwise('home');
}]);

//Angular Services
	app.factory('posts', [function(){
		var o = {
			posts: []
		};
		return o;
	}]);

//Main Controller
	app.controller('MainCtrl', ['$scope', 'posts',
		function($scope, posts){
			
			//set scope test
			$scope.test = 'Hello world!';
			
			//
			$scope.posts = posts.posts;
			
			$scope.addPost = function(){
				$scope.posts.push({
					title: $scope.title,
					link: $scope.link,
					upvotes: 0,
					//faked data
					comments: [
							{author: 'Joe', body: 'Cool post!', upvotes: 0},
							{author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
						]
				});
				$scope.title = '';
				$scope.link = '';
			};

			$scope.incrementUpvotes = function(post) {
				post.upvotes += 1;
			};

	}]);

//Gif Controller
app.controller('PostsCtrl', ['$scope','$stateParams','posts',
	function($scope, $stateParams, posts){
		$scope.post = posts.posts[$stateParams.id];





}]);






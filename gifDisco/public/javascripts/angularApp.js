
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
	$stateProvider.state('login', {
		url: '/login',
		templateUrl: '/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	});
	$stateProvider.state('register', {
		url: '/register',
		templateUrl: '/register.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home');
			}
		}]
	});

  $urlRouterProvider.otherwise('home');
}]);

//Angular Services
	//GIFS FACTORY
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

	//AUTH FACTORY
	//TODO:is this ok not being async?
	//Lots of help on the factory from Passport & (https://thinkster.io/mean-stack-tutorial#wiring-everything-up)
	app.factory('auth', ['$http', '$window', function($http, $window){
		 var auth = {};

			auth.saveToken = function (token){
				$window.localStorage['gifDisco-token'] = token;
			};

			auth.getToken = function (){
				return $window.localStorage['gifDisco-token'];
			}

			auth.isLoggedIn = function(){
				var token = auth.getToken();

				if(token){
					var payload = JSON.parse($window.atob(token.split('.')[1]));

					return payload.exp > Date.now() / 1000;
				} else {
					return false;
				}
			};

			auth.currentUser = function(){
				if(auth.isLoggedIn()){
					var token = auth.getToken();
					var payload = JSON.parse($window.atob(token.split('.')[1]));

					return payload.username;
				}
			};

			auth.logIn = function(user){
				return $http.post('/login', user).success(function(data){
					auth.saveToken(data.token);
				});
			};

			auth.register = function(user){
				return $http.post('/register', user).success(function(data){
					auth.saveToken(data.token);
				});
			};

			auth.logOut = function(){
				$window.localStorage.removeItem('flapper-news-token');
			};

		return auth;
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


//Auth Controller
app.controller('AuthCtrl', ['$scope','$state','auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])

//Navigation Controller
app.controller('NavCtrl', ['$scope','auth',
	function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
}]);




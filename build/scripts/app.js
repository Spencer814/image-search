'use strict';

// Storing Angular module in a variable with ngRoute dependency
var app = angular.module('ImageApp', ['ngRoute']);

// Configuartion for route and location providers
app.config(['$routeProvider', function($routeProvider) {

  // Configures route for the main page
  $routeProvider.when('/gif', {
    templateUrl: 'views/gif.html'
  })

  .when('/image', {
    templateUrl: 'views/image.html'
  })

  .when('/video', {
    templateUrl: 'views/video.html'
  })

  // Redirect to main page if no other route is available
  .otherwise({
    redirectTo: '/gif'
  });
}]);

// Controller that invokes the scope and http objects
app.controller('ImageCtrl', function($scope, $http) {

  // Title and default search values
  $scope.appName = 'Image Search';
  $scope.searchTerm = 'pugs';

  // Submit function searches Giphy API for searchTerm input
  $scope.submit = function() {

    // $http makes request to server at the url and uses get method to return a response
    $http({
      url: 'https://api.giphy.com/v1/gifs/search?q=' + $scope.searchTerm + '&api_key=dc6zaTOxFJmzC',
      method: 'GET'
    })

    // Results retrieved from API data
    .success(function(response) {

      // Go through response.data, format the object, and store it into a new array in $scope.results
      $scope.results = response.data.map(function(value) {
        return {
          'gif': value.images.original.url,
          'url': value.url,
          'bitly': value.bitly_url
        }
      });
    })

    // Handles errors and displays status code
    .error(function(data) {
      $scope.data = response.data || 'Request failed';
      $scope.status = response.meta.status;
      console.log('Error: ' + $scope.status);
    });
    $scope.getPhotos();
  };

  $scope.getPhotos = function(){
    var url = 'https://api.flickr.com/services/rest';
    var params = {
      method: 'flickr.photos.search',
      api_key: '03f566bb6d192c19c91ade74612807c4',
      tags: $scope.searchTerm,
      format: 'json',
      nojsoncallback: 1
    };
    $http({
      method: 'GET',
      url: url,
      params: params
    })
    .then(function(response){
      $scope.pictures = response.data.photos.photo,

      $scope.image = 'https://farm' + $scope.pictures[0].farm + '.staticflickr.com/' + $scope.pictures[0].server + '/' + $scope.pictures[0].id + '_' + $scope.pictures[0].secret + '.jpg';
    },
    function(response){
      alert('error');
    });
  };

  // Controls for slideshow, set by assigning index value based on number of results
  $scope.currentIndex = 0;
  $scope.setCurrentSlideIndex = function(index) {
    $scope.currentIndex = index;
  };
  $scope.isCurrentSlideIndex = function(index) {
    return $scope.currentIndex === index;
  };
  $scope.prevSlide = function () {
    $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.results.length - 1;
  };
  $scope.nextSlide = function () {
    $scope.currentIndex = ($scope.currentIndex < $scope.results.length - 1) ? ++$scope.currentIndex : 0;
  };

  // Controls for slideshow, set by assigning index value based on number of results
  $scope.currentImage = 0;
  $scope.setCurrentImage = function(image) {
    $scope.currentImage = image;
  };
  $scope.isCurrentImage = function(image) {
    return $scope.currentImage === image;
  };
  $scope.prevImage = function () {
    $scope.currentImage = ($scope.currentImage > 0) ? --$scope.currentImage : $scope.pictures.length - 1;
  };
  $scope.nextImage = function () {
    $scope.currentImage = ($scope.currentImage < $scope.pictures.length - 1) ? ++$scope.currentImage : 0;
  };

  // Runs submit function for default searchTerm when page loads
  $scope.submit();
});

'use strict';
// /*jshint esversion: 6, node: true */

// Storing Angular module in a variable with ngRoute dependency
var app = angular.module('ImageApp', ['ngRoute']);

// Configuartion for route and location providers
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

  // Configures route for the main page
  $routeProvider.when('/gif', {
    templateUrl: 'views/gif.html',
    title: 'Gif Search',
    header: 'Giphy'
  })

  .when('/image', {
    templateUrl: 'views/image.html',
    title: 'Image Search',
    header: 'Flickr'
  })

  .when('/video', {
    templateUrl: 'views/video.html',
    title: 'Video Search',
    header: 'YouTube'
  })

  // Redirect to main page if no other route is available
  .otherwise({
    redirectTo: '/gif'
  });

  // Removing # from url
  $locationProvider.html5Mode(true).hashPrefix('!');
}]);

// Controller that invokes the scope and http objects
app.controller('ImageCtrl', function ($scope, $http, $log, $sce) {

  // Title and default search values
  $scope.searchTerm = 'pugs';

  $scope.$on('$routeChangeSuccess', function (event, current) {
    $scope.appName = current.title;
    $scope.appSite = current.header;
  });

  $scope.submit = function () {
    $scope.getGifs();
    $scope.getPhotos();
    $scope.getVideos();
  };

  // Submit function searches Giphy API for searchTerm input
  $scope.getGifs = function () {
    // $http makes request to server at the url and uses get method to return a response
    $http({
      url: 'https://api.giphy.com/v1/gifs/search?q=' + $scope.searchTerm + '&api_key=dc6zaTOxFJmzC',
      method: 'GET'
    })

    // Results retrieved from API data
    .success(function (response) {
      // Go through response.data, format the object, and store it into a new array in $scope.results
      $scope.results = response.data.map(function (value) {
        return {
          'gif': value.images.original.url,
          'url': value.url,
          'bitly': value.bitly_url
        };
      });
    })

    // Handles errors and displays status code
    .error(function (response) {
      $scope.data = response.data || 'Request failed';
      $scope.status = response.meta.status;
      $log.info('Error: ' + $scope.status);
    });
  };

  // Controls for slideshow, set by assigning index value based on number of results
  $scope.currentIndex = 0;
  $scope.setCurrentSlideIndex = function (index) {
    $scope.currentIndex = index;
  };
  $scope.isCurrentSlideIndex = function (index) {
    return $scope.currentIndex === index;
  };
  $scope.prevSlide = function () {
    $scope.currentIndex = ($scope.currentIndex < $scope.results.length - 1) ? ++$scope.currentIndex : 0;
  };
  $scope.nextSlide = function () {
    $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.results.length - 1;
  };

  $scope.getPhotos = function () {
    var url = 'https://api.flickr.com/services/rest',
        params = {
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
    .then(function (response){
      $scope.pictures = response.data.photos.photo;

      for (var i = response.data.photos.photo.length - 1; i >= 0; i--) {
        $scope.image = 'https://farm' + $scope.pictures[i].farm + '.staticflickr.com/' + $scope.pictures[i].server + '/' + $scope.pictures[i].id + '_' + $scope.pictures[i].secret + '.jpg';
      }
      $log.info($scope.image);
    },
    function (response){
      $scope.data = response.data || 'Request failed';
      $scope.status = response.meta.status;
      $log.info('Error: ' + $scope.status);
    });
  };

  // Controls for slideshow, set by assigning index value based on number of results
  $scope.currentImage = 0;
  $scope.setCurrentImage = function (image) {
    $scope.currentImage = image;
  };
  $scope.isCurrentImage = function (image) {
    return $scope.currentImage === image;
  };
  $scope.prevImage = function () {
    $scope.currentImage = ($scope.currentImage > 0) ? --$scope.currentImage : $scope.pictures.length - 1;
  };
  $scope.nextImage = function () {
    $scope.currentImage = ($scope.currentImage < $scope.pictures.length - 1) ? ++$scope.currentImage : 0;
  };

  $scope.getVideos = function () {
		$http.get('https://www.googleapis.com/youtube/v3/search', {
			params: {
				key: 'AIzaSyCSCx9g1gbpd9A8QT8dSi4ZeQu8juacFP8',
				type: 'video',
				maxResults: '50',
				part: 'id,snippet',
				fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/high,items/snippet/channelTitle',
				q: $scope.searchTerm
			}
		})
		.success(function (data) {
      $scope.clips = data;

			for (var i = data.items.length - 1; i >= 0; i--) {
        $scope.title = $scope.clips.items[i].snippet.title;
        $scope.id = $scope.clips.items[i].id.videoId;
        $scope.content = 'https://www.youtube.com/watch?v=' + $scope.id;
        $scope.embed = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + $scope.id);
        $scope.img = $scope.clips.items[i].snippet.thumbnails.high.url;
        // $log.info(VideosService.listResults(data.items));
        // $log.info($scope.clips.items[i].id.videoId);
        $log.info($scope.content);
        $log.info($scope.embed);
      }
      $log.info($scope.clips.items);
		})
		.error(function (response) {
      $scope.data = response.data || 'Request failed';
      $scope.status = response.meta.status;
      $log.info('Error: ' + $scope.status);
		});
	};

  // Controls for slideshow, set by assigning index value based on number of results
  $scope.currentVideo = 0;
  $scope.setCurrentVideo = function (embed) {
    $scope.currentVideo = embed;
  };
  $scope.isCurrentVideo = function (embed) {
    return $scope.currentVideo === embed;
  };
  $scope.prevVideo = function () {
    $scope.currentVideo = ($scope.currentVideo > 0) ? --$scope.currentVideo : $scope.clips.items.length - 1;
  };
  $scope.nextVideo = function () {
    $scope.currentVideo = ($scope.currentVideo < $scope.clips.items.length - 1) ? ++$scope.currentVideo : 0;
  };

  // Runs submit function for default searchTerm when page loads
  $scope.submit();
});

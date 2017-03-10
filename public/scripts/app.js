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
      $log.info($scope.results);
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
      $scope.pictures = response.data.photos.photo.map(function (picture) {
        var base58 = (function(alpha) {
          var alphabet = alpha || '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
          base = alphabet.length;
          return {
            encode: function(enc) {
              if(typeof enc!=='number' || enc !== parseInt(enc)) throw '"encode" only accepts integers.';
              var encoded = '';
              while(enc) {
                var remainder = enc % base;
                enc = Math.floor(enc / base);
                encoded = alphabet[remainder].toString() + encoded;
              }
              return encoded;
            },
          };
        })();
        return {
          'image': 'https://farm' + picture.farm + '.staticflickr.com/' + picture.server + '/' + picture.id + '_' + picture.secret + '.jpg',
          'source': 'https://www.flickr.com/photos/' + picture.owner + '/' + picture.id,
          'title': picture.title,
          'url': 'https://flic.kr/p/' + base58.encode(parseInt(picture.id))
        };
      });
      $log.info($scope.pictures);
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

    var url = 'https://www.googleapis.com/youtube/v3/search',
        params = {
          key: 'AIzaSyCSCx9g1gbpd9A8QT8dSi4ZeQu8juacFP8',
  				type: 'video',
          order: 'viewCount',
  				maxResults: '10',
  				part: 'id,snippet',
  				fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/high,items/snippet/channelTitle',
  				q: $scope.searchTerm
        };

    $http({
      method: 'GET',
      url: url,
      params: params
    })

		.success(function (data) {
      $scope.clips = data.items.map(function (items) {
        return {
          'content': 'https://www.youtube.com/watch?v=' + items.id.videoId,
          'embed': $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + items.id.videoId),
          'id': items.id.videoId,
          'img': items.snippet.thumbnails.high.url,
          'title': items.snippet.title
        };
      });

      $log.info($scope.clips);
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
    $scope.currentVideo = ($scope.currentVideo > 0) ? --$scope.currentVideo : $scope.clips.length - 1;
  };
  $scope.nextVideo = function () {
    $scope.currentVideo = ($scope.currentVideo < $scope.clips.length - 1) ? ++$scope.currentVideo : 0;
  };

  // Runs submit function for default searchTerm when page loads
  $scope.submit();
});

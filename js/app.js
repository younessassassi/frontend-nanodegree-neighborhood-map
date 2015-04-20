var map;

var initialPlaces = [
	{
		name: 'National Monument',
		address: '2 15th St NW Washington, DC 20007',
		latitude: '38.8895',
		longitude: '-77.0352'
	},
	{
		name: 'The White House',
		address: '1600 Pennsylvania Ave NW Washington, DC 20500',
		latitude: '38.8977',
		longitude: '-77.0366'
	},
	{
		name: 'United States Congress',
		address: '200 D St SW Washington, DC 20024',
		latitude: '38.8897',
		longitude: '-77.0089'
	}
];

var Place = function(data) {
	this.name = ko.observable(data.name);
	this.address = ko.observable(data.address);
	this.latitude = ko.observable(data.latitude);
	this.longitude = ko.observable(data.longitude);
	this.marker = '';
	this.showListItem = ko.observable(true); // list  item initially visible

	this.hidePlaceMarker = function() {
		this.marker.setVisible(false);
	}

	this.showPlaceMarker = function() {
		this.marker.setVisible(true);
	}

	this.bouncePlaceMarker = function() {
		this.marker.setAnimation(google.maps.Animation.BOUNCE);
		var _this = this;
		setTimeout(function(){
			_this.marker.setAnimation(null);
		}, 1400);
	}

	this.activateMarker = function() {
		this.bouncePlaceMarker();
		this.getNewYorkTimesData();
		this.getWikipediaData();
	}

	var $wikiElem = $('#wikipediaArticles');
    var $nytElem = $('#nytimesArticles');
    var $nytHeaderElem = $('#nyTimes-header');

	this.getNewYorkTimesData = function() {
		var nytimesAPIKey = 'e1d4a459b4b1f9239fd618037ddf86df:11:61795967';
	    var nyTimesURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + this.name() + '&sort=newest&api-key=' + nytimesAPIKey;
	    $.getJSON(nyTimesURL, function(data) {
	        var articles = data.response.docs;
	        for (var i = 0; i < articles.length; i++) {
	            var article = articles[i];
	            $nytElem.append('<li class="article">' +
	            '<a href="'+ article.web_url + '">' + article.headline.main +'</a>' +
	            '<p>' + article.snippet + '</p>' +
	            '</li>');
	        }
	    }).error(function(e){
	        $nytHeaderElem.text('New York Times Articles could not be loaded');
	    });
	}

	this.getWikipediaData = function() {
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name() +
	    '&format=json&callback=wikiCallback';
	    var wikiRequestTimeout = setTimeout(function(){
	        $wikiElem.text("Failed to get wikipedia resources");
	    }, 8000)

	    $.ajax({
	        url: wikiURL,
	        dataType: "jsonp",
	        success: function( response ) {
	            var articleList = response[1];
	            for (var i = 0; i < articleList.length; i++) {
	                articleStr = articleList[i];
	                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
	                $wikiElem.append('<li><a href="' + url + '">' +
	                    articleStr + '</a></li>');
	            }
	            clearTimeout(wikiRequestTimeout);
	        }
	    });
	}

}

var ViewModel = function() {
	var self = this;
	self.places = ko.observableArray([]);
	var infowindow = null;

	// initilize the list of places
	initialPlaces.forEach(function(placeItem){
		self.places.push(new Place(placeItem));
	});

	// map binding
	ko.bindingHandlers.map = {
	    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
	    	var bounds = new google.maps.LatLngBounds();
		    var options = {
			        mapTypeId: 'roadmap',
			        disableDefaultUI: true
			};
			infowindow = new google.maps.InfoWindow();

			// display the map on the page
			self.map = new google.maps.Map($('#map')[0], options);
			self.map.setTilt(45);

			// display the markers
			// loop through the array of places and place each one on the map
			for (var placeItem in self.places()) {
				var position = new google.maps.LatLng(self.places()[placeItem].latitude(), self.places()[placeItem].longitude());
				bounds.extend(position);
				marker = new google.maps.Marker({
					position: position,
					map: self.map,
					title: self.places()[placeItem].name()
				});

				// display the info window when marker is clicked
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.setContent(this.title);
					infowindow.open(self.map, this);
				});
				self.places()[placeItem].marker = marker;
			}

			// automatically center the map to fit all the markers on the screen
			self.map.fitBounds(bounds);

			// override the map zoom level once the fitBounds is run
			var boundsListener = google.maps.event.addListener((self.map), 'bounds_changed', function(event) {
		        this.setZoom(13);
		        google.maps.event.removeListener(boundsListener);
		    });
	    }
	};

	// filter list of places when typing in the search box
	$("#search-term").on("keyup", function() {
	    var term = $(this).val().toLowerCase();
	    infowindow.close();
	    $.each(self.places(), function(index, placeItem) {
	    	var value = placeItem.name().toLowerCase();
	    	if (value.indexOf(term) === -1) {
	    		placeItem.hidePlaceMarker();
	    		placeItem.showListItem(false);
	    	} else {
	    		placeItem.showPlaceMarker();
	    		placeItem.showListItem(true);
	    	}
	    });
	});

	//$('#search-term').submit(self.getNewYorkTimesData());
}

var viewModel = new ViewModel();

$(document).ready(function () {
   ko.applyBindings(viewModel);
});



var map;
var infowindow = null;
var selectFromListMessage = 'Please select one location';
var noMatchFoundMessage = 'No match was found.  Please try a different term';
var nytFailure = 'I failed to retrieve new york times articles, please try again later';
var wikipediaFailure = 'I failed to retrieve wikipedia articles, please try again later';

var $wikiElem = $('#wikipediaArticles');
var $nytElem = $('#nytimesArticles');

var initialPlaces = [
	{
		name: 'Washington Monument',
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
		name: 'United States Capitol',
		address: '200 D St SW Washington, DC 20024',
		latitude: '38.8897',
		longitude: '-77.0089'
	},
	{
		name: 'Smithsonian National Air and Space Museum',
		address: '600 Independence Ave SW Washington, DC 20560',
		latitude: '38.88816',
		longitude: '-77.019868'
	},
	{
		name: 'National Museum of the American Indian',
		address: '4th St & Independence Ave SW Washington, DC 20560',
		latitude: '38.888207',
		longitude: '-77.016522'
	},
	{
		name: 'Smithsonian National Museum of Natural History',
		address: '10th St. & Constitution Ave. NW Washington, DC 20560',
		latitude: '38.8910964',
		longitude: '-77.0249119'
	}
];

var Place = function(data) {
	this.name = ko.observable(data.name);
	this.address = ko.observable(data.address);
	this.latitude = ko.observable(data.latitude);
	this.longitude = ko.observable(data.longitude);
	this.marker = '';
	this.showListItem = ko.observable(true); // list  item initially visible
	this.isSelected = ko.observable(false); // true when list item is selected

	this.nytArticles = ko.observableArray([]);
	this.wikipediaArticles = ko.observableArray([]);

	// update selection status of list items
	this.changeSelectionStatus = function(isSelected) {
		this.isSelected(isSelected);
	}

	// update map place marker visibility
	this.changePlaceMarkerVisibility = function(isVisible) {
		this.marker.setVisible(isVisible);
	}

	// bounce place marker on map when corresponding object is selected
	this.bouncePlaceMarker = function() {
		this.marker.setAnimation(google.maps.Animation.BOUNCE);
		var _this = this;
		setTimeout(function(){
			_this.marker.setAnimation(null);
		}, 1400);
	}

	// activate selected object by bouncing the marker and retrieving correspoding data from the webservice
	this.activateMarker = function() {
		this.isSelected(true);
		this.bouncePlaceMarker();
		this.getNewYorkTimesData();
		this.getWikipediaData();
		this.marker.map.setCenter(this.marker.getPosition());
		infowindow.setContent(this.name());
		infowindow.open(this.marker.map, this.marker);
	}

	// retrieve New York Times articles
	this.getNewYorkTimesData = function() {
		var nytimesAPIKey = 'e1d4a459b4b1f9239fd618037ddf86df:11:61795967';
	    var nyTimesURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + this.name() + '&sort=newest&api-key=' + nytimesAPIKey;

	     var nytRequestTimeout = setTimeout(function() {
	        $nytElem.text("Failed to get New York Times resources");
	    }, 4000);

	    $.ajax({
	    	url: nyTimesURL,
	    	dataType: "json",
	    	success: function(data) {
	    		var articles = data.response.docs;
		        var maxLength = (articles.length <= 3 ? articles.length : 3);
		        for (var i = 0; i < maxLength; i++) {
		            var article = articles[i];
		            $nytElem.append('<li class="article">' +
		            '<a href="'+ article.web_url + '">' + article.headline.main +'</a>' +
		            '<p>' + article.snippet + '</p>' +
		            '</li>');
		        }
	    		clearTimeout(nytRequestTimeout);
	    	},
	    	error: function() {
	    		$nytElem.text("Failed to get New York Times resources");
	    	}
	    });
	}

	// retrieve wikipedia articles
	this.getWikipediaData = function() {
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name() +
	    '&format=json&callback=wikiCallback';
	    var wikiRequestTimeout = setTimeout(function() {
	        $wikiElem.text("Failed to get wikipedia resources");
	    }, 4000);

	    $.ajax({
	        url: wikiURL,
	        dataType: "jsonp",
	        success: function(response) {
	            var articleList = response[1];
	            var maxLength = (articleList.length <= 3 ? articleList.length : 3);
	            for (var i = 0; i < maxLength; i++) {
	                articleStr = articleList[i];
	                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
	                $wikiElem.append('<li><a href="' + url + '">' +
	                    articleStr + '</a></li>');
	            }
	            clearTimeout(wikiRequestTimeout);
	        },
	        error: function() {
	        	$wikiElem.text("Failed to get wikipedia resources");
	        }
	    });
	}

}

var ViewModel = function() {
	var self = this;
	self.places = ko.observableArray([]);

	self.isDataWindowOpen = ko.observable(false);
	self.searchTerm = ko.observable();
	self.statusMessage = ko.observable();

	// initilize the list of places
	initialPlaces.forEach(function(placeItem){
		self.places.push(new Place(placeItem));
	});

	// sort the places array of objects
	var compare = function(a, b) {
		if (a.name() < b.name()) {
			return -1;
		}
		if (a.name() > b.name()) {
			return 1;
		}
		return 0;
	}

	self.places().sort(compare);

	// open or close the bottom data window
	self.changeDataWindowVisibility = function(isOpen) {
		$wikiElem.empty();
		$nytElem.empty();
		self.statusMessage("");
		self.isDataWindowOpen(isOpen);
	}

	// remove search result list item selection
	self.removeSelections = function() {
		for (var placeItem in self.places()) {
			self.places()[placeItem].changeSelectionStatus(false);
		}
	}

	// update value of the search box when new row is selected
	self.updateSearchTerm = function() {
		for (var placeItem in self.places()) {
			if (self.places()[placeItem].isSelected()) {
				self.searchTerm(self.places()[placeItem].name());
			}
		}
	}

	// update screen when search button is clicked
	self.search = function() {
		var term = self.searchTerm().toLowerCase();
		var placeIndex = null;
		var possibleMatchesFound = 0;
		$.each(self.places(), function(index, placeItem) {
	    	var value = placeItem.name().toLowerCase();
	    	if (value.indexOf(term) !== -1) {
	    		possibleMatchesFound++;
	    		placeIndex = index;
	    	}
	    });

	    switch (possibleMatchesFound) {
	    	case 0:
	    		self.changeDataWindowVisibility(true);
	    		self.statusMessage(noMatchFoundMessage);
	    		break;
	    	case 1:
	    		self.removeSelections();
	    		self.places()[placeIndex].activateMarker();
	    		self.updateSearchTerm();
				self.changeDataWindowVisibility(true);
				break;
			default:
				self.changeDataWindowVisibility(true);
				self.statusMessage(selectFromListMessage);
				break;
	    }
	}

	// filter list results
	self.filterResults = function() {
	   var term = self.searchTerm().toLowerCase();
	   infowindow.close();
	    $.each(self.places(), function(index, placeItem) {
	    	var value = placeItem.name().toLowerCase();
	    	if (value.indexOf(term) === -1) {
	    		placeItem.changePlaceMarkerVisibility(false);
	    		placeItem.showListItem(false);
	    	} else {
	    		placeItem.changePlaceMarkerVisibility(true);
	    		placeItem.showListItem(true);
	    	}
	    });
	}

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

				marker.set('placeLocation', self.places()[placeItem]);

				// display the info window when marker is clicked
				google.maps.event.addListener(marker, 'click', function() {
					var placeLocation = this.get('placeLocation');
					self.removeSelections();
					placeLocation.activateMarker();
					self.changeDataWindowVisibility(true);
					self.updateSearchTerm();
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
}

var viewModel = new ViewModel();

$(document).ready(function () {
   ko.applyBindings(viewModel);
});



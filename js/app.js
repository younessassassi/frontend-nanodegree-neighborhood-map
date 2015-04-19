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

	this.hidePlace = function() {
		this.marker.setVisible(false);
	}

	this.showPlace = function() {
		this.marker.setVisible(true);
	}

	this.bounce = function() {
		this.marker.setAnimation(google.maps.Animation.BOUNCE);
		var _this = this;
		setTimeout(function(){
			_this.marker.setAnimation(null);
		}, 1400);
	}
}

var ViewModel = function() {
	var self = this;
	self.places = ko.observableArray([]);

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
			var infowindow = new google.maps.InfoWindow();

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

	// ko.bindingHandlers.isHidden = {
	// 	init: function(element, valueAccessor) {
	// 		$(element).is(':visible')
	// 	}
	//     update: function (element, valueAccessor) {
	//         var value = ko.utils.unwrapObservable(valueAccessor());
	//         if (value == true) {
	//         	bindingContext.$data.removePlace;
	//         }
	//     }
	// };

	// filter list of places when typing in the search box
	$("#search-term").on("keyup", function() {
	    var term = $(this).val().toLowerCase();

	    $.each(self.places(), function(index, placeItem) {
	    	var value = placeItem.name().toLowerCase();
	    	if (value.indexOf(term) === -1) {
	    		placeItem.hidePlace();
	    	} else {
	    		placeItem.showPlace();
	    	}
	    });

	    $("li").each(function() {
	        var value = $(this).text().toLowerCase();
	        $(this).closest('li')[ value.indexOf(term) !== -1 ? 'show' : 'hide' ]();
	    });
	});
}

var viewModel = new ViewModel();

$(document).ready(function () {
   ko.applyBindings(viewModel);
});



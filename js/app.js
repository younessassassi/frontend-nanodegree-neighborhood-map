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

	this.removePlace = function(){
		viewModel.places.remove(this);
		this.marker.setMap(null);
	}
}

var ViewModel = function() {
	var self = this;
	self.places = ko.observableArray([]);
	initialPlaces.forEach(function(placeItem){
		self.places.push(new Place(placeItem));
	});

	ko.bindingHandlers.map = {
	    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
	    	var bounds = new google.maps.LatLngBounds();
		    var options = {
			        mapTypeId: 'roadmap'
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

	    },
	    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {

	  	}
	};
}

var viewModel = new ViewModel();

$(document).ready(function () {
   ko.applyBindings(viewModel);
});

// function init_map() {
// 	var var_location = new google.maps.LatLng(45.430817,12.331516);
//     var var_mapoptions = {
//       center: var_location,
//       zoom: 14
//     };
// 	var var_marker = new google.maps.Marker({
// 		position: var_location,
// 		map: var_map,
// 		animation:google.maps.Animation.BOUNCE,
// 		title:"Venice"
// 	});

//     var var_map = new google.maps.Map(document.getElementById("map-canvas"),
//         var_mapoptions);

// 	var_marker.setMap(var_map);

// 	setTimeout(function() {
//         var_marker.setAnimation(null)
//     }, 1550);

// 	var infowindow = new google.maps.InfoWindow({
//   		content:"Hello World!"
//   	});

// 	google.maps.event.addListener(var_marker,'click',function() {
// 	  infowindow.open(var_map, var_marker);
// 	 });

// 	google.maps.event.addListener(var_map, 'click', function(event) {
// 	  placeMarker(event.latLng);
// 	 });

// 	function placeMarker(location) {
// 	  var marker = new google.maps.Marker({
// 	    position: location,
// 	    map: var_map,
// 	  });
// 	  var infowindow = new google.maps.InfoWindow({
// 	    content: 'Latitude: ' + location.lat() +
// 	    '<br>Longitude: ' + location.lng()
// 	  });
// 	  infowindow.open(var_map,marker);
// 	}
// }

// google.maps.event.addDomListener(window, 'load', init_map);

Number.prototype.toRadians = function() {
   return this * Math.PI / 180;
}

function getDistance(googleLatLng1, googleLatLng2){
    var R = 6371e3; // metres
    var lat1 = googleLatLng1.lat().toRadians();
    var lat2 = googleLatLng2.lat().toRadians();
    var lon1 = googleLatLng1.lng().toRadians();
    var lon2 = googleLatLng2.lng().toRadians();
    
    var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
    var y = (lat2-lat1);
    return Math.sqrt(x*x + y*y) * R;
}
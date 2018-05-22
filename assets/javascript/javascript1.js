$(document).ready(function(){

    $("#submitBtn").on("click", function(){
        $("#wikiDisplay").empty();
        //clayton's variables
            // observer_location needs to be the observer information from the input
            var observer_location = {lat: 30, lng: -97};
            //tlestring needs to be the tle response from the n2yo tle search api (response.tle)
            var tlestring="1 25544U 98067A   18138.88883277 +.00001406 +00000-0 +28541-4 0  9997\r\n2 25544 051.6394 164.7606 0004002 099.1102 320.7609 15.54070224113965";
            //startUTC and endUTC are from pass data from n2yo pass (visual or radio) search api (response.passes[0].startUTC and response.passes[0].endUTC)
            var startUTC=1526901635;
            var endUTC=1526902240;
            //map variables so they can be reached globally
            var map;
            var marker_enter;
            var marker_exit;
            var satPath;
            //elevation to get return from google elevation query
            var elevation=0;
    

        var userSearch = $("#userSearch").val().trim();
            // userSearch = userSearch.replace(" ", "%20");
        // var queryURL =   ("https://en.wikipedia.org/w/api.php?action=opensearch&prop=sections&sectionprop=toclevel%7Clevel%7Cline%7Cnumber%7Cindex%7Cfromtitle%7Canchor&sections=0&limit=1&search=" + userSearch);
        var queryURL =      ("https://en.wikipedia.org/w/api.php?format=json&titles=" + userSearch + "&action=query&prop=extracts&exintro=&explaintext=");
        console.log(queryURL);

        $.ajax({
            url:queryURL,
            method:"GET",
            dataType: "JSONP",
        }).
            then(function(response){
                    // get the page IDs
	            var pageid = [];
	            for( var id in response.query.pages ) {
		            pageid.push( id );
                };
                console.log(pageid);
                console.log(response);

            var card=$("<div>");
                card.addClass("card mt-3 p-3");
            var title=$("<h4>");
                title.text(response.query.pages[pageid].title);
            var paragraph=$("<p>");
                paragraph.text(response.query.pages[pageid].extract);
            var wikiLink=$("<a>");
                wikiLink.attr("href", 'https://en.wikipedia.org/wiki/' + response.query.pages[pageid].title);
                wikiLink.attr("target", "_blank");
                wikiLink.text("Wikipedia");
                card.append(title, paragraph, wikiLink);

            $("#wikiDisplay").html(card);

            var mapobject = {
                initial_map: function(){
                    console.log("in map initialize");
                    function initMap() {
                       map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 4,
                        center: observer_location
                      });
                      var marker = new google.maps.Marker({
                        position: uluru,
                        title:"center",
                        map: map
                      });
                    }
                    $("#map").append(map)
                },
                elevation: function(){
                    var elevationURL="https://maps.googleapis.com/maps/api/elevation/json?locations="+observer_location.lat+","+observer_location.lng+"&key=AIzaSyDoQLe8s7JUbTZ_ubXhGY4cUmLiNqWvQxw";
                    $.ajax({
                        url: elevationURL,
                        method: "GET"
                    }).then(function(response) {
                        elevation=response.elevation;
                    }).fail(function(err) {
                        console.log("Fail:  "+err);
                        throw err;
                    });

                },
                draw: function(){
                    //tlestring split into 2 parts for entry into sattelite 
                    var tle1=tlestring.split("\r\n")[0];
                    var tle2=tlestring.split("\r\n")[1];

                    //sattelite object ititalized with tle elements
                    var satrec = satellite.twoline2satrec(tle1, tle2);

                    //entry point code
                    var starttime=moment(startUTC,"x").toDate();
                    var positionAndVelocity = satellite.propagate(satrec, starttime);
                    var positionEci = positionAndVelocity.position;
                    var velocityEci = positionAndVelocity.velocity;
                    var gmst = satellite.gstime(starttime);
                    var positionGd = satellite.eciToGeodetic(positionEci, gmst);
                    var longitude = positionGd.longitude;
                    var latitude  = positionGd.latitude;
                    var longitudeStr = satellite.degreesLong(longitude);
                    var latitudeStr  = satellite.degreesLat(latitude);
                    //google map code for entry point merker
                    var enter={lat: latitudeStr, lng: longitudeStr };
                    marker_enter = new google.maps.Marker({
                        position: enter,
                        title: "Enters visibility"
                    });
                    marker_enter.setMap(map); 

                    //exit point code
                    var endtime=moment(endUTC,"x").toDate();
                    var exit_positionAndVelocity = satellite.propagate(satrec, endtime);
                    var exit_positionEci = exit_positionAndVelocity.position;
                    var exit_velocityEci = exit_positionAndVelocity.velocity;
                    var exit_gmst = satellite.gstime(endtime);
                    var exit_positionGd = satellite.eciToGeodetic(exit_positionEci, exit_gmst);
                    var exit_longitude = exit_positionGd.longitude;
                    var exit_latitude = exit_positionGd.latitude;
                    var exit_longitudeStr = satellite.degreesLong(exit_longitude);
                    var exit_latitudeStr  = satellite.degreesLat(exit_latitude);
                    var exit={lat: exit_latitudeStr , lng: exit_longitudeStr};
                    //google map code for exit point marker
                    marker_exit = new google.maps.Marker({
                        position: exit,
                        title: "Leaves visibility"
                    });
                    marker_exit.setMap(map);   


                    //set up for orbital path data
                    var roll_LineCoord=[];
                    for(var i=0; i<600; i++){
                    var setbackutc=startUTC-1000000;
                    var rolltime=moment((setbackutc+(i*10000)),"x").toDate();
                    var roll_positionAndVelocity = satellite.propagate(satrec, rolltime);
        
                    var roll_positionEci = roll_positionAndVelocity.position;
                    var roll_velocityEci = roll_positionAndVelocity.velocity;
        
                    var roll_gmst = satellite.gstime(rolltime);
        
                    var roll_positionGd = satellite.eciToGeodetic(roll_positionEci, roll_gmst);
                    var roll_longitude = roll_positionGd.longitude;
                    var roll_latitude  = roll_positionGd.latitude;
                    
                    var roll_longitudeStr = satellite.degreesLong(roll_longitude);
                    var roll_latitudeStr  = satellite.degreesLat(roll_latitude);
                    roll_LineCoord.push({lat: roll_latitudeStr, lng: roll_longitudeStr});
                    }

                    //drawing 
                    var roll_satPath = new google.maps.Polyline({
                        path: roll_LineCoord,
                        geodesic: true,
                        strokeColor: '#0000FF',
                        strokeOpacity: .7,
                        strokeWeight: 1
                      });
                    roll_satPath.setMap(map);


                    //draw line between entry and exit
                    var satPathCoordinates = [
                        {lat: latitudeStr, lng: longitudeStr},
                        {lat: exit_latitudeStr, lng: exit_longitudeStr},
                    ];
                    satPath = new google.maps.Polyline({
                        path: satPathCoordinates,
                        geodesic: true,
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });
                    satPath.setMap(map);
                }
            }







        })
    });

});
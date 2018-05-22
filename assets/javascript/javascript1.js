    var prevSearches = [];
    var savedSearches =[];
    var topSearches=[];

    $("#mapsBtn").hide();
    $("#satBtn").hide();
    $("#weathBtn").hide();




    //Submit Click Butt
//holds array of future satellite passes
var passArray = [];
//holds array of satellites currently above user
var aboveArray = [];
//holds tle for mapping
var tlestring = "";
//holds start UTC for mapping
var initialUTC = "";
//holds end UTC for mapping
var lastUTC = "";
//holds latitude search result so it can be available for mapping/weather/satellitesearch
var latSearch = "";
//holds latitude search result so it can be available for mapping/weather/satellitesearch
var longSearch = "";
//array of satellite types available to user
var satArray = ["Amateur Radio", "Beidou Navigation System", "Disaster Monitoring", "Education", "Galileo", "Global Positioning System (GPS)", "Glonass Operational", "ISS", "Military", "Navy Navigation Satellite System", "Russian LEO Navigation", "Space & Earth Science", "TV", "Weather", "XM and Sirius"]
//array of corresponding satIDs for satellitesearch
var satIdArray = [18, 35, 8, 29, 22, 20, 21, 2, 30, 24, 25, 26, 34, 3, 33]
//holds categoryID
var categoryID = "";
//holds satellite ID
var satID = "";

$(document).ready(function(){

    $("#aboveTable").css("display", "none");
    $("#satelliteInfo").css("display", "none");

    $("#submitBtn").on("click", function(){
        //Clear WikiDisplay
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
        //pull lat/long values from search bar
        latSearch = $("#latSearch").val().trim();
        longSearch = $("#longSearch").val().trim();


        //Get Latitude and Longitude from Search
        var queryURLLatLong = ("https://maps.googleapis.com/maps/api/geocode/json?&address=" + userSearch);
        $.ajax({
            url:queryURLLatLong,
            method:"GET",
            dataType: "JSON",
        }).
        then(function(response){
            console.log(response)

            latSearch = response.results[0].geometry.location.lat
            longSearch = response.results[0].geometry.location.lng

            console.log("lat: " + latSearch + " long: " + longSearch);

        });


        //Show Buttons
        $("#mapsBtn").show();
        $("#satBtn").show();
        $("#weathBtn").show();

        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////
        //                                                       //
        //                    PREVIOUS SEARCHES                  //
        //                                                       //
        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////
        var prevSearchObject = {
            "satelliteID": userSearch,
            "latitude": latSearch,
            "longitude": longSearch
        };
            prevSearches.unshift(prevSearchObject);
            // console.log(prevSearches);

        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////
        //                                                       //
        //                 WIKIPEDIA API RESPONSE                //
        //                                                       //
        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////

        var queryURLBasic =   ("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + userSearch +"&srwhat=text&srprop=timestamp&continue=&format=json");
               
        //Get Closest Title//
        $.ajax({
            url:queryURLBasic,

            method:"GET",
            dataType: "JSONP",
        }).
            then(function(response){

                console.log(queryURLBasic);
                    // get the page IDs
                var pageTitle = response.query.search[0].title;
                var pageid=response.query.search[0].pageid;
                var queryURL = ("https://en.wikipedia.org/w/api.php?format=json&titles=" + pageTitle + "&action=query&prop=extracts&exsectionformat=plain&exintro=&explaintext=&");
                
                //Search by Title
                $.ajax({
                    url:queryURL,
                    method:"GET",
                    dataType: "JSONP",
                }).
                then(function(response){
                    console.log(queryURL);
                    // Display Info to Page
                    var card=$("<div>");
                        card.addClass("card bg-light mt-3 p-3 ");
                    var title=$("<h5>");
                        title.addClass("border-bottom font-weight-bold")
                        title.text(response.query.pages[pageid].title);
                    var paragraph=$("<p>");
                        paragraph.addClass("sansSerif  p-1 rounded bg-light border border-dark anyClass");
                        paragraph.text(response.query.pages[pageid].extract);
                    var wikiLink=$("<a>");
                        wikiLink.attr("href", 'https://en.wikipedia.org/wiki/' + response.query.pages[pageid].title);
                        wikiLink.attr("target", "_blank");
                        wikiLink.text("Wikipedia");
                        card.append(title, paragraph, wikiLink);

                    $("#wikiDisplay").html(card);
                    console.log(card);
                });

 
            });


        


    });

    //handles button click for finding satellites above user
    $("#satSelectBtn").on("click", function(){
        //clear table contents
        //$("#aboveTable").css("display", "none"); 
        $("#aboveTableBody").empty();
        //variable to hold the type of satellite the user selects
        var satType = $("#satTypeSelect").val().toString();
        //loop to assign the appropriate satID
        for (i=0; i < satIdArray.length; i++) {
            if (satType == satArray[i]) {
                categoryID = satIdArray[i];
            }
        }
        console.log(satType);
        console.log(categoryID);
        //set the location variables from the user input
        latSearch = $("#latSearch").val().trim();
        longSearch = $("#longSearch").val().trim();
        //prevent a search if the user has not input location information
        if (latSearch == "" || longSearch == ""){
            alert ("you must enter a latitude and longitude to continue.");
            return;
        }
        
        //what's up sat API query
        var queryURLwhatsUp = ("https://www.n2yo.com/rest/v1/satellite/above/" + latSearch + "/" + longSearch + "/0/60/" + categoryID + "/&apiKey=E5EU4L-JJT928-8ES55V-3TC6");
        console.log(queryURLwhatsUp)
        //populate aboveArray with the satellites returned by the API query
        $.ajax({
            url:queryURLwhatsUp,
            method:"GET",
            dataType: "JSON",
            }).
            then(function(response){
                aboveArray = [];
               
                if (response.info.satcount == 0) {
                    alert("There are currently no satellites of this type above your location. Please select another satellite type.");
                    return;
                }

                for (i=0; i<response.above.length; i++){
                    aboveArray.push(response.above[i]);
                }
                //make table visible
                $("#aboveTable").css("display", "table");  
                for(i=0; i<aboveArray.length; i++){
                //add table html with relevant satellite data to the table body
                $("#aboveTableBody").append("<tr> <th scope='row' id='satelliteNames'>" + aboveArray[i].satname + 
                "</th> <td id='satelliteIDs'>" + aboveArray[i].satid + 
                 "</td> <td id='altitudes'>"+ aboveArray[i].satalt + 
                "</td> <td id='launchDates'>" + moment(aboveArray[i].launchDate).format('MMMM Do YYYY') + 
                "</td> <td id='launchDates'><button type='input' class='btn btn-primary rounded' value='"
                 + aboveArray[i].satid + "' >Select</button></td></tr>"
                
                        );

                    }
                     
            });


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

//});

//button that fires when user selects satellite
$(document).on('click', '.btn-primary', function(){
    //save button value (which was set to the satellite id)
    satID = $(this).val();
    //hide table and display satellite info div
    $("#aboveTable").css("display", "none");
    $("#satelliteInfo").css("display", "inherit");
    //visual passes sat API query
    var queryURLvisPass = ("https://www.n2yo.com/rest/v1/satellite/visualpasses/" + satID + "/" + latSearch + "/" + longSearch + "/0/10/300/&apiKey=E5EU4L-JJT928-8ES55V-3TC6");
    console.log(queryURLvisPass);

    $.ajax({
        url:queryURLvisPass,
        method:"GET",
        dataType: "JSON",
    }).
        then(function(response){
                //
            passArray = [];
            initialUTC = "";
            lastUTC = "";
           
            if (response.info.passescount == 0) {
                alert("There will be no visually observable passes for this satellite in the next 10 days at your location. Please select another satellite.");
                $("#aboveTable").css("display", "table");
                $("#satelliteInfo").css("display", "none");
                return;
            }

            for (i=0; i<5; i++){
                passArray.push(response.passes[i]);
            }
            
            initialUTC = response.passes[0].startUTC;
            lastUTC = response.passes[0].endUTC;
            console.log("start UTC: " + initialUTC);
            console.log("end UTC: " + lastUTC);
            /*startDir = response.passes[0].startAzCompass;
            endDir = response.passes[0].endAzCompass;
            startElev =response.passes[0].startEl;
            endElev = response.passes[0].endEl;
            maxElev = response.passes[0].maxEl;
            passLength = response.passes[0].duration;*/
            
            for(i=0; i<passArray.length; i++){
            //add table html with relevant satellite data to the table body
            $("#passTableBody").append("<tr> <th scope='row' id='startTimes'>" + response.passes[i].startUTC + 
            "</th> <td id='endTimes'>" + response.passes[i].endUTC + 
             "</td> <td id='startCoordinates'>"+ response.passes[i].startAzCompass + 
            "</td> <td id='endCoordinates'>" + response.passes[i].endAzCompass + 
            "</td> <td id='startEls'>" + response.passes[i].startEl + 
            "</td> <td id='endEls'>" + response.passes[i].endEl + 
            "</td> <td id='maxEls'>" + response.passes[i].maxEl + 
            "</td> <td id='durations'>" + response.passes[i].duration + 
            "</td></tr>"
            
                    );

                }
    });
    //tle string API query
    var queryURLtle = ("https://www.n2yo.com/rest/v1/satellite/tle/" + satID + "&apiKey=E5EU4L-JJT928-8ES55V-3TC6");

    $.ajax({
        url:queryURLtle,
        method:"GET",
        dataType: "JSON",
        }).
        then(function(response){
        
        tle = response.tle;
        console.log("tle: " + response.tle);
        
        
        });

});
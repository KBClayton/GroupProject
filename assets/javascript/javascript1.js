//GLOBAL VARIABLES

//holds array of previous satellite searches
var prevSearches = [];
//holds array of saved satellite searches
var savedSearches =[];
//holds array of top satellite searches
var topSearches=[];

    
var prevSearches = [];
var savedSearches =[];
var topSearches=[];

$("#mapsBtn").hide();
$("#satBtn").hide();
$("#weathBtn").hide();

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

    //Hides Buttons Until Searched
    $("#mapsBtn").hide();   
    $("#satBtn").hide();
    $("#weathBtn").hide();

    function getWiki(){
        var queryURLBasic =   ("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + userSearch +"&srwhat=text&srprop=timestamp&continue=&format=json");
        $.ajax({
            url:queryURLBasic,
            method:"GET",
            dataType: "JSONP",
        }).
            then(function(response){
                // get the page Title
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
                    userSearch="";
                });
            }); 
    };

$(document).ready(function(){

$(".satTypeDisplay").css("display", "none");
$("#satelliteInfo").css("display", "none");

$("#submitBtn").off().on("click", function(){
    $("#mapsDisplay").hide();
    $("#satelliteDisplay").show();
    $("#weatherDisplay").hide();
    if ($("#userSearch").val() == ""){
        $(".errorClass").text("Please enter a valid city name...");
    }
    
    else{

    }
    
    //Clear WikiDisplay
    $("#wikiDisplay").empty();    
        //Alex's Variables
        var userSearch = $("#userSearch").val().trim();
        var queryURL =      ("https://en.wikipedia.org/w/api.php?format=json&titles=" + userSearch + "&action=query&prop=extracts&exintro=&explaintext=");
        console.log(queryURL);
        //pull lat/long values from search bar
        latSearch = $("#latSearch").val().trim();
        longSearch = $("#longSearch").val().trim();

        //Get Latitude and Longitude from Search
            // var queryURLLatLong = ("https://maps.googleapis.com/maps/api/geocode/json?&address=" + userSearch);
            // $.ajax({
            //     url:queryURLLatLong,
            //     method:"GET",
            //     dataType: "JSON",
            // }).
            // then(function(response){
            //     console.log(response)
            //     latSearch = response.results[0].geometry.location.lat
            //     longSearch = response.results[0].geometry.location.lng
            //     console.log("lat: " + latSearch + " long: " + longSearch);
            // });

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
                // get the page Title
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
                }); 


    var userSearch = $("#userSearch").val().trim();
        // userSearch = userSearch.replace(" ", "%20");
    // var queryURL =   ("https://en.wikipedia.org/w/api.php?action=opensearch&prop=sections&sectionprop=toclevel%7Clevel%7Cline%7Cnumber%7Cindex%7Cfromtitle%7Canchor&sections=0&limit=1&search=" + userSearch);
    var queryURL =      ("https://en.wikipedia.org/w/api.php?format=json&titles=" + userSearch + "&action=query&prop=extracts&exintro=&explaintext=");
    console.log(queryURL);
    


    //Get Latitude and Longitude from Search
    var queryURLLatLong = ("https://maps.googleapis.com/maps/api/geocode/json?&address=" + userSearch + "&apikey=AIzaSyDoQLe8s7JUbTZ_ubXhGY4cUmLiNqWvQxw");
    $.ajax({
        url:queryURLLatLong,
        method:"GET",
        dataType: "JSON",
    }).
    then(function(response){
        console.log(response)

        latSearch = response.results[0].geometry.location.lat
        longSearch = response.results[0].geometry.location.lng
        $("#latSearch").val(latSearch);
        $("#longSearch").val(longSearch);
        console.log("lat: " + latSearch + " long: " + longSearch);

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
                    $(".satTypeArea").css("display", "inherit");
                    $(".satTypeDisplay").css("display", "none");
                    alert("There are currently no satellites of this type above your location. Please select another satellite type.");
                    return;
                }
                //$(".satTypeArea").css("display", "none");
                $(".satTypeDisplay").css("display", "inherit");
                for (i=0; i<response.above.length; i++){
                    aboveArray.push(response.above[i]);
                }
                //make table visible
                $("#aboveTable").css("display", "table"); 
                //if the length of aboveArray is less than 5, display all results
                if (aboveArray.length < 5){
                for(i=0; i<aboveArray.length; i++){
                //add table html with relevant satellite data to the table body
                $("#aboveTableBody").append("<tr> <th scope='row' id='satelliteNames'>" + aboveArray[i].satname + 
                "</th> <td id='satelliteIDs'>" + aboveArray[i].satid + 
                 "</td> <td id='altitudes'>"+ aboveArray[i].satalt + 
                "</td> <td id='launchDates'>" + moment(aboveArray[i].launchDate).format('MMMM Do YYYY') + 
                "</td> <td id='launchDates'><button type='input' class='btn btn-primary rounded satSelectorBtn' value='"
                 + aboveArray[i].satid + "' >Select Satellite</button></td></tr>"
                
                        );
    
                    }
                }
                //if the length of aboveArray is greater than or equal to 5, only show the first 5 results
                else {
                    for(i=0; i < 5; i++){
                        //add table html with relevant satellite data to the table body
                        $("#aboveTableBody").append("<tr> <th scope='row' id='satelliteNames'>" + aboveArray[i].satname + 
                        "</th> <td id='satelliteIDs'>" + aboveArray[i].satid + 
                         "</td> <td id='altitudes'>"+ aboveArray[i].satalt + 
                        "</td> <td id='launchDates'>" + moment(aboveArray[i].launchDate).format('MMMM Do YYYY') + 
                        "</td> <td id='launchDates'><button type='input' class='btn btn-primary rounded satSelectorBtn' value='"
                         + aboveArray[i].satid + "' >Select</button></td></tr>"
                        
                                );
            
                            }
                }  
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


        }); //MAYBE THE END
    

});

/*handles button click for finding satellites above user
$("#satTypeSelectBtn").on("click", function(){
    //clear table contents
    
        });*/

$("#chooseDifferentSatTypeBtn1").off().on('click', function(){
    //hide #satelliteInfo
    $(".satTypeDisplay").css("display", "none");
    //display #whatsUp 
    $(".satTypeArea").css("display", "inherit");
        });

$("#chooseDifferentSatTypeBtn2").off().on('click', function(){
    //hide #satelliteInfo
    $("#satelliteInfo").css("display", "none");
    //display .satTypeArea
    $(".satTypeArea").css("display", "inherit");
    //display #whatsUp 
    $("#whatsUp").css("display", "inherit");
    //hide .satTypeDisplay
    $(".satTypeDisplay").css("display", "none");
        });

$("#chooseDifferentSatBtn").off().on('click', function(){
    //hide #satelliteInfo
    $("#satelliteInfo").css("display", "none");
    //display #whatsUp 
    $("#whatsUp").css("display", "inherit");
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

   
        

    });
});


function callWeatherApi(lattitude,longtitude,cityName){
    var queryURL = ("https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&lat=" + lattitude + "&lon=" + longtitude + "&appid=764202827fb596fa8957502051063c79" );
    $.ajax({
        url:queryURL,
        method:"GET",
    }).
        then(function(response){ 
            var city = $("#country").text(response.city.name);
            console.log("The Country is: " + response.city.name);
        $("#country").append(city);      
        var weatherInfo=$("<table>").addClass("table table-hover");
        //table head  
        var head = ["Date","Weather", "Clouds","Wind"];
        for (var j = 0; j < head.length; j++) {
            var tHead = $("<th>").text(head[j]);
            weatherInfo.append(tHead);
        }
     
        //table body
        for (var i = 0; i <= 32; i+= 8) {
               
            var date = $("<td>").text(response.list[i].dt_txt);
                console.log("Date: " + response.list[i].dt_txt);  
            var weather = $("<td>").text(response.list[i].weather[0].description);
                console.log("Local Weather is: " + response.list[i].weather[0].description);    
            var condition = $("<td>").text(response.list[i].clouds.all + "%");
                console.log(" The Cloud is: " + response.list[i].clouds.all + "%");
            var wind = $("<td>").text(response.list[i].wind.speed);
                console.log(" The Wind is: " + response.list[i].wind.speed);
            var tBody = $("<tr>").append(date,weather,condition,wind);
            tBody.appendTo(weatherInfo);
            console.log(weatherInfo);
        }
        
        $("#weatherDisplay").html(weatherInfo);  
        });

}

function printLocalFav(){
    var local_fav_array = localStorage.getItem("myFav");
    console.log(local_fav_array);
    if(local_fav_array){
        local_fav_array = JSON.parse(local_fav_array);
        console.log(local_fav_array.length);
        for(var i = 0; i < local_fav_array.length; i++){
            var city= local_fav_array[i].city;
            var lattitude = local_fav_array[i].lattitude;
            var longitude = local_fav_array[i].longitude;
            $("#myFav").append("<li class = 'addFav' " +"id="+city+">" + city + ", " + lattitude + ", " + longitude + "</li>");
        }
    }
}
//weather API
$(document).ready(function(){

printLocalFav();

$("#likeBtn").hide();

$("#submitBtn").on("click", function(weather){
    $("#likeBtn").show();
    $("#weatherDisplay").empty();
    var lattitude = $("#latSearch").val().trim();
    var longtitude = $("#longSearch").val().trim();
    var cityName = $("#userSearch").val().trim();
    // var queryURL = ("https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&lat=" + lattitude + "&lon=" + longtitude + "&appid=764202827fb596fa8957502051063c79" );
        // console.log(queryURL);
    callWeatherApi(lattitude,longtitude,cityName);


});

   // Button for adding favorites
   $("#likeBtn").on("click", function(event) {
        event.preventDefault();
        // Grabs user input
        var userInput = $("#userSearch").val().trim();
        var latInput = $("#latSearch").val().trim();
        var longInput = $("#longSearch").val().trim();
        var userInputId = userInput.replace(" ", "");
        if(userInput && latInput && longInput){
            $("#userSearch").val("");
            $("#latSearch").val("");
            $("#longSearch").val("");
            // Creates local "temporary" object for holding new search data
            var newSatellite = {
                city: userInput,
                lattitude: latInput,
                longitude: longInput,
            };

            var new_local_fav = localStorage.getItem("myFav");
            if(!new_local_fav){
                new_local_fav.append(newSatellite);
                console.log("yes");
            }
            else {
                new_local_fav = [newSatellite];
                console.log("no");
            }
            localStorage.setItem("myFav", JSON.stringify(new_local_fav));
            $("#myFav").append("<li class = addFav" +"id="+userInputId+">" + userInput + ", " + latInput + ", " + longInput + "</li>");
        }
   });

    //Runs Search from Favorite Click    
    $("#myFav").on("click", ".addFav", function(){
        // alert("hi");
        userSearch = $(this).attr("id");
        var data_string = $(this).text();
        var data_array = data_string.split(", ");
        console.log("data_array="+data_array);
        var cityName = data_array[0];
        var lattitude = data_array[1];
        var longtitude = data_array[2];
        callWeatherApi(lattitude,longtitude,cityName);
        getWiki();

    });
});


//button that fires when user selects satellite
$(document).off().on('click', '.satSelectorBtn', function(){
    //save button value (which was set to the satellite id)
    satID = $(this).val();
    //empty out pass table
    $("#passTableBody").empty();
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
                $("#whatsUp").css("display", "inherit");
                $("#satelliteInfo").css("display", "none");
                return;
            }
            //hide table and display satellite info div
            $("#whatsUp").css("display", "none");
            $("#satelliteInfo").css("display", "inherit");
    
            for (i=0; i<response.info.passescount; i++){
                passArray.push(response.passes[i]);
            }
            
            initialUTC = response.passes[0].startUTC;
            lastUTC = response.passes[0].endUTC;
            console.log("start UTC: " + initialUTC);
            console.log("end UTC: " + lastUTC);
            
            //create if/else statement to limit results to 5 objects
            if (passArray.length < 5){
            for(i=0; i<passArray.length; i++){
            //holds the pass number
            var passNumber = i + 1;
            //holds the local start date for each pass
            var localStartDate = moment.utc(response.passes[i].startUTC, 'X').local().format('dddd MMMM Do YYYY');
            //holds the local start time for each pass
            var localStartTime = moment.utc(response.passes[i].startUTC, 'X').local().format('h:mm:ss a');
            //holds the local end time for each pass
            var localEndDate = moment.utc(response.passes[i].endUTC, 'X').local().format('dddd MMMM Do YYYY');
            //holds the local start date for each pass
            var localEndTime = moment.utc(response.passes[i].endUTC, 'X').local().format('h:mm:ss a');
            //add table html with relevant satellite data to the table body
            var localMaxDate = moment.utc(response.passes[i].maxUTC, 'X').local().format('dddd MMMM Do YYYY');
            //holds the local start date for each pass
            var localMaxTime = moment.utc(response.passes[i].maxUTC, 'X').local().format('h:mm:ss a');
            //add table html with relevant satellite data to the table body
            $("#passTableBody").append("<tr> <th scope='row' id='pass numbers'>" + passNumber + 
            "</th> <td id='startDates'>" + localStartDate + 
            "</th> <td id='startTimes'>" + localStartTime + 
            "</td> <td id='startCoordinates'>" + response.passes[i].startAz + 
            "&deg; (" + response.passes[i].startAzCompass +
            ")</td> <td id='startEls'>" + response.passes[i].startEl +
            "&deg;</th> <td id='maxDates'>" + localMaxDate + 
            "</th> <td id='maxTimes'>" + localMaxTime +   
            "</td> <td id='endCoordinates'>" + response.passes[i].maxAz + 
            "&deg; (" + response.passes[i].maxAzCompass + 
            ")</td> <td id='maxEls'>" + response.passes[i].maxEl +  
            "&deg;</th> <td id='endDates'>" + localEndDate + 
            "</th> <td id='endTimes'>" + localEndTime +   
            "</td> <td id='endCoordinates'>" + response.passes[i].endAz + 
            "&deg; (" + response.passes[i].endAzCompass + 
            ")</td> <td id='endEls'>" + response.passes[i].endEl +
            "&deg;</td></tr>"
            
                    );
    
                }
            }
            //for satellites where passArray length >= 5, only display 5 results  
            else {
                for(i=0; i < 5; i++){
                    //holds the pass number
                    var passNumber = i + 1;
                    //holds the local start date for each pass
                    var localStartDate = moment.utc(response.passes[i].startUTC, 'X').local().format('dddd MMMM Do YYYY');
                    //holds the local start time for each pass
                    var localStartTime = moment.utc(response.passes[i].startUTC, 'X').local().format('h:mm:ss a');
                    //holds the local end time for each pass
                    var localEndDate = moment.utc(response.passes[i].endUTC, 'X').local().format('dddd MMMM Do YYYY');
                    //holds the local start date for each pass
                    var localEndTime = moment.utc(response.passes[i].endUTC, 'X').local().format('h:mm:ss a');
                    //add table html with relevant satellite data to the table body
                    var localMaxDate = moment.utc(response.passes[i].maxUTC, 'X').local().format('dddd MMMM Do YYYY');
                    //holds the local start date for each pass
                    var localMaxTime = moment.utc(response.passes[i].maxUTC, 'X').local().format('h:mm:ss a');
                    //add table html with relevant satellite data to the table body
                    $("#passTableBody").append("<tr> <th scope='row' id='pass numbers'>" + passNumber + 
                    "</th> <td id='startDates'>" + localStartDate + 
                    "</th> <td id='startTimes'>" + localStartTime + 
                    "</td> <td id='startCoordinates'>" + response.passes[i].startAz + 
                    "&deg; (" + response.passes[i].startAzCompass +
                    ")</td> <td id='startEls'>" + response.passes[i].startEl +
                    "&deg;</th> <td id='maxDates'>" + localMaxDate + 
                    "</th> <td id='maxTimes'>" + localMaxTime +   
                    "</td> <td id='endCoordinates'>" + response.passes[i].maxAz + 
                    "&deg; (" + response.passes[i].maxAzCompass + 
                    ")</td> <td id='maxEls'>" + response.passes[i].maxEl +  
                    "&deg;</th> <td id='endDates'>" + localEndDate + 
                    "</th> <td id='endTimes'>" + localEndTime +   
                    "</td> <td id='endCoordinates'>" + response.passes[i].endAz + 
                    "&deg; (" + response.passes[i].endAzCompass + 
                    ")</td> <td id='endEls'>" + response.passes[i].endEl +
                    "&deg;</td></tr>"
                    
                            );
            
                        } 
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
        
        tlestring = response.tle;
        console.log("tle: " + response.tle);
        
        });

}); 
});

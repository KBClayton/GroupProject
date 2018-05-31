//GLOBAL VARIABLES

    //user Search Variable
    var userSearch;
    var satTypeSelect;
    //holds array of previous satellite searches
    var prevSearches = [];
    //holds array of saved satellite searches
    var savedSearches =[];
    //holds array of top satellite searches
    var topSearches=[];

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

   
    //initial Display Function
    pageLoadDisplay();

    // var satTypeSelect = $("#satTypeSelect").val();
    function mainFunction(){
        console.log(userSearch);
        console.log(satTypeSelect);
        //If user enters a city and selects a satellite type
        if (userSearch != "" && satTypeSelect != ""){
            //clear any current error message
            $(".errorClass").empty();
            latSearch = $("#latSearch").val().trim();
            longSearch = $("#longSearch").val().trim();
            console.log("categoryId")
            
            //Get Latitude and Longitude from Search
            var queryURLLatLong = ("https://maps.googleapis.com/maps/api/geocode/json?&address=" + userSearch + "&apikey=AIzaSyDoQLe8s7JUbTZ_ubXhGY4cUmLiNqWvQxw");
            $.ajax({
                url:queryURLLatLong,
                method:"GET",
                dataType: "JSON",
            }).
            then(function(response){
                //if location is not an actual location 
                console.log("search worked")
                if (response.results[0] == undefined){
                    // run error message
                    $(".errorClass").text('* " ' + userSearch + '" is not a valid location *');
                }
                //if location is an actual location
                else{

                    $(".errorClass").empty();
                    //Run WikiSearch Display
                    wikiSubmit();
                    //set Like Button attr userSearch
                    $("#likeBtn").attr("data-address", userSearch);
                    $("#likeBtn").attr("data-selector-id", satTypeSelect);

                    ///////////////////
                    // SATELLITE APP //
                    ///////////////////

                    latSearch = response.results[0].geometry.location.lat                
                    longSearch = response.results[0].geometry.location.lng
                    $("#latSearch").val(latSearch);
                    $("#longSearch").val(longSearch);
                    $("#aboveTableBody").empty();
                    $("#address").text(response.results[0].formatted_address);
                    elevation=mapobject.elevation();
                    //variable to hold the type of satellite the user selects
                    var satType = satTypeSelect;
                    //loop to assign the appropriate satID
                    for (i=0; i < satIdArray.length; i++) {
                        if (satType == satArray[i]) {
                            categoryID = satIdArray[i];
                        }
                    };
                    // console.log(satType);
                    // console.log(categoryID);
                    //set the location variables from the user input
                    latSearch = $("#latSearch").val().trim();
                    longSearch = $("#longSearch").val().trim();
                    //prevent a search if the user has not input location information
                
                    //what's up sat API query
                    var queryURLwhatsUp = ("https://www.n2yo.com/rest/v1/satellite/above/" + latSearch + "/" + longSearch + "/" + elevation + "/60/" + categoryID + "/&apiKey=E5EU4L-JJT928-8ES55V-3TC6");
                    console.log("whatsup: " + queryURLwhatsUp)
                    //populate aboveArray with the satellites returned by the API query
                    $.ajax({
                        url:queryURLwhatsUp,
                        method:"GET",
                        dataType: "JSON",
                    }).
                    then(function(response){
                        aboveArray = [];
                    
                        if (response.info.satcount == 0) {
                            $(".errorClass").text("* There are no available Satellites in your Area *");
                        }
                        else {
                            $(".errorClass").empty();
                            //initial display function
                            postSearchDisplay();
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
                                $("#aboveTableBody").append("<tr> <th scope='row' id='satelliteNames'><button type='input' class='btn btn-primary rounded satSelectorBtn' value='"
                                + aboveArray[i].satid + "' >" + aboveArray[i].satname + "</button></td></th> <td id='satelliteIDs'>" + aboveArray[i].satid + 
                                "</td> <td id='altitudes'>"+ aboveArray[i].satalt + 
                                "</td> <td id='launchDates'>" + moment(aboveArray[i].launchDate).format('MMMM Do YYYY') + 
                                "</td>");         
                                }
                            }
                            //if the length of aboveArray is greater than or equal to 5, only show the first 5 results
                            else {
                                for(i=0; i < 5; i++){
                                    //add table html with relevant satellite data to the table body
                                    $("#aboveTableBody").append("<tr> <th scope='row' id='satelliteNames'><button type='input' class='btn btn-primary rounded satSelectorBtn' value='"
                                + aboveArray[i].satid + "' >" + aboveArray[i].satname + "</button></td></th> <td id='satelliteIDs'>" + aboveArray[i].satid + 
                                "</td> <td id='altitudes'>"+ aboveArray[i].satalt + 
                                "</td> <td id='launchDates'>" + moment(aboveArray[i].launchDate).format('MMMM Do YYYY') + 
                                "</td>");            
                                }
                            }   
                        }  
                    });

                    //////////////////////////
                    // END OF SATELLITE APP //
                    //////////////////////////

                    //////////////////
                    //  WEATHER APP //
                    //////////////////

                    function callWeatherApi(latSearch,longSearch, cityName){
                        var queryURL = ("https://api.openweathermap.org/data/2.5/forecast?q=" + "&lat=" + latSearch + "&lon=" + longSearch + "&appid=764202827fb596fa8957502051063c79" );
                        $.ajax({
                            url:queryURL,
                            method:"GET",
                        }).
                        then(function(response){ 
                            // $("#country").append(city);      
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
                    };                
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
                    };
                    $("#likeBtn").show();
                    $("#weatherDisplay").empty();
                    var lattitude = $("#latSearch").val().trim();
                    var longtitude = $("#longSearch").val().trim();
                    var cityName = $("#userSearch").val().trim();
                    // var queryURL = ("https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&lat=" + lattitude + "&lon=" + longtitude + "&appid=764202827fb596fa8957502051063c79" );
                    // console.log(queryURL);
                    callWeatherApi(lattitude,longtitude,cityName);
                    printLocalFav();

                    ////////////////////////
                    // END OF WEATHER API //
                    ////////////////////////

                }
            });
        }
        //If user selects a satellite Type but no location
        else if (userSearch != "" && satTypeSelect == ""){
            $(".errorClass").empty();
            $(".errorClass").text("* Please Select A Satellite Type *");
        }
        //If user selects a location but no satellite type
        else if (userSearch == "" && satTypeSelect != ""){
            $(".errorClass").empty();
            $(".errorClass").text("* Please Enter A Location *");
        }
        //If user doesn't enter a location or satellite type
        else{
            $(".errorClass").empty();
            $(".errorClass").text("* Please Enter Location and Select a Satellite Type *");
        }
    };

    //Submit Button
    $("#submitBtn").off().on("click", function(){
        userSearch = $("#userSearch").val().trim();
        satTypeSelect = $("#satTypeSelect").val();
        mainFunction();
    });

    //Choose Different Sat Button 1
    $("#chooseDifferentSatTypeBtn1").off().on('click', function(){
        //hide #satelliteInfo
        pageLoadDisplay();
        //display #whatsUp 
        $("#searchBar").show();
    });

    //Choose Differnt Sat Button 2
    $("#chooseDifferentSatTypeBtn2").off().on('click', function(){
        //hide #satelliteInfo
        $("#satelliteInfo").css("display", "none");
        //display .satTypeArea
        $(".satTypeArea").css("display", "inherit");
        //display #whatsUp 
        $("#whatsUp").css("display", "inherit");
        //hide .satTypeDisplay
        $(".satTypeDisplay").css("display", "none");
        pageLoadDisplay();
        //display #whatsUp 
        $("#searchBar").show();
    });

    //Choose Different Sat Button
    $("#chooseDifferentSatBtn").off().on('click', function(){
        //hide #satelliteInfo
        $("#satelliteInfo").css("display", "none");
        //display #whatsUp 
        $("#whatsUp").css("display", "inherit");
    });


    //Choose Different Sat Button
    
    //local storage for Favorite Searches
    var list = JSON.parse(localStorage.getItem("my-Fav"));
    if (!Array.isArray(list)) {
        list = [];
        }
        function putOnPage() {

        $("#myFav").empty(); // empties out the html
  
        var insideList = JSON.parse(localStorage.getItem("my-Fav"));
  
        // Checks to see if we have any favs in localStorage
        // If we do, set the local insideList variable to our favs
        // Otherwise set the local insideList variable to an empty array
        if (!Array.isArray(insideList)) {
          insideList = [];

        }
        // render our insideList favs to the page
        for (var i = 0; i < insideList.length; i++) {
          var p = $("<p>").text(insideList[i]);
        //   var b = $("<button class='delete'>").text("x").attr("data-index", i);
        //   p.prepend(b);
          $("#myFav").prepend(p);
        }
    }
    // render our favs on page load
    putOnPage();
    
    //Delete Button Button
    // $(document).on("click", "button.delete", function() {
    //     var favlist = JSON.parse(localStorage.getItem("my-Fav"));
    //     var currentIndex = $(this).attr("data-index");
  
    //     // Deletes the item marked for deletion
    //     favlist.splice(currentIndex, 1);
    //     list = favlist;
  
    //     localStorage.setItem("my-Fav", JSON.stringify(favlist));
  
    //     putOnPage();
    // });
  
    //Add to Favorites Button
    $("#likeBtn").on("click", function(event) {
        event.preventDefault();
        // Setting the input value to a variable and then clearing the input
        var val = $("#userSearch").val();
        $("#userSearch").val("");
  
        // Adding our new fav to our local list variable and adding it to local storage
        list.push(val);
        localStorage.setItem("my-Fav", JSON.stringify(list)); 
        putOnPage();
    });


    // Button for adding favorites
    // $("#likeBtn").on("click", function(event) {
    //     event.preventDefault();
    //     // Grabs user input
    //     var userInput = $("#userSearch").val().trim();
    //     var latInput = $("#latSearch").val().trim();
    //     var longInput = $("#longSearch").val().trim();
    //     var userInputId = userInput.replace(" ", "");
    //     if(userInput && latInput && longInput){
    //         $("#userSearch").val("");
    //         $("#latSearch").val("");
    //         $("#longSearch").val("");
    //         // Creates local "temporary" object for holding new search data
    //         var newSatellite = {
    //             city: userInput,
    //             lattitude: latInput,
    //             longitude: longInput,
    //         };

    //         var new_local_fav = JSON.parse(localStorage.getItem("myFav"));
    //         if(!Array.isArray(new_local_fav)){
    //             new_local_fav.push(newSatellite);
    //             console.log("yes");
    //         }
    //         else {
    //             new_local_fav = [newSatellite];
    //             console.log("no");
    //         }
    //         localStorage.setItem("myFav", JSON.stringify(new_local_fav));
    //         $("#myFav").prepend("<li class = addFav" +"id="+userInputId+">" + userInput + ", " + latInput + ", " + longInput + "</li>");
    //     }
    // });

    //button that fires when user selects satellite
    $(document).off().on('click', '.satSelectorBtn', function(){
        //save button value (which was set to the satellite id)
        satID = $(this).val();
        //empty out pass table
        $("#passTable1Body").empty();
        $("#passTable2Body").empty();
        $("#passTable3Body").empty();
        $("#passTable4Body").empty();
        $("#passTable5Body").empty();
        $("#passButtonHolder").empty();
        //visual passes sat API query
        var queryURLvisPass = ("https://www.n2yo.com/rest/v1/satellite/visualpasses/" + satID + "/" + latSearch + "/" + longSearch + "/" + elevation + "/10/300/&apiKey=E5EU4L-JJT928-8ES55V-3TC6");
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
            
            //If no satellites are available in the next 10 days display error message
            if (response.info.passescount == 0) {
                $(".errorClass").text("* There will be no visually observable passes for this satellite in the next 10 days at your location. Please select another satellite. *");
            }
            else {
                $(".errorClass").empty();
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
                        //add a button for each pass table
                        $("#passButtonHolder").append("<button type='input' class='btn btn-primary rounded' id='passButton"
                        + passNumber + "' > pass " + passNumber + "</button>");
                        //add table html with relevant satellite data to the table body
                        $("#passTable"+ passNumber +"Body").append("<tr> <th scope='row' id='passStart'>Start of Pass</th> <td id='startDates'>" + localStartDate + 
                        "</td> <td id='startTimes'>" + localStartTime + 
                        "</td> <td id='startCoordinates'>" + response.passes[i].startAz + 
                        "&deg; (" + response.passes[i].startAzCompass +
                        ")</td> <td id='startEls'>" + response.passes[i].startEl +
                        "&deg;</td></tr> <tr> <th scope='row' id='passMaxnumbers'>Maximum Elevation</th> <td id='maxDates'>" + localMaxDate + 
                        "</th> <td id='maxTimes'>" + localMaxTime +   
                        "</td> <td id='endCoordinates'>" + response.passes[i].maxAz + 
                        "&deg; (" + response.passes[i].maxAzCompass + 
                        ")</td> <td id='maxEls'>" + response.passes[i].maxEl +  
                        "&deg;</td></tr> <tr> <th scope='row' id='passEndnumbers'>End of Pass</th> <td id='endDates'>" + localEndDate + 
                        "</th> <td id='endTimes'>" + localEndTime +   
                        "</td> <td id='endCoordinates'>" + response.passes[i].endAz + 
                        "&deg; (" + response.passes[i].endAzCompass + 
                        ")</td> <td id='endEls'>" + response.passes[i].endEl +
                        "&deg;</td></tr>");
                        $("#passTable1").show();
                        $("#passTable2").hide();
                        $("#passTable3").hide();
                        $("#passTable4").hide();
                        $("#passTable5").hide();
            
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
                        //add a button for each pass table
                        $("#passButtonHolder").append("<button type='input' class='btn btn-primary rounded' id='passButton"
                        + passNumber + "' >pass " + passNumber + "</button>");
                        //add table html with relevant satellite data to the table body
                        $("#passTable"+ passNumber +"Body").append("<tr> <th scope='row' id='passStart'>Start</th> <td id='startDates'>" + localStartDate + 
                        "</td> <td id='startTimes'>" + localStartTime + 
                        "</td> <td id='startCoordinates'>" + response.passes[i].startAz + 
                        "&deg; (" + response.passes[i].startAzCompass +
                        ")</td> <td id='startEls'>" + response.passes[i].startEl +
                        "&deg;</td></tr> <tr> <th scope='row' id='passMaxnumbers'>Maximum Elevation</th> <td id='maxDates'>" + localMaxDate + 
                        "</th> <td id='maxTimes'>" + localMaxTime +   
                        "</td> <td id='endCoordinates'>" + response.passes[i].maxAz + 
                        "&deg; (" + response.passes[i].maxAzCompass + 
                        ")</td> <td id='maxEls'>" + response.passes[i].maxEl +  
                        "&deg;</td></tr> <tr> <th scope='row' id='passEndnumbers'>End</th> <td id='endDates'>" + localEndDate + 
                        "</th> <td id='endTimes'>" + localEndTime +   
                        "</td> <td id='endCoordinates'>" + response.passes[i].endAz + 
                        "&deg; (" + response.passes[i].endAzCompass + 
                        ")</td> <td id='endEls'>" + response.passes[i].endEl +
                        "&deg;</td></tr>");
                        $("#passTable1").show();
                        $("#passTable2").hide();
                        $("#passTable3").hide();
                        $("#passTable4").hide();
                        $("#passTable5").hide();
                    } 
                } 

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
            }
        });
            
        
       

    });

   

    //My Favorites Button
    $("#myFav").on("click", "p", function(){
        // alert("hi");
        userSearch = $(this).text();
        var data_string = $(this).text();
        var data_array = data_string.split(", ");
        console.log("data_array="+data_array);
        var cityName = data_array[0];
        var lattitude = data_array[1];
        var longtitude = data_array[2];
        // callWeatherApi(lattitude,longtitude,cityName);
        // $("#weatherDisplay").show();
        // $(".mainDisplayCard").show();
        // $(".satTypeDisplay").show();
        // $("#satelliteInfo").show();
        postSearchDisplay();
        satTypeSelect = "Global Positioning System (GPS)";
        mainFunction();
        getWiki();
    });
    //hide and show appropriate tables when the corresponding buttons are pushed
    $(document).on('click', '#passButton1', function() {
        $("#passTable1").show();
        $("#passTable2").hide();
        $("#passTable3").hide();
        $("#passTable4").hide();
        $("#passTable5").hide();
    });

    $(document).on('click', '#passButton2', function() {
        $("#passTable1").hide();
        $("#passTable2").show();
        $("#passTable3").hide();
        $("#passTable4").hide();
        $("#passTable5").hide();
    });

    $(document).on('click', '#passButton3', function() {
        $("#passTable1").hide();
        $("#passTable2").hide();
        $("#passTable3").show();
        $("#passTable4").hide();
        $("#passTable5").hide();
    });

    $(document).on('click', '#passButton4', function() {
        $("#passTable1").hide();
        $("#passTable2").hide();
        $("#passTable3").hide();
        $("#passTable4").show();
        $("#passTable5").hide();
    });

    $(document).on('click', '#passButton5', function() {
        $("#passTable1").hide();
        $("#passTable2").hide();
        $("#passTable3").hide();
        $("#passTable4").hide();
        $("#passTable5").show();
    });

});


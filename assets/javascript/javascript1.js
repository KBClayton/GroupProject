

    var prevSearches = [];
    var savedSearches =[];
    var topSearches=[];

    $("#mapsBtn").hide();
    $("#satBtn").hide();
    $("#weathBtn").hide();

$(document).ready(function(){


    //Submit Click Button
    $("#submitBtn").on("click", function(){
        //Clear WikiDisplay
        $("#wikiDisplay").empty();
        var userSearch = $("#userSearch").val().trim();

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

});
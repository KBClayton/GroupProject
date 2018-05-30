//Wikipedia API from Search
function wikiSubmit(){
    var userSearch = $("#userSearch").val().trim();
    //Clear WikiDisplay
    $("#wikiDisplay").empty();
    var queryURL = ("https://en.wikipedia.org/w/api.php?format=json&titles=" + userSearch + "&action=query&prop=extracts&exintro=&explaintext=");
    var queryURLBasic =   ("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + userSearch +"&srwhat=text&srprop=timestamp&continue=&format=json");
            
    //Get Closest Title//
    $.ajax({
        url:queryURLBasic,
        method:"GET",
        dataType: "JSONP",
    }).
    then(function(response){
        // console.log(response);
        // get the page Title
        var pageTitle = response.query.search[0].title;
        var pageid=response.query.search[0].pageid;
        var queryURL = ("https://en.wikipedia.org/w/api.php?format=json&titles=" + pageTitle + "&action=query&prop=extracts&exsectionformat=plain&exintro=&explaintext=&");
            
        //Search by Title to Get more indepth Data
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
                title.addClass("border-bottom font-weight-bold");
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
    }); 
};
//Wikipedia API from Previous
function getWiki(){
    $("#wikiDisplay").empty();
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
//Wikipedia From Satellite
var satWikiSearch;
function satWiki(){
    satWikiSearch = $(this).text().replace(" ", "%20");
    $("#wikiDisplay").empty();
    var queryURLBasic =   ("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + satWikiSearch +"&srwhat=text&srprop=timestamp&continue=&format=json");
    console.log("wiki: " + queryURLBasic);
    console.log("satWikiSearch: " + satWikiSearch)
    $.ajax({
        url:queryURLBasic,
        method:"GET",
        dataType: "JSONP",
    }).
    then(function(response){
        // get the page Title
        console.log(response);
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


$(".satSelectorBtn").on("click", function(){
    $(this).text()
});
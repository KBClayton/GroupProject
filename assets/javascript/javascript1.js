$(document).ready(function(){

    $("#submitBtn").on("click", function(){
        $("#wikiDisplay").empty();
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



        })
    });

});
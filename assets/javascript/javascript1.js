$(document).ready(function(){

    $("#submitBtn").on("click", function(){
        $("#wikiDisplay").empty();
        var userSearch = $("#userSearch").val().trim();
            // userSearch = userSearch.replace(" ", "%20");
        var queryURLBasic =   ("https://en.wikipedia.org/w/api.php?action=query&titles="+ userSearch +"&prop=revisions&rvprop=content&format=json&formatversion=2");
        var queryURL =      ("https://en.wikipedia.org/w/api.php?format=json&titles=" + userSearch + "&action=query&prop=extracts&exintro=&explaintext=&");
        console.log(queryURLBasic);

        $.ajax({
            url:queryURLBasic,
            method:"GET",
            dataType: "JSONP",
        }).
            then(function(response){
                // console.log(response);
                debugger;
                    // get the page IDs
	            // var pageid = [];
	            // for( var id in response.query.pages ) {
		        //     pageid.push( id );
                // };
            //     console.log(pageid);
            //     console.log(response);
            //     debugger;

            // var card=$("<div>");
            //     card.addClass("card mt-3 p-3 anyClass");
            // var title=$("<h4>");
            //     title.text(response.query.pages[pageid].title);
            // var paragraph=$("<p>");
            //     paragraph.text(response.query.pages[pageid].extract);
            // var wikiLink=$("<a>");
            //     wikiLink.attr("href", 'https://en.wikipedia.org/wiki/' + response.query.pages[pageid].title);
            //     wikiLink.attr("target", "_blank");
            //     wikiLink.text("Wikipedia");
            //     card.append(title, paragraph, wikiLink);

            // $("#wikiDisplay").html(card);
        });

        //KINDA WORKING//
        // $.ajax({
        //     url:queryURL,
        //     method:"GET",
        //     dataType: "JSONP",
        // }).
        //     then(function(response){
        //             // get the page IDs
	    //         var pageid = [];
	    //         for( var id in response.query.pages ) {
		//             pageid.push( id );
        //         };
        //         console.log(pageid);
        //         console.log(response);
        //         debugger;

        //     var card=$("<div>");
        //         card.addClass("card mt-3 p-3 anyClass");
        //     var title=$("<h4>");
        //         title.text(response.query.pages[pageid].title);
        //     var paragraph=$("<p>");
        //         paragraph.text(response.query.pages[pageid].extract);
        //     var wikiLink=$("<a>");
        //         wikiLink.attr("href", 'https://en.wikipedia.org/wiki/' + response.query.pages[pageid].title);
        //         wikiLink.attr("target", "_blank");
        //         wikiLink.text("Wikipedia");
        //         card.append(title, paragraph, wikiLink);

        //     $("#wikiDisplay").html(card);
        // });
    });

});
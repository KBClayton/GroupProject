$(".dropDown").hide();
$("#latSearch").hide();
$("#longSearch").hide();
$("div#satBtn").addClass("border-bottom-0");
//Maps Button Show
$("#mapsBtn").click(function(){
    $("div#mapsBtn").addClass("border-bottom-0");
    $("div#weathBtn").removeClass("border-bottom-0");
    $("div#satBtn").removeClass("border-bottom-0");
    $("#mapsDisplay").show();
    $("#satelliteDisplay").hide();
    $(".weatherCard").hide();
});
//Satellite Button Show
$("#satBtn").click(function(){
    $("div#satBtn").addClass("border-bottom-0");
    $("div#weathBtn").removeClass("border-bottom-0");
    $("div#mapsBtn").removeClass("border-bottom-0");
    $("#mapsDisplay").hide();
    $("#satelliteDisplay").show();
    $(".weatherCard").hide();
});
//Weather Button Show
$("#weathBtn").click(function(){
    $("div#weathBtn").addClass("border-bottom-0");
    $("div#satBtn").removeClass("border-bottom-0");
    $("div#mapsBtn").removeClass("border-bottom-0");
    $("#mapsDisplay").hide();
    $("#satelliteDisplay").hide();
    $(".weatherCard").show();
});
//Opens or Closes Favorites Tab
$("#myFavDisplay").click(function(){
    var state = $(this).attr("data-state");
    if (state === "open"){
        $(".dropDown").show();
        $(this).attr("data-state", "closed")
    }
    if (state === "closed"){
        $(".dropDown").hide();
        $(this).attr("data-state", "open")
    };
});
//Back To Search Display Button
$("#backToSearch").on("click", function(){
    pageLoadDisplay();
    $("#searchBar").show();
});
//Page Load Display Function
function pageLoadDisplay(){
    $(".mainDisplayCard").hide();
    $(".satTypeDisplay").hide();
    $("#satelliteInfo").hide();
};
//Submit Button Display Function
function postSearchDisplay(){
    $("#mapsDisplay").hide();
    $("#satelliteDisplay").show();
    $(".weatherCard").hide();
    $(".mainDisplayCard").show();
    $(".satTypeDisplay").hide();
    $("#satelliteInfo").hide();
    $("#searchBar").hide();
};




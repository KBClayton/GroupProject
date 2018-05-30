$(".dropDown").hide();
$("#latSearch").hide();
$("#longSearch").hide();
//Maps Button Show
$("#mapsBtn").click(function(){
    $("#mapsDisplay").show();
    $("#satelliteDisplay").hide();
    $(".weatherCard").hide();
});
//Satellite Button Show
$("#satBtn").click(function(){
    $("#mapsDisplay").hide();
    $("#satelliteDisplay").show();
    $(".weatherCard").hide();
});
//Weather Button Show
$("#weathBtn").click(function(){
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




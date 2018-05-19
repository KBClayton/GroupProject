$("#mapsBtn").click(function(){
    $("#mapsDisplay").show();
    $("#satelliteDisplay").hide();
    $("#weatherDisplay").hide();
});

$("#satBtn").click(function(){
    $("#mapsDisplay").hide();
    $("#satelliteDisplay").show();
    $("#weatherDisplay").hide();
});

$("#weathBtn").click(function(){
    $("#mapsDisplay").hide();
    $("#satelliteDisplay").hide();
    $("#weatherDisplay").show();
});

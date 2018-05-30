
    //Start Clayton's variables
    // observer_location needs to be the observer information from the input
    var observer_location = {lat: 30, lng: -97};
    //tlestring needs to be the tle response from the n2yo tle search api (response.tle)
    //var tlestring="1 25544U 98067A   18138.88883277 +.00001406 +00000-0 +28541-4 0  9997\r\n2 25544 051.6394 164.7606 0004002 099.1102 320.7609 15.54070224113965";
    //startUTC and endUTC are from pass data from n2yo pass (visual or radio) search api (response.passes[0].startUTC and response.passes[0].endUTC)
    var startUTC=1526901635;
    var endUTC=1526902240;
    //other time variables
    var setback_time;
    var setbackutc;
    var roll_endUTC;
    var interval_time;
    //map variables so they can be reached globally
    var marker_roll_start;
    var marker_roll_start_pos;
    var mean_motion=100.01;
    var marker_roll_end;
    var marker_roll_end_pos;
    var observer_marker;
    var marker_enter;
    var marker_exit;
    var satPath;
    var marker_array=[];
    //elevation & elevator to get return from google elevation query
    var elevation=0;
    var elevator;
    //End Clayton's variables

    //Start Clayton's Object
    var mapobject = {
        initial_map: function(){
            observer_location.lat = parseFloat(latSearch);
            observer_location.lng= parseFloat(longSearch);
            observer_marker = new google.maps.Marker({
                position: observer_location,
                title:"Observation Point",
            });
            map.setCenter(new google.maps.LatLng( latSearch, longSearch));
            map.setZoom(3);
            observer_marker.setMap(map);
            marker_array.push(observer_marker);
        },
        elevation: function(){
            elevator = new google.maps.ElevationService;
            elevator.getElevationForLocations({
                'locations': [observer_location]
              }, function(results, status) {
                if (status === 'OK') {
                  if (results[0]) {
                        elevation=results[0].elevation;
                  } else {
                    console.log('No results found');
                  }
                } else {
                  console.log('Elevation service failed due to: ' + status);
                }
              });
        },
        draw: function(){
            //tlestring split into 2 parts for entry into sattelite 
            var tle1=tlestring.split("\r\n")[0];
            var tle2=tlestring.split("\r\n")[1];
            mean_motion=parseFloat(tle2.substring(52, 62));
            if (mean_motion<1.0031 && 1.0021<mean_motion){
                console.log("Probably geostationary or geosynchronous, map will be point or small line");
            }
            //sattelite object ititalized with tle elements
            var satrec = satellite.twoline2satrec(tle1, tle2);
            //loop to build path between entry and exit points
            for(var i=0; i<passArray.length; i++ ){
                startUTC=passArray[i].startUTC;
                endUTC=passArray[i].endUTC;
                //entry point code
                var starttime=moment.utc(startUTC,'X').toDate();
                console.log(starttime);
                var positionAndVelocity = satellite.propagate(satrec, starttime);
                var positionEci = positionAndVelocity.position;
                var velocityEci = positionAndVelocity.velocity;
                console.log("starttime: "+starttime);
                var gmst = satellite.gstime(starttime);
                console.log("gmst: "+gmst);
                console.log("positionEci: "+positionEci);
                var positionGd = satellite.eciToGeodetic(positionEci, gmst);
                var longitude = positionGd.longitude;
                var latitude  = positionGd.latitude;
                var longitudeStr = satellite.degreesLong(longitude);
                var latitudeStr  = satellite.degreesLat(latitude);
                //google map code for entry point merker
                var enter={lat: latitudeStr, lng: longitudeStr };
                marker_enter = new google.maps.Marker({
                    position: enter,
                    title: "Enters visibility on pass "+(i+1)+" on "+moment.utc(startUTC, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(startUTC, 'X').local().format('h:mm:ss a')
                });
                marker_array.push(marker_enter);
                marker_enter.setMap(map); 

                //exit point code
                var endtime=moment.utc(endUTC,'X').toDate();
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
                    title: "Leaves visibility on pass "+(i+1)+" on "+moment.utc(endUTC, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(endUTC, 'X').local().format('h:mm:ss a')
                });
                marker_array.push(marker_exit);
                marker_exit.setMap(map);

                //draw line between entry and exit
                var satPathCoordinates = [];
                satPathCoordinates.push({lat: latitudeStr, lng: longitudeStr});
                //intervening points on pass
                var visual_increment=(endUTC-startUTC)/100;
                var visual_time=0;
                for(var i=1; i<100; i++){
                    var vistime=moment.utc((startUTC+(i*visual_increment)),'X').toDate();
                    var vis_positionAndVelocity = satellite.propagate(satrec, vistime);
                    var vis_positionEci = vis_positionAndVelocity.position;
                    var vis_velocityEci = vis_positionAndVelocity.velocity;
                    var vis_gmst = satellite.gstime(vistime);
                    var vis_positionGd = satellite.eciToGeodetic(vis_positionEci, vis_gmst);
                    var vis_longitude = vis_positionGd.longitude;
                    var vis_latitude  = vis_positionGd.latitude;
                    var vis_longitudeStr = satellite.degreesLong(vis_longitude);
                    var vis_latitudeStr  = satellite.degreesLat(vis_latitude);
                    satPathCoordinates.push({lat: vis_latitudeStr, lng: vis_longitudeStr});
                }
                satPathCoordinates.push({lat: exit_latitudeStr, lng: exit_longitudeStr});
                satPath = new google.maps.Polyline({
                    path: satPathCoordinates,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                satPath.setMap(map);
                marker_array.push(satPath);
            }   
            //set time to draw orbit for
            setback_time=100;
            interval_time=5;
            if(10<=mean_motion){
                setback_time=3600;
                interval_time=7.2;
            }
            if(4<mean_motion && mean_motion<10){
                setback_time=36000;
                interval_time=72;
            }
            if(2<mean_motion && mean_motion<=4){
                setback_time=180000;
                interval_time=360;
            }
            if(1.4<=mean_motion && mean_motion<=2){
                setback_time=360000;
                interval_time=720;
            }
            if(1.1<=mean_motion && mean_motion<1.4){
                setback_time=9000000;
                interval_time=1800;
            }
            if(mean_motion<1.1){
                setback_time=360000;
                interval_time=720;
            }
            //set up for orbital path data
            var roll_LineCoord=[];
            for(var i=0; i<1000; i++){
                setbackutc=passArray[0].startUTC-setback_time;
                var rolltime=moment.utc((setbackutc+(i*interval_time)),'X').toDate();
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
                if(i===0){
                    marker_roll_start_pos={lat: roll_latitudeStr, lng: roll_longitudeStr};
                }
                if(i===999){
                    marker_roll_end_pos={lat: roll_latitudeStr, lng: roll_longitudeStr};
                    roll_endUTC=setbackutc+(i*interval_time);
                }
            }
            //markers on begin and end  of roll pathpath
            marker_roll_start = new google.maps.Marker({
                position: marker_roll_start_pos,
                title: "Start of orbital path calculation on "+moment.utc(setbackutc, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(setbackutc, 'X').local().format('h:mm:ss a')
            });
            marker_array.push(marker_roll_start);
            marker_roll_start.setMap(map);

            marker_roll_end = new google.maps.Marker({
                position: marker_roll_end_pos,
                title: "End of orbital path calculation on "+moment.utc(roll_endUTC, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(roll_endUTC, 'X').local().format('h:mm:ss a')
            });
            marker_array.push(marker_roll_end);
            marker_roll_end.setMap(map);
            //drawing 
            roll_satPath = new google.maps.Polyline({
                path: roll_LineCoord,
                geodesic: true,
                strokeColor: '#0000FF',
                strokeOpacity: .7,
                strokeWeight: 1
            });
            marker_array.push(roll_satPath);
            roll_satPath.setMap(map);



        },
        map_clear: function (){
            if(marker_array.length>0){
                for(var i=0; i<marker_array.length; i++){
                    marker_array[i].setMap(null)
                }
                marker_array=[];
            }
        }        
    }
    //end Clayton's object

    //Start Clayton's click handler
    $("#mapsBtn").on('click', function(){
        mapobject.map_clear();
        $("#map").css("display", "inline");
        mapobject.initial_map();
        mapobject.elevation();
        mapobject.draw();
    });
    //End Clayton's click handler


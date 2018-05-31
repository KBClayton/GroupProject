
    //Start Clayton's variables
    var observer_location = {lat: 30, lng: -97}; // observer_location needs to be the observer information from the input
    //tlestring needs to be the tle response from the n2yo tle search api (response.tle)
    //var tlestring="1 25544U 98067A   18138.88883277 +.00001406 +00000-0 +28541-4 0  9997\r\n2 25544 051.6394 164.7606 0004002 099.1102 320.7609 15.54070224113965";
    var mean_motion=1.01;     //tle element used to describe the average movement per day, geostationary is 1.0027
    var satrec; //will hold sattelite object
    //time variables
    var startUTC=1526901635; //start of a pass
    var endUTC=1526902240; //end of a pass
    var firstUTC; //first of the first pass
    var finalUTC; //last of the last pass
    var setback_time; //time before first pass to draw orbit
    var setbackutc; //utc time before first pass
    var roll_endUTC;  //end of the calculated path time
    var interval_time; //how long between orbit calculations when drawing out the path
    //map variables so they can be reached globally
    var marker_roll_start;  //marker at beggining of orbit path calculations
    var marker_roll_start_pos; //position at beggining of orbit path calculations
    var marker_roll_end; //marker at end of orbit path calculation
    var marker_roll_end_pos; //position at end of orbit path calculations
    var observer_marker; //where the observer is from the search
    var marker_enter; // marker at start of a pass
    var marker_exit; //marker at end of pass
    var satPath; //overall path
    var marker_array=[]; // contains all set markers for clearing
    var elevation=0;  //elevation above sea level in meters set by api
    var elevator; //set to google maps function
    //End Clayton's variables

    //Start wait function
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      
      async function wait() {
        await sleep(2000);
    }
    //end wait function


    //Start Clayton's Object
    var mapobject = {
        initial_map: function(){
            observer_location.lat = parseFloat(latSearch);
            observer_location.lng= parseFloat(longSearch);
            observer_marker = new google.maps.Marker({
                position: observer_location,
                icon: 'assets/images/markers/red_MarkerO.png',
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
            //tlestring split into 2 parts for entry into sattelite.min.js
            var tle1=tlestring.split("\r\n")[0]; //line1
            var tle2=tlestring.split("\r\n")[1]; //line2
            mean_motion=parseFloat(tle2.substring(52, 62));
            firstUTC=passArray[0].startUTC;
            finalUTC=passArray[(passArray.length-1)].endUTC;
            satrec = satellite.twoline2satrec(tle1, tle2);  //sattelite object ititalized with tle elements
            //loop to build path between entry and exit points
            for(var i=0; i<passArray.length; i++ ){
                //set time element for pass
                startUTC=passArray[i].startUTC;
                endUTC=passArray[i].endUTC;
                //entry point code for each pass
                var starttime=moment.utc(startUTC,'X').toDate();
                var positionAndVelocity = satellite.propagate(satrec, starttime);
                var positionEci = positionAndVelocity.position;
                var velocityEci = positionAndVelocity.velocity;
                var gmst = satellite.gstime(starttime);
                var positionGd = satellite.eciToGeodetic(positionEci, gmst);
                var longitude = positionGd.longitude;
                var latitude  = positionGd.latitude;
                var longitudeStr = satellite.degreesLong(longitude);
                var latitudeStr  = satellite.degreesLat(latitude);
                //google map code for entry point marker
                var enter={lat: latitudeStr, lng: longitudeStr };
                marker_enter = new google.maps.Marker({
                    position: enter,
                    icon: 'assets/images/markers/purple_MarkerS.png',
                    title: "Start of visibility on pass "+(i+1)+" on "+moment.utc(startUTC, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(startUTC, 'X').local().format('h:mm:ss a')
                });
                marker_array.push(marker_enter);
                marker_enter.setMap(map); 
                //exit point code for each pass
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
                    icon: 'assets/images/markers/yellow_MarkerE.png',
                    title: "End of visibility on pass "+(i+1)+" on "+moment.utc(endUTC, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(endUTC, 'X').local().format('h:mm:ss a')
                });
                marker_exit.setMap(map);
                marker_array.push(marker_exit);
                //draw line between entry and exit
                var satPathCoordinates = [];
                satPathCoordinates.push({lat: latitudeStr, lng: longitudeStr});
                //intervening points on pass
                var visual_increment=(endUTC-startUTC)/200;
                var visual_time=0;
                for(var r=1; r<200; r++){
                    var vistime=moment.utc((startUTC+(r*visual_increment)),'X').toDate();
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
                marker_array.push(satPath);
                satPath.setMap(map);
            }   
            //set time to draw orbit for less for faster objects (mean_motion difference from 1.0027)
            setback_time=100.1;
            interval_time=5.1;
            setback_time=(finalUTC-firstUTC)/100;
            setback_time+=3600;
            interval_time=((finalUTC-firstUTC)+setback_time)/1200;
            var loop_iterations=1000;
            if ((loop_iterations*interval_time) <= ((finalUTC-firstUTC) + setback_time)){
                while((loop_iterations*interval_time) <= ((finalUTC-firstUTC) + setback_time)){
                    loop_iterations+=10;   
                }
            }
            loop_iterations+=30;
            var roll_LineCoord=[];
            for(var i=0; i<loop_iterations; i++){
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
                if(i===(loop_iterations-1)){
                    marker_roll_end_pos={lat: roll_latitudeStr, lng: roll_longitudeStr};
                    roll_endUTC=setbackutc+(i*interval_time);
                }
            }
            //markers on begin and end  of roll path
            marker_roll_start = new google.maps.Marker({
                position: marker_roll_start_pos,
                icon: 'assets/images/markers/orange_MarkerB.png',
                title: "Begining of orbital path calculation on "+moment.utc(setbackutc, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(setbackutc, 'X').local().format('h:mm:ss a')
            });
            marker_array.push(marker_roll_start);
            marker_roll_start.setMap(map);
            marker_roll_end = new google.maps.Marker({
                position: marker_roll_end_pos,
                icon: 'assets/images/markers/brown_MarkerF.png',
                title: "Final orbital path calculation on "+moment.utc(roll_endUTC, 'X').local().format('dddd MMMM Do YYYY')+" at "+moment.utc(roll_endUTC, 'X').local().format('h:mm:ss a')
            });
            marker_array.push(marker_roll_end);
            marker_roll_end.setMap(map);
            //drawing  the roll path
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
                    marker_array[i].setMap(null); //removes markers from map
                }
                marker_array=[]; //clears array
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
        wait().then(function(){
            mapobject.draw();
        });
    });
    //End Clayton's click handler


/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "nowPlayingController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading nowPlayingController" );

        var loglead = "nowPlayingController: ";

        $scope.ui = { isHiding: false, hide: false };

        var _hideShowPromise;

        $scope.shows = [

            {
                time:    "4:00 PM",
                desc:    "Horizon League BBall Final",
                date:    new Date( "3/8/2016 16:00" ),
                channel: 206
            },
            {
                time:    "7:00 PM",
                desc:    "Wizards @ Blazers",
                date:    new Date( "3/8/2016 19:00" ),
                channel: 216
            }
        ]

        function getTVInfo() {

            $http.get( "http://10.1.10.38:8080/tv/getTuned" )
                .then( function ( data ) {

                        $log.debug( "Got some info from DTV!" );

                        if ( !$scope.tvinfo || ($scope.tvinfo.callsign != data.data.callsign) ) {
                            $scope.tvinfo = data.data;

                        }


                    },
                    function ( err ) {

                        $log.error( "Could not contact DTV! Failing in silent agony" );

                    } );

        }

        function modelUpdate( data ) {
            $log.info( loglead + " got a model update: " + angular.toJson( data ) );
            if (data.shows && data.shows.length){
                $log.info( loglead + " got a USEFUL model update: " + angular.toJson( data ) );
                $scope.shows = data.shows;
                $scope.ui.hide = data.hide;
            }

        }

        function inboundMessage( msg ) {
            $log.debug( loglead + "Inbound message..." );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.nowplaying",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { shows: $scope.shows, hide: false }
            } );

        }

        function runHideShow(){

            $log.debug("Hide/show...");
            
            if (!$scope.ui.hide){
                $scope.ui.isHiding = false;
                $timeout( runHideShow, 10000 );
                return;
            }
            
            if ($scope.ui.isHiding){
                //Show for 10sec
                $scope.ui.isHiding = false;
                $timeout(runHideShow, 10000);

            } else {
                //Hide for 60sec
                $scope.ui.isHiding = true;
                $timeout( runHideShow, 30000 );

            }


        }

        updateFromRemote();
        $interval( getTVInfo, 5000 );
        //runHideShow();


    } );

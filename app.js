
	/*
	GIS day Postgis + Geosever + Openlayers 3 demo
	*/
 	/*
    this application renders geographical data onto a map in a browser.
    it is based on the openLayers 3 library.
    */


	
	//manually defining crs using proj4js
	//defs for EPSG:32737 from spatialreference.org
	//proj4.defs("EPSG:32737","+proj=utm+zone=37+south+ellps=WGS84+datum=WGS84+units=m+no_defs");


	var bounds = [276252.013496858, 9953135.05192152,276289.497092662, 9953168.66465541];
	var center = [276275.52448,9953153.40207];

    /** create layer and source instances **/

	//osm base layer
	/*var osmlayer = new ol.layer.Tile({
		source: new ol.source.MapQuest({layer:'osm'}),
		name: 'Openstreet map'

	});*/
	var format = 'image/png';

	var parcels_untiled_source = new ol.source.ImageWMS({
          ratio: 1,
          url: 'http://localhost:8080/geoserver/GIS_DAY/wms',
          params: {'FORMAT': format,
                   'VERSION': '1.1.1',  
                STYLES: '',
                LAYERS: 'GIS_DAY:athiriverparcels_1',
          }
        })

	var parcels_untiled = new ol.layer.Image({
        source: parcels_untiled_source
      });

	var parcels_tiled_source = new ol.source.TileWMS({
          url: 'http://localhost:8080/geoserver/GIS_DAY/wms',
          params: {'FORMAT': format, 
                   'VERSION': '1.1.1',
                   tiled: true,
                STYLES: '',
                LAYERS: 'GIS_DAY:athiriverparcels_1',
          }
        })

	var parcels_tiled = new ol.layer.Tile({
        visible: false,
        source: parcels_tiled_source 
      });

	//define projection
	var projection = new ol.proj.Projection({
          code: 'EPSG:32737',
          units: 'm',
          axisOrientation: 'neu'
      });


	
	//configure view
	var view = new ol.View({
		projection: projection,
		center: center,
		zoom: 21
	});

	
    //Pop-up elements for displaying attributes of clicked feature
    
	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');

	var mousePositionControl = new ol.control.MousePosition({
          className: 'custom-mouse-position',
          target: document.getElementById('location'),
          coordinateFormat: ol.coordinate.createStringXY(5),
          undefinedHTML: '&nbsp;'
        });

	
 	//click handler to hide the popup.
	closer.onclick = function() {
	    overlay.setPosition(undefined);
	    closer.blur();
	    return false;
	};

	
 	//Create an overlay to anchor the popup to the map.
 	
	var overlay = new ol.Overlay( ({
  		element: container,
  		autoPan: true,
  		autoPanAnimation: {
    	duration: 250
  		}
	}));

	
	//create the map instance
	var map = new ol.Map({
		renderer: 'canvas',//force canvas renderer to be used
		controls: ol.control.defaults().extend([mousePositionControl]),
		layers: [parcels_tiled,parcels_untiled],
		overlays: [overlay],
		target:'map',
		view: view
	});

	// sets the chosen WMS version
      function setWMSVersion(wmsVersion) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'VERSION': wmsVersion});
        });
      }

      // Tiling mode, can be 'tiled' or 'untiled'
      function setTileMode(tilingMode) {
        if (tilingMode == 'tiled') {
          untiled.set('visible', false);
          tiled.set('visible', true);
        } else {
          tiled.set('visible', false);
          untiled.set('visible', true);
        }
      }

      //antialias mode for edge smoothening
      function setAntialiasMode(mode) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'FORMAT_OPTIONS': 'antialias:' + mode});
        });
      }

	//this function changes the cursor to a pointer when cursor is on map
	map.on('pointermove', function(evt) {
		if (evt.dragging) {
		    return;
		}
		var pixel = map.getEventPixel(evt.originalEvent);
		var hit = map.forEachLayerAtPixel(pixel, function(layer) {
		    return true;
		});
		map.getTargetElement().style.cursor = hit ? 'pointer' : '';
	});

	//click handler to the map to render the popup.
	map.on('singleclick', function(evt) {
		var coordinate = evt.coordinate;
		var viewResolution = (view.getResolution());

		//variable to store requested feature info
		if(parcels_untiled_source){
			var featureinfo = parcels_untiled_source.getGetFeatureInfoUrl(
		 	    coordinate, viewResolution,projection, 
		 	    {'INFO_FORMAT': 'text/plain'});
		}else{
			var featureinfo = parcels_tiled_source.getGetFeatureInfoUrl(
		 	    coordinate, viewResolution,projection, 
		 	    {'INFO_FORMAT': 'text/plain'});
		}
		
		content.innerHTML = '<iframe seamless src="' + featureinfo + '"></iframe>';
		overlay.setPosition(coordinate);

		});


	

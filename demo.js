      
      /*
        gis land parcels demo application. Demonstrates the 
        use of postgis, geoserver and open layers
      */

      /*
        this application renders geographical data onto a map in a browser,
        it is based on the openLayers 3 library.
      */



      var format = 'image/png';
      var bounds = [276252.013496858, 9953135.05192152,
                    276289.497092662, 9953168.66465541];
      var center = [276275.52448,9953153.40207];


      /*var mousePositionControl = new ol.control.MousePosition({
              className: 'custom-mouse-position',
              target: document.getElementById('location'),
              coordinateFormat: ol.coordinate.createStringXY(5),
              undefinedHTML: '&nbsp;'
            });*/

      //untiled layer
      var untiled = new ol.layer.Image({
        source: new ol.source.ImageWMS({
          ratio: 1,
          url: 'http://localhost:8080/geoserver/GIS_DAY/wms',
          params: {'FORMAT': format,
                   'VERSION': '1.1.1',  
                STYLES: '',
                LAYERS: 'GIS_DAY:athiriverparcels_1',
          }
        })
      });

      //tiled layer
      var tiled = new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
          url: 'http://localhost:8080/geoserver/GIS_DAY/wms',
          params: {'FORMAT': format, 
                   'VERSION': '1.1.1',
                   tiled: true,
                STYLES: '',
                LAYERS: 'GIS_DAY:athiriverparcels_1',
          }
        })
      });

      var projection = new ol.proj.Projection({
          code: 'EPSG:32737',
          units: 'm',
          axisOrientation: 'neu'
      });

      var map = new ol.Map({
        controls: ol.control.defaults({
          attribution: false
        }).extend([mousePositionControl]),
        target: 'map',
        layers: [
          tiled,
          untiled
        ],
        view: new ol.View({
           projection: projection,
           center: center,
           zoom: 21
        })
      });


      // sets the chosen WMS version
      function setWMSVersion(wmsVersion) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'VERSION': wmsVersion});
        });
      }

      // Tiling mode, layer can be 'tiled' or 'untiled'
      function setTileMode(tilingMode) {
        if (tilingMode == 'tiled') {
          untiled.set('visible', false);
          tiled.set('visible', true);
        } else {
          tiled.set('visible', false);
          untiled.set('visible', true);
        }
      }

      /*function setAntialiasMode(mode) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'FORMAT_OPTIONS': 'antialias:' + mode});
        });
      }*/

      // changes the current tile format
      function setImageFormat(mime) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'FORMAT': mime});
        });
      }

      //sets style
      function setStyle(style){
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'STYLES': style});
        });
      }

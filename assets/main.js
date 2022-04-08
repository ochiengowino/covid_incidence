var clickedCoord = []
var geojsonObj = {}
var heatMapLayer
var dataLayer
var clusterLayer
var hexbin, layer, binSize;
//  Initiating map
var viewMap = new ol.View({
    center: ol.proj.fromLonLat([36.8219, 1.2921]),
    zoom: 7
});

var basemapLayer = new ol.source.OSM();

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: basemapLayer
                // source: new ol.source.Stamen({
                //     layer: 'toner'
                // })
        })
    ],
    view: viewMap
});

// Define vector source
var drawSource = new ol.source.Vector();

// Define vector layer
var drawLayer = new ol.layer.Vector({
    source: drawSource
});

// add layer to map
map.addLayer(drawLayer);

// Initiate a draw interaction
var draw = new ol.interaction.Draw({
    type: 'Point',
    source: drawSource
});

// upon start draw interaction
draw.on('drawstart', function(e) {
    e.preventDefault();
    // alert('point added')
    drawSource.clear();
});

// Enable draw interaction
function startDrawing() {
    map.addInteraction(draw);
}

// end interaction
draw.on('drawend', function(e) {
    e.preventDefault();
    // alert('point added')
    clickedCoord = e.feature.getGeometry().getFlatCoordinates();
    console.log('clicked at: ', e.feature.getGeometry().getFlatCoordinates());
    $("#addPointModal").modal('show');
    map.removeInteraction(draw);
});

$(".closeModalBtn").on('click', function() {
    $("#addPointModal").modal('hide');
})


// Save data to db
$(document).ready(function() {
    $('#saveBtn').on('click', function(e) {
        if ($('#add-data-form')[0].checkValidity()) {
            e.preventDefault();
            // console.log('clcked')
            var name = document.getElementById('name').value;
            var condition = document.getElementById('condition').value;
            var long = clickedCoord[0];
            var lat = clickedCoord[1];
            if (name != '' && condition != '' && long != '' && lat != '') {

                $.ajax({
                    url: 'save_data.php',
                    type: 'POST',
                    data: {
                        name: name,
                        condition: condition,
                        long: long,
                        lat: lat
                    },
                    success: function(response) {
                        // console.log(response);
                        var result = JSON.parse(response);

                        if (result.statusCode == 200) {
                            $('#add-data-form')[0].reset();
                            $("#addPointModal").modal('hide');
                            // console.log('data added successfully');
                        } else {
                            console.log('somethng went wrong')
                        }
                    }
                })
            } else {
                alert("Something went wrong");
            }
            // console.log(long, lat)
        }
    })
});


function createGeoJSON(dataArray) {
    // console.log(dataArray)
    geojsonObj['type'] = "FeatureCollection"
    var features = [];
    for (i = 0; i < dataArray.length; i++) {
        var featObj = {}
        featObj['type'] = "Feature"
        featObj['properties'] = {
            'name': dataArray[i].name,
            'condition': dataArray[i].condition
        }
        featObj['geometry'] = JSON.parse(dataArray[i].st_asgeojson)

        features.push(featObj)
    }
    geojsonObj['features'] = features
        // console.log(geojsonObj['features'])
    var dataSource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(geojsonObj)
    });

    heatMapLayer = new ol.layer.Heatmap({
        source: dataSource
    });

    dataLayer = new ol.layer.Vector({
        source: dataSource,
        // style: new ol.style.Style({
        //     image: new ol.style.Circle({
        //         fill: new ol.style.Fill({
        //             color: '#ff0000'
        //         }),
        //         radius: 3
        //     })
        // })
        style: function(feature) {
            // console.log(feature.values_.name)
            if (feature.values_.condition == 'fever') {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: '#0000FF'
                        }),
                        radius: 4
                    })
                })
            } else if (feature.values_.condition == 'cough') {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: '#FF0000'
                        }),
                        radius: 4
                    })
                })
            } else if (feature.values_.condition == 'sore-throat') {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: '#800080'
                        }),
                        radius: 4
                    })
                })
            } else if (feature.values_.condition == 'headache') {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: '#FFA500'
                        }),
                        radius: 4
                    })
                })
            } else if (feature.values_.condition == 'breathing') {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: '#FFFF00'
                        }),
                        radius: 4
                    })
                })
            } else if (feature.values_.condition == 'covid') {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: '#00FF00'
                        }),
                        radius: 4
                    })
                })
            }
        }
    });

    // cluster
    var clusterSource = new ol.source.Cluster({
        source: dataSource,
        distance: parseInt(40, 10)
    });

    var styleCache = {};
    clusterLayer = new ol.layer.Vector({
        source: clusterSource,
        style: function(feature) {
            var size = feature.get('features').length;
            let style = styleCache[size];
            if (!style) {
                style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        stroke: new ol.style.Stroke({
                            color: '#fff',
                        }),
                        fill: new ol.style.Fill({
                            color: '#3399CC',
                        }),
                    }),
                    text: new ol.style.Text({
                        text: size.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff',
                        }),
                    }),
                });
                styleCache[size] = style;
            }
            return style;
        },
    });

    // Vector source
    // var source = new ol.source.Vector();
    var source = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(geojsonObj)
    });
    // add 2000 features
    // addFeatures(2000);
    // Interaction to move the source features
    var modify = new ol.interaction.Modify({ source: source });
    modify.setActive(false);
    map.addInteraction(modify);
    var layerSource = new ol.layer.Vector({ source: source, visible: false })
    map.addLayer(layerSource);


    // var style = $("#style");
    var style = 'color';
    var min, max, maxi;
    var minRadius = 1;
    var styleFn = function(f, res) {
        switch (style) {
            // Display a point with a radius 
            // depending on the number of objects in the aggregate.
            case 'point':
                {
                    var radius = Math.round(binSize / res + 0.5) * Math.min(1, f.get('features').length / max);
                    if (radius < minRadius) radius = minRadius;
                    return [new ol.style.Style({
                            image: new ol.style.RegularShape({
                                points: 6,
                                radius: radius,
                                fill: new ol.style.Fill({ color: [0, 0, 255] }),
                                rotateWithView: true
                            }),
                            geometry: new ol.geom.Point(f.get('center'))
                        })
                        //, new ol.style.Style({ fill: new ol.style.Fill({color: [0,0,255,.1] }) })
                    ];
                }
                // Display the polygon with a gradient value (opacity) 
                // depending on the number of objects in the aggregate.
            case 'gradient':
                {
                    var opacity = Math.min(1, f.get('features').length / max);
                    return [new ol.style.Style({ fill: new ol.style.Fill({ color: [0, 0, 255, opacity] }) })];
                }
                // Display the polygon with a color
                // depending on the number of objects in the aggregate.
            case 'color':
            default:
                {
                    var color;
                    if (f.get('features').length > max) color = [136, 0, 0, 1];
                    else if (f.get('features').length > min) color = [255, 165, 0, 1];
                    else color = [0, 136, 0, 1];
                    return [new ol.style.Style({ fill: new ol.style.Fill({ color: color }) })];
                }
        }
    };



    // Create HexBin and calculate min/max
    function reset(givnSize) {
        // var size = Number($('#size').val());
        var size = givnSize;
        if (layer) map.removeLayer(layer);
        binSize = size;
        var features;
        hexbin = new ol.source.HexBin({
            source: source, // source of the bin
            size: size // hexagon size (in map unit)
        });
        // var vClass = ($("#image").prop('checked') ? ol.layer.VectorImage : ol.layer.Vector)
        // layer = new vClass({
        //     source: hexbin,
        //     opacity: 0.5,
        //     style: styleFn 
        // });

        layer = new ol.layer.Vector({
            source: hexbin,
            opacity: 0.5,
            style: styleFn,
            renderMode: 'image'
        });

        features = hexbin.getFeatures();
        // Calculate min/ max value
        min = Infinity;
        max = 0;
        for (var i = 0, f; f = features[i]; i++) {
            var n = f.get('features').length;
            if (n < min) min = n;
            if (n > max) max = n;
        }
        var dl = (max - min);
        maxi = max;
        min = Math.max(1, Math.round(dl / 4));
        max = Math.round(max - dl / 3);
        $(".min").text(min);
        $(".max").text(max);
        $('.imin').val(min);
        $('.imax').val(max);

        // Add layer
        // map.addLayer(layer);
    }
    // reset(Number($("#size").val()));
    reset(50000);

    $('.interval').on('change', function() {
        min = Number($('.imin').val()) || min;
        max = Number($('.imax').val()) || max;
        $(".min").text(min);
        $(".max").text(max);
        hexbin.changed();
    })

    map.on('moveend', moveEndFunc)

    map.addLayer(dataLayer)
        // map.addLayer(clusterLayer)
        // map.addLayer(heatMapLayer)
}

var moveEndFunc = function(e) {

    var currentZoomLevel = map.getView().getZoom();

    if (currentZoomLevel > 18) {
        reset(5000)
    } else if (currentZoomLevel > 16) {
        reset(10000)
    } else if (currentZoomLevel > 14) {
        reset(15000)
    } else if (currentZoomLevel > 12) {
        reset(20000)
    } else if (currentZoomLevel > 10) {
        reset(25000)
    } else if (currentZoomLevel > 8) {
        reset(30000)
    } else if (currentZoomLevel > 6) {
        reset(35000)
    } else if (currentZoomLevel > 4) {
        reset(40000)
    } else if (currentZoomLevel > 2) {
        reset(45000)
    }
};

function addLayers(param) {

    if (param == 'heatmap') {
        map.addLayer(heatMapLayer);
        map.removeLayer(clusterLayer);
        map.removeLayer(dataLayer);
        map.removeLayer(layer);
        map.un('moveend', moveEndFunc);
    } else if (param == 'attributes') {
        map.addLayer(dataLayer);
        map.removeLayer(heatMapLayer);
        map.removeLayer(clusterLayer);
        map.removeLayer(layer);
        map.un('moveend', moveEndFunc);
    } else if (param == 'cluster') {
        map.addLayer(clusterLayer);
        map.removeLayer(heatMapLayer);
        map.removeLayer(dataLayer);
        map.removeLayer(layer);
        map.un('moveend', moveEndFunc);
    } else if (param == 'clusterColor') {
        map.addLayer(layer);
        map.removeLayer(clusterLayer);
        map.removeLayer(heatMapLayer);
        map.removeLayer(dataLayer);
        map.on('moveend', moveEndFunc);
    }
}
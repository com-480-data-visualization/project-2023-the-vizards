
const DEPARTURE_DELAY_COLOR = "#d45a08"
const ARRIVAL_DELAY_COLOR = "#1f77b4"

/// ------------------ ///
///        LINES       ///
/// ------------------ ///

/**
 * Function to load lines data from a JSON file.
 * @returns {Promise} Promise object representing the loaded lines data.
 */
function loadLines() {
    return new Promise((resolve, reject) => {
        fetch('data/final_lines.geojson').then(function (res) {
            return res.json();
        }).then(function (data) {
            var geojson = data;
            var linesMesh = {};
            var displayableLines = [];

            geojson.features.forEach(function (feature, i) {
                if (feature.geometry.type === 'LineString') {
                    var line = new maptalks.LineString(feature.geometry.coordinates);

                } else if (feature.geometry.type === 'MultiLineString') {
                    var line = new maptalks.MultiLineString(feature.geometry.coordinates);
                }
                const mesh = threeLayer.toExtrudeLine(line, {
                    width: 15 + i * 0.01,
                    height: 1 + i * 0.01,
                    line_name: feature.properties.line,
                }, new THREE.MeshPhongMaterial({
                    color: feature.properties.color
                }));

                const lineKey = feature.properties.line;
                if (!linesMesh[lineKey]) {
                    linesMesh[lineKey] = [];
                }
                linesMesh[lineKey].push(mesh);

                displayableLines.push({
                    value: feature.properties.line,
                    color: feature.properties.color
                });
                if (i == geojson.features.length - 1) {
                    resolve({
                        linesMesh: linesMesh,
                        displayableLines: displayableLines
                    })
                }
            });
        });
    })
}

/**
 * Function to hide all line meshes from the scene.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 */
function hideAllLines(linesMesh) {
    for (let key in linesMesh) {
        linesMesh[key].forEach(function (geometry) {
            threeLayer.removeMesh(geometry);
        });
    }
}

/**
 * Function to show all line meshes in the scene.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 */
function showAllLines(linesMesh) {
    //var selectedLine = document.getElementById('lineSelect').value;

    for (let key in linesMesh) {
        //let visible = (key === selectedLine);
        linesMesh[key].forEach(function (geometry) {
            //if (visible) return;
            threeLayer.addMesh(geometry);
        });
    }
}

/**
 * Function to update the visibility of line and delay meshes based on the selected line and day.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 * @param {Object} delaysMesh - Object containing delay meshes grouped by key.
 */
function updateVisibilityLine(linesMesh, delaysMesh) {
    var selectedLine = document.getElementById('lineSelect').value;
    var selectedDay = document.getElementById('daySelect').value;

    for (var key in delaysMesh) {
        var visible = (key === selectedDay + '-' + selectedLine);
        delaysMesh[key].forEach(function (geometry) {
            if (visible) {
                threeLayer.addMesh(geometry);
                return;
            }
            threeLayer.removeMesh(geometry);
        });
    }

    for (var key in linesMesh) {
        var visible = (key === selectedLine);
        linesMesh[key].forEach(function (geometry) {
            if (visible) {
                threeLayer.addMesh(geometry);
                centerOnLine(geometry);
                return;
            }
            threeLayer.removeMesh(geometry);
        });
    }
}

/// ------------------ ///
///       DELAYS       ///
/// ------------------ ///

/**
 * Function to load delays data from a JSON file.
 * @returns {Promise} Promise object representing the loaded delays data.
 */
function loadDelays() {
    return new Promise((resolve, reject) => {
        fetch('data/lines_delays.geojson').then(function (res) {
            return res.json();
        }).then(function (data) {
            var geojson = data;

            var delaysMesh = {};
            var linesWithDelays = new Set();

            geojson.features.forEach(function (feature, i) {
                var arrival_delay = threeLayer.toExtrudePolygon(feature, {
                    height: (feature.properties.arrival_delay > 0 ? feature.properties.arrival_delay * 10 : 0) + 0.01,
                    altitude: 0,
                    arrival_delay: feature.properties.arrival_delay,
                    stop_name: feature.properties.stop_name,
                }, new THREE.MeshPhongMaterial({
                    color: ARRIVAL_DELAY_COLOR,
                    opacity: 1,
                    transparent: false,
                    side: 'DoubleSide'
                }));

                var departure_delay = threeLayer.toExtrudePolygon(feature, {
                    height: feature.properties.departure_delay > 0 ? feature.properties.departure_delay * 10 : 0.02,
                    altitude: (feature.properties.arrival_delay > 0 ? feature.properties.arrival_delay * 10 : 0) + 0.01,
                    departure_delay: feature.properties.departure_delay,
                    stop_name: feature.properties.stop_name,
                }, new THREE.MeshPhongMaterial({
                    color: DEPARTURE_DELAY_COLOR,
                    opacity: 1,
                    transparent: false,
                    side: 'DoubleSide'
                }));

                var groupKey = feature.properties.day_of_week + '-' + feature.properties.line_name;
                if (!delaysMesh[groupKey]) {
                    delaysMesh[groupKey] = [];
                }
                delaysMesh[groupKey].push(arrival_delay);
                delaysMesh[groupKey].push(departure_delay);

                linesWithDelays.add(feature.properties.line_name);

                if (i == geojson.features.length - 1) {
                    resolve({
                        delaysMesh: delaysMesh,
                        linesWithDelays: linesWithDelays,
                        delaysData: geojson.features
                    })
                }
            });
        })
    })
}

/**
 * Function to plot line delays on a bar chart.
 * @param {Array} linesDelays - Array of objects representing line delays data.
 * @param {Array} optionsLines - Array of objects representing line options.
 */
function plotLineDelays(linesDelays, optionsLines) {
    fetch('data/lines.json')
        .then((response) => response.json())
        .then((linesData) => {
            var traces = [];

            var lineName = document.getElementById('lineSelect').value;
            var day_of_week = document.getElementById('daySelect').value;

            var color = optionsLines.find(line => line.value === lineName).color;
            var line = linesData.find(line => line.name === lineName);

            var stops = line.stops.sort((a, b) => a[0] - b[0]);
            var stops_map = {};
            stops.forEach(function (stop, i) {
                stops_map[stop[1]] = stop[0];
            });


            var delaysData = linesDelays
                .filter(feature => feature.properties.line_name == line.name && Number(feature.properties.day_of_week) == day_of_week && stops.map(s => s[1]).includes(feature.properties.stop_id))
                .sort((a, b) => stops_map[a.properties.stop_id] - stops_map[b.properties.stop_id]);

            // Assuming delaysData is an array with objects containing arrival and departure delay information
            var arrivalDelays = delaysData.map(delay => delay.properties.arrival_delay);
            var departureDelays = delaysData.map(delay => delay.properties.departure_delay);

            var arrivalTrace = {
                x: arrivalDelays,
                y: stops.map(s => s[2]),
                type: 'bar',
                orientation: 'h',
                name: 'Median Arrival Delay (s)'
            };

            var departureTrace = {
                x: departureDelays,
                y: stops.map(s => s[2]),
                type: 'bar',
                orientation: 'h',
                name: 'Median Departure Delay (s)'
            };

            traces.push(arrivalTrace, departureTrace);

            // Create a scatter plot trace for each stop to mimic circular ticks
            stops.map(s => {
                var tickTrace = {
                    x: [0],  // position the circle tick at x=0
                    y: [s[2]],
                    mode: 'markers',
                    marker: {
                        size: 10,  // adjust the size of the circle as per your need
                        color: color  // adjust the color of the circle as per your need
                    },
                    hoverinfo: 'none',  // disable hover for the tick markers
                    showlegend: false  // do not show these traces in the legend
                };
                traces.push(tickTrace);
            });

            var layout = {
                height: stops.length * 50,
                width: document.getElementById('sections').offsetWidth - 20,
                barmode: 'group', // or 'group', 'overlay', etc. depending on how you want to display multiple traces
                yaxis: {
                    dtick: 1, // specify the distance between ticks
                    automargin: true,
                    showline: false
                },
                legend: {
                    x: 0,
                    y: 1.1,
                    orientation: "h",
                    xanchor: "center",
                    yanchor: "top",
                },
                shapes: [  // add a vertical line at x=0
                    {
                        type: 'line',
                        x0: 0,
                        y0: 0,
                        x1: 0,
                        y1: stops.length - 1,
                        line: {
                            color: color,
                            width: 3
                        }
                    }
                ]

            };

            Plotly.newPlot('line-delays-plot', traces, layout, { responsive: true });

            window.onresize = function () {
                Plotly.relayout('line-delays-plot', {
                    width: document.getElementById('sections').offsetWidth - 20
                })
            }
        })
}

/**
 * Function to remove the line delays plot from the chart.
 */
function removeLinePlot() {
    Plotly.purge('line-delays-plot');
}

/**
 * Function to hide all delay meshes from the scene.
 * @param {Object} delaysMesh - Object containing delay meshes grouped by key.
 */
function hideAllDelay(delaysMesh) {
    for (let key in delaysMesh) {
        delaysMesh[key].forEach(function (geometry) {
            threeLayer.removeMesh(geometry);
        });
    }
}


/// ------------------ ///
///    CHAMPIONSHIP    ///
/// ------------------ ///

function loadChampionship(linesMesh, optionsLines) {
    return new Promise((resolve, reject) => {
        // Load the data
        fetch('data/championship.json').then(function (response) {
            return response.json();
        }).then(function (data) {

            const daySelect = document.getElementById('daySelect-2');

            // Update the table whenever the selected day or sort order changes
            daySelect.addEventListener('input', function () {
                updateTable(data, linesMesh, optionsLines)
            });

            document.getElementById('sortSelect').addEventListener('change', function () {
                updateTable(data, linesMesh, optionsLines)
            });

            updateTable(data, linesMesh, optionsLines);
            resolve();
        });
    })
}

/**
 * Function to update the championship table with the provided data.
 * @param {Array} data - Array of objects representing the championship data.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 * @param {Array} optionsLines - Array of objects representing line options.
 */
function updateTable(data, linesMesh, optionsLines) {
    // Get the selected day and sort order
    const daySelect = document.getElementById('daySelect-2');

    var selectedDay = daySelect.value;
    var sortOrder = document.getElementById('sortSelect').value;

    // Filter the data by the selected day and sort it by the selected order
    var filteredData = data.filter(item => item.day_of_week == selectedDay);
    filteredData.sort((a, b) => a[sortOrder] - b[sortOrder]);

    // Generate the table
    var table = document.getElementById('championshipTable');

    var tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    handleHighlight(linesMesh, undefined);
    centerGlobal()

    for (var i = 0; i < filteredData.length; i++) {
        var row = document.createElement('tr');

        var lineName = filteredData[i].line_name;

        // Rank cell
        var rankCell = document.createElement('th');
        rankCell.innerHTML = i + 1;  // Rank is the row number in the sorted list
        row.appendChild(rankCell);

        // Line name cell
        var lineNameCell = document.createElement('td');
        lineNameCell.innerHTML = filteredData[i].line_name;
        row.appendChild(lineNameCell);

        // Arrival delay cell
        var arrivalDelayCell = document.createElement('td');
        arrivalDelayCell.innerHTML = filteredData[i].arrival_delay;
        row.appendChild(arrivalDelayCell);

        // Departure delay cell
        var departureDelayCell = document.createElement('td');
        departureDelayCell.innerHTML = filteredData[i].departure_delay;
        row.appendChild(departureDelayCell);

        row.dataset.line = lineName;




        // Add a hover event listener to highlight the line on the map
        row.addEventListener('click', (function (linesMesh, optionsLines) {
            return function () {
                var lineName = this.dataset.line;

                if (this.disabled) return;

                unhighlightChampionship(optionsLines)

                if (this.selected) {
                    handleHighlight(linesMesh, undefined);
                    centerGlobal()
                    this.selected = false;
                    return
                } else {
                    this.selected = true;
                    handleHighlight(linesMesh, lineName);
                    hightlightRow(this, optionsLines, lineName)
                    this.classList.add('selected');
                }





            }
        })(linesMesh, optionsLines));

        row.addEventListener('mouseover', (function (optionsLines) {
            return function () {
                if (this.disabled) return;
                hightlightRow(this, optionsLines, this.dataset.line)
            }
        })(optionsLines));

        row.addEventListener('mouseleave', (function (optionsLines) {
            return function () {
                if (this.classList.contains('selected')) return;
                unhighlightRow(this, optionsLines, this.dataset.line)
            }
        })(optionsLines));



        // Set the background color of the row to the line color
        var line = optionsLines.filter(x => x.value == lineName)[0]
        row.style.color = line ? line.color : '#ccc';
        row.style.backgroundColor = '#fff';

        if (!line) row.classList.add('disabled')
        else if (line.disabled == true) row.classList.add('disabled')
        row.disabled = line ? line.disabled : true;

        tbody.appendChild(row);
    }
}

function hightlightRow(el, optionsLines, lineName) {
    var lineColor = optionsLines.filter(x => x.value == lineName)[0]
    el.style.backgroundColor = lineColor ? lineColor.color : '#ccc';
    el.style.color = '#fff';
}

function unhighlightRow(el, optionsLines, lineName) {
    var lineColor = optionsLines.filter(x => x.value == lineName)[0]
    el.style.color = lineColor ? lineColor.color : '#ccc';
    el.style.backgroundColor = '#fff';
}

function unhighlightChampionship(optionsLines) {
    document.querySelectorAll('#championshipTable .selected').forEach(function (el) {
        el.classList.remove('selected');
        unhighlightRow(el, optionsLines, el.dataset.line)
    });
}


/**
 * Function to highlight the selected row and line on the championship table and map.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 * @param {string} lineName - Name of the selected line.
 */
function handleHighlight(linesMesh, lineName) {

    if (!lineName) {
        disableAllHighlights(linesMesh)
        return
    }
    for (var line in linesMesh) {
        if (line == lineName) {
            highlightLine(linesMesh, lineName);
        } else {
            removeHighlight(linesMesh, line);
        }
    }
}

/**
 * Function to highlight the specified line on the map.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 * @param {string} lineName - Name of the line to highlight.
 */
function highlightLine(linesMesh, lineName) {
    // Highlight the selected line
    if (!linesMesh[lineName]) return;
    linesMesh[lineName].forEach(function (mesh) {
        centerOnLine(mesh)
        mesh.setSymbol(new THREE.MeshPhongMaterial({
            color: mesh.getSymbol().color,
            opacity: 1,
            transparent: false
        }))
        mesh.object3d.position.z = 1

    });
}

/**
 * Function to remove the highlight from the specified line on the map.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 * @param {string} lineName - Name of the line to remove the highlight from.
 */
function removeHighlight(linesMesh, lineName) {
    if (!linesMesh[lineName]) return;
    linesMesh[lineName].forEach(function (mesh) {
        mesh.setSymbol(new THREE.MeshPhongMaterial({
            color: mesh.getSymbol().color,
            opacity: 0.3,
            transparent: true
        }))
        mesh.object3d.position.z = 0
    });
}

/**
 * Function to disable the highlight from all lines on the map.
 * @param {Object} linesMesh - Object containing line meshes grouped by key.
 */
function disableAllHighlights(linesMesh) {
    for (var line in linesMesh) {
        linesMesh[line].forEach(function (mesh) {
            mesh.setSymbol(new THREE.MeshPhongMaterial({
                color: mesh.getSymbol().color,
                opacity: 1,
                transparent: false
            }))
            mesh.object3d.position.z = 0
        });
    }
}

/// ------------------ ///
///       HEATMAP      ///
/// ------------------ ///


/**
 * Function to update the heatmap based on the selected hour and day.
 * @param {Array} data - Array of objects representing heatmap data.
 */
function updateHeatmap(data) {
    var selectedHour = document.getElementById('hourSelect-stops').value;
    var selectedDay = document.getElementById('daySelect-stops').value;
    var heatmapEnable = document.getElementById('heatmapEnable').checked;

    if (!heatmapEnable) {
        heatmapLayer.hide()
        return
    }

    var filteredData = data.filter(feature => Number(feature.properties.hour) == selectedHour && Number(feature.properties.day_of_week) == selectedDay);

    filteredData = filteredData.map(feature => {
        return [feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.properties.activity]
    })

    heatmapLayer.setData(filteredData);
    heatmapLayer.show()
}

/**
 * Function to hide the heatmap layer.
 */
function hideHeatmap() {
    heatmapLayer.hide()
}

document.getElementsByClassName('heatmap-button').addEventListener('touchstart', function (e) {
    var checked = document.getElementById('heatmapEnable').checked;
    if (checked) {
        document.getElementById('heatmapEnable').checked = false;
    } else {
        document.getElementById('heatmapEnable').checked = true;
    }
    updateHeatmap();
});

/// ------------------ ///
///        STOPS       ///
/// ------------------ ///

/**
 * Function to load stops data from a JSON file.
 * @returns {Promise} Promise object representing the loaded stops data.
 */
function loadStops() {
    return new Promise((resolve, reject) => {
        fetch('data/stops.geojson')
            .then((response) => response.json())
            .then((stopsData) => {

                var stopsMesh = {};
                stopsData.features.forEach(function (feature, i) {

                    const bar = stopsLayer.toBar(feature.geometry.coordinates, {
                        ...feature.properties,
                        height: feature.properties.activity * 10,
                        color: '#005198',
                        radius: 15
                    },
                        new THREE.MeshPhongMaterial({
                            color: '#005198'
                        }))

                    var groupKey = Number(feature.properties.day_of_week) + '-' + Number(feature.properties.hour);
                    if (!stopsMesh[groupKey]) {
                        stopsMesh[groupKey] = [];
                    }
                    stopsMesh[groupKey].push(bar);

                    if (i == stopsData.features.length - 1) {
                        resolve({
                            stopsData: stopsData.features,
                            stopsMesh: stopsMesh
                        })
                    }
                });
            })
    })
}


/**
 * Function to show the stop meshes on the map based on the selected hour and day.
 * @param {Object} stopsMesh - Object containing stop meshes grouped by key.
 */
function showStops(stopsMesh) {
    var selectedHour = document.getElementById('hourSelect-stops').value;
    var selectedDay = document.getElementById('daySelect-stops').value;

    for (var key in stopsMesh) {
        var visible = (key === selectedDay + '-' + selectedHour);
        stopsMesh[key].forEach(function (geometry) {
            if (visible) {
                stopsLayer.addMesh(geometry);
                return;
            }
            stopsLayer.removeMesh(geometry);
        });
    }
}

/**
 * Function to hide all stop meshes from the map.
 * @param {Object} stopsMesh - Object containing stop meshes grouped by key.
 */
function hideAllStops(stopsMesh) {
    for (let key in stopsMesh) {
        stopsMesh[key].forEach(function (geometry) {
            stopsLayer.removeMesh(geometry);
        });
    }
}

/// ------------------ ///
///   MAP NAVIGATION   ///
/// ------------------ ///


/**
 * Function to center the map view on the specified line.
 * @param {Object} lineMesh - Line mesh object representing the line.
 */
function centerOnLine(lineMesh) {
    // Get the vertices of the line
    if (lineMesh.options.lineString.type === 'LineString') {
        var vertices = lineMesh.options.lineString._coordinates;
    } else if (lineMesh.options.lineString.type === 'MultiLineString') {
        var vertices = lineMesh.options.lineString._geometries.flatMap(x => {
            return x._coordinates
        })
    }

    // Calculate the average latitude and longitude
    var avgLat = 0, avgLng = 0;
    var minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
    for (var i = 0; i < vertices.length; i++) {
        var lat = vertices[i].y;
        var lng = vertices[i].x;
        avgLat += lat;
        avgLng += lng;
        minLat = Math.min(minLat, lat);
        minLng = Math.min(minLng, lng);
        maxLat = Math.max(maxLat, lat);
        maxLng = Math.max(maxLng, lng);
    }
    avgLat /= vertices.length;
    avgLng /= vertices.length;

    // If overlay on the side, add additional space on the side
    if (window.innerWidth > MAX_MOBILE_WIDTH) {
        // Calculate the width of the overlay in degrees
        var windowWidth = window.innerWidth;
        var overlayWidth = document.getElementById('overlay').offsetWidth + 200;
        var overlayWidthInDegree = overlayWidth * (maxLng - minLng) / (windowWidth - overlayWidth);

        // Adjust maximum longitude to include additional space on the side
        maxLng += overlayWidthInDegree;
    }

    // Center the map on the calculated coordinates
    map.fitExtent(new maptalks.Extent(minLng, minLat, maxLng, maxLat))

}

/**
 * Function to center the map view on the global view.
 */
function centerGlobal() {

    const center = window.innerWidth > MAX_MOBILE_WIDTH ? [6.6736, 46.5409] : [6.6322, 46.5192]
    const zoom = 13
    const pitch = 40
    const bearing = 0
    map.animateTo({
        center: center,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing
    }, {
        duration: 500
    });
}

/**
 * Function to center the map view on the EPFL campus.
 */
function centerEPFL() {

    const center = window.innerWidth > MAX_MOBILE_WIDTH ? [6.5712, 46.5205] : [6.5656, 46.5203]
    const zoom = 16
    const pitch = 40
    const bearing = 0
    map.animateTo({
        center: center,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing
    }, {
        duration: 500
    });
}

/// ------------------ ///
///        OTHER       ///
/// ------------------ ///


/**
 * Function to create the line select dropdown menu and return optionsLines array.
 * @param {Array} displayableLines - Array of objects representing line options.
 * @param {Set} linesWithDelays - Set of line names with delays.
 * @returns {Array} Array of objects representing line options with color and disabled properties.
 */
function createLineSelect(displayableLines, linesWithDelays) {
    var lineSelect = document.getElementById('lineSelect');

    var optionsLines = [];
    displayableLines.forEach(function (line) {
        if (linesWithDelays.has(line.value)) {
            optionsLines.push({
                value: line.value,
                color: line.color,
                disabled: false
            })
        } else {
            optionsLines.push({
                value: line.value,
                color: line.color,
                disabled: true
            })
        }
    })

    optionsLines.forEach(function (option) {
        addOption(option, lineSelect);
    });

    function addOption(option, element) {
        var optionObj = document.createElement('option');
        optionObj.disabled = option.disabled;
        optionObj.value = option.value;
        optionObj.text = option.value;
        optionObj.style.backgroundColor = option.color;
        element.appendChild(optionObj);
    }

    // set background color of select to match first not disabled option
    lineSelect.style.backgroundColor = lineSelect.options[lineSelect.selectedIndex].style.backgroundColor;

    return optionsLines
}


// TOOL TIP //
function handleTooltip(map, threeLayer, stopsLayer) {

    let tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'white';
    tooltip.style.border = '1px solid black';
    tooltip.style.padding = '10px 20px';
    tooltip.style.display = 'none'; // Hide the tooltip by default
    tooltip.style.pointerEvents = 'none'; // Make sure the tooltip doesn't block mouse events on the map
    tooltip.style.borderRadius = '10px';
    tooltip.style.boxShadow = '2px 2px 6px 0px rgba(0,0,0,0.3)';
    tooltip.style.marginLeft = '10px';
    tooltip.style.marginTop = '10px';
    document.body.appendChild(tooltip);

    function showTooltip(e) {
        let intersected = threeLayer.identify(e.coordinate);
        let intersectedStops = stopsLayer.identify(e.coordinate);

        if (intersectedStops && intersectedStops.length > 0) { // STOPS INTERSECTIONS

            let intersectedOptions = intersectedStops[0].options

            if ('activity' in intersectedOptions) {
                tooltip.innerHTML = `<b>${intersectedOptions.stop_name}</b><br>${intersectedOptions.activity} transactions on average`;

            } else {
                // Hide tooltip if not hovering over a mesh
                tooltip.style.display = 'none';
                return
            }
        } else if (intersected && intersected.length > 0) { // OTHER INTERSECTIONS

            let intersectedOptions = intersected[0].options

            if ('arrival_delay' in intersectedOptions) {
                tooltip.innerHTML = `<b>${intersectedOptions.stop_name}</b><br>Median arrival delay: ${intersectedOptions.arrival_delay}s`;
            } else if ('departure_delay' in intersectedOptions) {
                tooltip.innerHTML = `<b>${intersectedOptions.stop_name}</b><br>Median departure delay: ${intersectedOptions.departure_delay}s`;
            } else if ('line_name' in intersectedOptions) {
                tooltip.innerHTML = `<b>Line ${intersectedOptions.line_name}</b>`;
            } else {
                // Hide tooltip if not hovering over a mesh
                tooltip.style.display = 'none';
                return
            }

        } else {
            // Hide tooltip if not hovering over a mesh
            tooltip.style.display = 'none';
            return
        }

        // Show  tooltip
        tooltip.style.display = 'block';
        tooltip.style.left = e.containerPoint.x + 'px';
        tooltip.style.top = e.containerPoint.y + 'px';

    }

    map.on('mousemove', showTooltip);
    map.on('touchmove', showTooltip);
}

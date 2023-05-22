
function hideAllDelay(delaysMesh) {
    for (let key in delaysMesh) {
        delaysMesh[key].forEach(function (geometry) {
            threeLayer.removeMesh(geometry);
        });
    }
}

function hideAllLines(linesMesh) {
    for (let key in linesMesh) {
        linesMesh[key].forEach(function (geometry) {
            threeLayer.removeMesh(geometry);
        });
    }
}

function showAllLines(linesMesh) {
    var selectedLine = document.getElementById('lineSelect').value;

    for (let key in linesMesh) {
        let visible = (key === selectedLine);
        linesMesh[key].forEach(function (geometry) {
            if (visible) return;
            threeLayer.addMesh(geometry);
        });
    }
}

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
                    delay: feature.properties.arrival_delay
                }, new THREE.MeshPhongMaterial({
                    color: '#f00',
                    opacity: 1,
                    transparent: false,
                    side: 'DoubleSide'
                }));

                var departure_delay = threeLayer.toExtrudePolygon(feature, {
                    height: feature.properties.departure_delay > 0 ? feature.properties.departure_delay * 10 : 0.02,
                    altitude: (feature.properties.arrival_delay > 0 ? feature.properties.arrival_delay * 10 : 0) + 0.01,
                    delay: feature.properties.departure_delay,
                }, new THREE.MeshPhongMaterial({
                    color: '#00f',
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
                        linesWithDelays: linesWithDelays
                    })
                }
            });
        })
    })
}

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
                    height: 1 + i * 0.01
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

                unhighlightChampionship(optionsLines)

                handleHighlight(linesMesh, lineName);

                if (this.disabled) return;
                hightlightRow(this, optionsLines, lineName)
                this.classList.add('selected');




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

function handleHighlight(linesMesh, lineName) {

    for (var line in linesMesh) {
        if (line == lineName) {
            highlightLine(linesMesh, lineName);
        } else {
            removeHighlight(linesMesh, line);
        }
    }
}

function highlightLine(linesMesh, lineName) {
    // Highlight the selected line
    if (!linesMesh[lineName]) return;
    linesMesh[lineName].forEach(function (mesh) {
        centerOnLine(mesh)
        mesh.object3d.position.z = 1
        console.log(mesh)
    });
}

function removeHighlight(linesMesh, lineName) {
    // Highlight the selected line
    if (!linesMesh[lineName]) return;
    linesMesh[lineName].forEach(function (mesh) {
        mesh.object3d.position.z = 0
    });
}

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
    if (window.innerWidth > 800) {
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

function centerGlobal() {
    
    const center = window.innerWidth > 800 ? [6.6736, 46.5409] : [6.6322, 46.5192]
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
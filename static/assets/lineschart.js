


function loadLinesChampionship() {
    return new Promise((resolve, reject) => {
        d3.csv(`data/championship_data.csv`).then(function (data) {
            resolve(data)
        }).catch(function (err) {
            reject(err)
        })
    })

}

function updateLinesChampionship(date, championship_data) {
    $('#championship-tbody').empty();

    var day_championship = championship_data.filter(function (d) {
        return d.date == date
    })

    day_championship.sort(function (a, b) {
        return b.arrival_delay - a.arrival_delay;
    });

    day_championship.forEach(function (line, i) {
        $('#championship-tbody').append(`
        <tr>
            <td>${i + 1}</td>
            <td><h5><span style="color: ${mapColorLine[line.line_name][0]}; background-color: ${mapColorLine[line.line_name][1]}" class="badge line-pill">${line.line_name}</span></h5></td>
            <td>${Math.floor(line.arrival_delay / 60)}:${Math.floor((line.arrival_delay * 1000) % 60000 / 1000).toString().padStart(2, '0')}</td>
        </tr>`);
    });

}

function loadLinesData() {
    return new Promise((resolve, reject) => {
        d3.csv(`data/lines_data.csv`).then(function (data) {
            resolve(data)
        }).catch(function (err) {
            reject(err)
        })
    })
}

function listDailyLines(date, lines_data) {
    return new Promise((resolve, reject) => {
        var lines = lines_data.filter(function (d) {
            return d.date == date
        })

        lines = [...new Set(lines_data.map(function (d) {
            return d.line_name
        }))];

        $('#lines-select').empty();
        lines.forEach(function (line, i) {
            // if line is not in mapColorLine, add it
            if (!(line in mapColorLine)) {
                mapColorLine[line] = ['#fff', '#000']
            }
            $('#lines-select').append(`
                <option style="color: ${mapColorLine[line][0]}; background-color: ${mapColorLine[line][1]}" value="${line}">${line}</option>
            `);
            if (i == lines.length - 1) {
                resolve(lines)
            }
        });
    })
}

function updateLinesData(date, line, lines_data) {
    // TODO
     var daily_line_data = lines_data.filter(function (d) {
        return d.date == date && d.line_name == line
    })

    daily_line_data.sort(function (a, b) {
        return b.stop_line_idx - a.stop_line_idx;
    });

}

var mapColorLine = {
    1: ['#fff', '#000'],
    2: ['#fff', '#000'],
    3: ['#fff', '#000'],
    4: ['#fff', '#000'],
    6: ['#fff', '#000'],
    7: ['#fff', '#000'],
    8: ['#fff', '#000'],
    9: ['#fff', '#000'],
    13: ['#fff', '#000'],
    16: ['#fff', '#000'],
    17: ['#fff', '#000'],
    18: ['#fff', '#000'],
    19: ['#fff', '#000'],
    20: ['#fff', '#000'],
    21: ['#fff', '#000'],
    23: ['#fff', '#000'],
    24: ['#fff', '#000'],
    25: ['#fff', '#000'],
    31: ['#fff', '#000'],
    32: ['#fff', '#000'],
    33: ['#fff', '#000'],
    35: ['#fff', '#000'],
    36: ['#fff', '#000'],
    38: ['#fff', '#000'],
    41: ['#fff', '#000'],
    42: ['#fff', '#000'],
    45: ['#fff', '#000'],
    46: ['#fff', '#000'],
    47: ['#fff', '#000'],
    48: ['#fff', '#000'],
    49: ['#fff', '#000'],
    54: ['#fff', '#000'],
    56: ['#fff', '#000'],
    58: ['#fff', '#000'],
    60: ['#fff', '#000'],
    64: ['#fff', '#000'],
    68: ['#fff', '#000'],
    69: ['#fff', '#000'],
    m1: ['#fff', '#000']
}
var xValues = ["Very satisfied", "Satisfied", "Dissatisfied", "No opinion"];
var yValues1 = [49.3, 32, 18, 0.7];
var yValues2 = [41.3, 38, 20, 0.7];
var yValues3 = [38.7, 42, 18.7, 0.7];


var barColors = ["green", "orange", "#EC0000", "#004E9D"];
new Chart("myChart1", {
    type: "horizontalBar",
    data: {
        labels: xValues,
        datasets: [{
            backgroundColor: barColors,
            data: yValues1
        }]
    },
    options: {

        animation: {
            duration: 0,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(16, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.fillStyle = '#000000'
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                        if (dataset.data[i] == 49.3) {
                            ctx.fillText(dataset.data[i] + "%", model.x - 50, model.y + 9)
                        }
                        else if (dataset.data[i] == 0.7) {
                            ctx.fillText(dataset.data[i] + "%", model.x + 20, model.y + 9)
                        }

                        else { ctx.fillText(dataset.data[i] + "%", model.x - 16, model.y + 9) };
                    }
                });
            }
        },


        scales: {
            x: {

                grid: {
                    offset: true
                }

            },
            yValues1: {
                beginAtZero: true,
            }
        },
        legend: { display: false },
        title: {
            display: true,
            text: "What do you think about Lausanne' s transports punctuality ?"
        }


    }
});

new Chart("myChart2", {
    type: "horizontalBar",
    data: {
        labels: xValues,
        datasets: [{
            backgroundColor: barColors,
            data: yValues2
        }]
    },
    options: {

        animation: {
            duration: 0,
            onComplete: function () {

                var ctx = this.chart.ctx;

                ctx.font = Chart.helpers.fontString(16, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.fillStyle = '#000000'

                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                        if (dataset.data[i] == 41.3) {
                            ctx.fillText(dataset.data[i] + "%", model.x - 50, model.y + 9)
                        }
                        else if (dataset.data[i] == 0.7) {
                            ctx.fillText(dataset.data[i] + "%", model.x + 20, model.y + 9)
                        }

                        else { ctx.fillText(dataset.data[i] + "%", model.x - 16, model.y + 9) };
                    }
                });
            }
        },


        scales: {
            x: {

                grid: {
                    offset: true
                }

            },
            yValues2: {
                beginAtZero: true,


            }
        },
        legend: { display: false },
        title: {
            display: true,
            text: " Is the available transport offer  satisfactory? Is Lausanne well served?"
        }


    }
});
new Chart("myChart3", {
    type: "horizontalBar",
    data: {
        labels: xValues,
        datasets: [{
            backgroundColor: barColors,
            data: yValues3
        }]
    },
    options: {

        animation: {
            duration: 0,
            onComplete: function () {

                var ctx = this.chart.ctx;

                ctx.font = Chart.helpers.fontString(16, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.fillStyle = '#000000'

                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                        if (dataset.data[i] == 38.7) {
                            ctx.fillText(dataset.data[i] + "%", model.x - 20, model.y + 9)
                        }
                        else if (dataset.data[i] == 0.7) {
                            ctx.fillText(dataset.data[i] + "%", model.x + 20, model.y + 9)
                        }
                        else if (dataset.data[i] == 18.7) {
                            ctx.fillText(dataset.data[i] + "%", model.x - 20, model.y + 9)
                        }
                        else { ctx.fillText(dataset.data[i] + "%", model.x - 15, model.y + 9) };
                    }
                });
            }
        },


        scales: {
            x: {

                grid: {
                    offset: true
                }

            },
            yValues3: {
                beginAtZero: true,



            }
        },
        legend: { display: false },
        title: {
            display: true,
            text: " What do you think of the Lausanne network connectivity?"
        }


    }
});
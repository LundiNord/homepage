let currentTheme;
let gridColor;
let fontColor;
function updateTheme() {
    currentTheme = document.documentElement.getAttribute("data-theme");
    gridColor = currentTheme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    fontColor = currentTheme === "dark" ? '#eee' : '#333';
}
updateTheme();

const popup = document.getElementById('popup');
const popupToggle = document.querySelector('.popup-toggle');
popupToggle.addEventListener('click', () => {
    popup.style.display = popup.style.display === '' || popup.style.display === 'none' ? 'block' : 'none';
    umami.track('Showed Data Sources');
});
document.addEventListener('click', (event) => {
    if (popup.style.display === 'block' && !popup.contains(event.target) && !popupToggle.contains(event.target)) {
        popup.style.display = 'none';
    }
});

//----------------------------- Air Quality -----------------------------------
//Data from https://www.lubw.baden-wuerttemberg.de/luft/messwerte-immissionswerte?id=DEBW080&comp=luft-pm25#karte
async function getPM25Value() {
    try {
        const response = await fetch('https://lupo-cloud.de/air-app/station?id=DEBW080&from=7d-ago&component=luft-pm25');
        const data = await response.json();
        const hourlySeries = data?.PM25HChart?.series?.[0]?.data;
        return hourlySeries.map(([timestamp, value]) => ({
            timestamp: new Date(timestamp),
            value: value,
            //unit: "µg/m³"
        }));

    } catch (error) {
        console.error('Error fetching PM2.5 data:', error);
        return null;
    }
}
async function getPM10Value() {
    try {
        const response = await fetch('https://lupo-cloud.de/air-app/station?id=DEBW080&from=7d-ago&component=luft-pm10');
        const data = await response.json();
        const hourlySeries = data?.PM10HChart?.series?.[0]?.data;
        return hourlySeries.map(([timestamp, value]) => ({
            timestamp: new Date(timestamp),
            value: value,
            //unit: "µg/m³"
        }));

    } catch (error) {
        console.error('Error fetching PM10 data:', error);
        return null;
    }
}

async function displayPM25Value() {
    try {
        const pm25Data = await getPM25Value();
        const pm10Data = await getPM10Value();
        if (!pm25Data || pm25Data.length === 0 || !pm10Data || pm10Data.length === 0) {
            console.error('No data available');
            return;
        }
        const labels = pm25Data.map(item => item.timestamp.toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }));
        const values = pm25Data.map(item => item.value);
        const values2 = pm10Data.map(item => item.value);
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const gridColor = currentTheme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const fontColor = currentTheme === "dark" ? '#eee' : '#333';

        const ctx = document.getElementById('myChart');
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'PM2.5 (µg/m³)',
                    data: values,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1,
                    pointRadius: 1,
                    pointHoverRadius: 5
                },
                {
                    label: 'PM10 (µg/m³)',
                    data: values2,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.1,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: false,
                        // text: langData["air_quality_title"] || 'PM2.5 Air Quality Measurements',
                        text: 'PM2.5 Air Quality Measurements',
                        color: fontColor
                    },
                    legend: {
                        labels: {
                            color: fontColor
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'µg/m³',
                            color: fontColor
                        },
                        suggestedMin: 0,
                        suggestedMax: Math.max(...values) * 1.1,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    }
                },
                // annotation: {
                //     annotations: [{
                //         type: 'line',
                //         mode: 'horizontal',
                //         scaleID: 'y-axis-0',
                //         value: 5,
                //         borderColor: 'rgb(75, 192, 192)',
                //         borderWidth: 4,
                //         label: {
                //             enabled: false,
                //             content: 'Test label'
                //         }
                //     }]
                // }
            }
        };
        if (window.myChartInstance) {
            window.myChartInstance.destroy();
        }
        window.myChartInstance = new Chart(ctx, config);
    } catch (error) {
        console.error('Error displaying PM2.5 data:', error);
    }
}
displayPM25Value();

//----------------------------- Time -----------------------------------

function updateClock() {
    document.getElementById('clock').innerHTML = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'});
    setTimeout(updateClock, 1000);
}
updateClock();

//----------------------------- Weather -----------------------------------
//Data from: https://open-meteo.com/
async function displayWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,precipitation&models=icon_seamless&past_days=7&forecast_days=1');
        const data = await response.json();
        const temperatureData = data.hourly.temperature_2m;
        const rainData = data.hourly.precipitation;
        const labels = data.hourly.time.map(time => new Date(time).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }));
        const ctx = document.getElementById('weatherChart');
        updateTheme();
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: temperatureData,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        tension: 0.1,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Rain (mm/h)',
                        data: rainData,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.05,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: fontColor
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '°C',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    },
                    y1: {
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'mm/h',
                            color: fontColor
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    }
                }
            }
        };
        if (window.weatherChartInstance) {
            window.weatherChartInstance.destroy();
        }
        window.weatherChartInstance = new Chart(ctx, config);
    } catch (error) {
        console.error('Error displaying weather data:', error);
    }
}
displayWeather();

//----------------------------- Weeks left -----------------------------------
//https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Sterbefaelle-Lebenserwartung/_inhalt.html
//inspired by https://waitbutwhy.com/2014/05/life-weeks.html and https://www.bryanbraun.com/your-life/weeks.html

function updateWeeksLeft() {
    const birthDate = new Date('2002-07-01T00:00:00Z'); // Specify time in UTC
    const now = new Date();
    const diffInMilliseconds = now - birthDate;
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksLived = diffInMilliseconds / millisecondsPerWeek;
    const totalWeeks = 80 * 52;

    document.getElementById('weeks_left').innerHTML = (totalWeeks - weeksLived).toFixed(6);
    document.getElementById('weeks_lived').innerHTML = (weeksLived).toFixed(6);
    setTimeout(updateWeeksLeft, 1000);
}
updateWeeksLeft()

//----------------------------- Climate Change -----------------------------------
//using https://github.com/philippschmitt/ppm
//data from https://gml.noaa.gov/ccgg/trends/global.html (https://doi.org/10.15138/9N0H-ZH07)
//data from https://www.dwd.de/EN/ourservices/cdc/cdc_ueberblick-klimadaten_en.html -> https://opendata.dwd.de/climate_environment/CDC/regional_averages_DE/annual/air_temperature_mean/
//temperature data does not update automatically

async function displayCO2() {
    let co2Data = [
        { year: 2002, value: 372.58 },
        { year: 2003, value: 375.14 },
        { year: 2004, value: 376.95 },
        { year: 2005, value: 378.98 },
        { year: 2006, value: 381.15 },
        { year: 2007, value: 382.90 },
        { year: 2008, value: 385.02 },
        { year: 2009, value: 386.50 },
        { year: 2010, value: 388.75 },
        { year: 2011, value: 390.62 },
        { year: 2012, value: 392.65 },
        { year: 2013, value: 395.40 },
        { year: 2014, value: 397.34 },
        { year: 2015, value: 399.65 },
        { year: 2016, value: 403.07 },
        { year: 2017, value: 405.22 },
        { year: 2018, value: 407.61 },
        { year: 2019, value: 410.07 },
        { year: 2020, value: 412.44 },
        { year: 2021, value: 414.70 },
        { year: 2022, value: 417.08 },
        { year: 2023, value: 419.35 },
        { year: 2024, value: 422.77 }
    ];
    let tempData = [
        { year: 2002, value: 9.56 },
        { year: 2003, value: 9.38 },
        { year: 2004, value: 8.94 },
        { year: 2005, value: 8.99 },
        { year: 2006, value: 9.54 },
        { year: 2007, value: 9.85 },
        { year: 2008, value: 9.48 },
        { year: 2009, value: 9.18 },
        { year: 2010, value: 7.85 },
        { year: 2011, value: 9.64 },
        { year: 2012, value: 9.09 },
        { year: 2013, value: 8.71 },
        { year: 2014, value: 10.33 },
        { year: 2015, value: 9.94 },
        { year: 2016, value: 9.55 },
        { year: 2017, value: 9.58 },
        { year: 2018, value: 10.45 },
        { year: 2019, value: 10.28 },
        { year: 2020, value: 10.43 },
        { year: 2021, value: 9.16 },
        { year: 2022, value: 10.52 },
        { year: 2023, value: 10.63 },
        { year: 2024, value: 10.89 }
    ];
    try{
        try {
            const url = 'https://philippschmitt.github.io/ppm/v1/';
            for(let i = 2025; i < new Date().getFullYear(); i++){
                const response = await fetch(url + i);
                const data = await response.json();
                co2Data.push({ year: i, value: data.ppm });
            }
            const response = await fetch(url + new Date().getFullYear() + "/"+ new Date().getMonth());
            const data = await response.json();
            co2Data.push({ year:  new Date().getFullYear(), value: data.ppm });
        } catch (error) {
            console.error('Error fetching CO2 data:', error);
        }
        const tempGraphData = tempData.map(item => item.value);
        const co2GraphData = co2Data.map(item => item.value);
        const labels = co2Data.map(item => item.year);
        const ctx = document.getElementById('co2Chart');
        updateTheme();
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'CO2 (ppm)',
                        data: co2GraphData,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Mean Temperature (°C)',
                        data: tempGraphData,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        tension: 0.05,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: fontColor
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'ppm',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    },
                    y1: {
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '°C',
                            color: fontColor
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    }
                }
            }
        };
        if (window.co2ChartInstance) {
            window.co2ChartInstance.destroy();
        }
        window.co2ChartInstance = new Chart(ctx, config);

    } catch (e) {
        console.log("Error fetching Climate Change data:", e);
    }
}
displayCO2();

//----------------------------- Inflation -----------------------------------
//Data from https://www.destatis.de/ -> https://www-genesis.destatis.de/datenbank/online/statistic/61111/table/61111-0001/
//Nominallohnindex: https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Realloehne-Nettoverdienste/_inhalt.html#234822

async function displayInflation() {
    try {
        const salaryData = [
            { year: 2002, value: null },
            { year: 2003, value: null },
            { year: 2004, value: null },
            { year: 2005, value: null },
            { year: 2006, value: null },
            { year: 2007, value: null },
            { year: 2008, value: 2.9 },
            { year: 2009, value: 0.1 },
            { year: 2010, value: 2.6 },
            { year: 2011, value: 3.3 },
            { year: 2012, value: 2.6 },
            { year: 2013, value: 1.4 },
            { year: 2014, value: 2.7 },
            { year: 2015, value: 2.8 },
            { year: 2016, value: 2.3 },
            { year: 2017, value: 2.5 },
            { year: 2018, value: 3.1 },
            { year: 2019, value: 2.6 },
            { year: 2020, value: -0.7 },
            { year: 2021, value: 3.1 },
            { year: 2022, value: 2.6 },
            { year: 2023, value: 6.0 },
            { year: 2024, value: 5.4 }
            ];
        let data;
        try {
            const response = await fetch('https://www-genesis.destatis.de/genesisGONLINE/api/rest/tables/61111-0001/data');
            data = await response.json();
        } catch (error) {
            console.error('Error fetching inflation data:', error);
        }
        const startIndex = 11;
        let inflationData = data.data[0].value.slice(startIndex, startIndex + 34);
        const salaryGraphData = salaryData.map(item => item.value);
        let labels = Object.keys(data.data[0].dimension.JAHR.category.index).slice(startIndex, startIndex + 34);
        const labels2 = salaryData.map(item => item.year);
        const ctx = document.getElementById('inflationChart');
        updateTheme();
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '2020 = 100',
                        data: inflationData,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Nominal wages',
                        data: salaryGraphData,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        tension: 0.05,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: fontColor
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '2020 = 100',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    },
                    y1: {
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '%',
                            color: fontColor
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    }
                }
            }
        };
        if (window.inflationChartInstance) {
            window.inflationChartInstance.destroy();
        }
        window.inflationChartInstance = new Chart(ctx, config);

    } catch (error) {
        console.error('Error fetching inflation data:', error);
    }
}
displayInflation()

//----------------------------- Stocks -----------------------------------
//Data from https://www.msci.com/indexes/index/990100
//Data from https://www.investing.com/indices/germany-30-historical-data
//converted with https://csvjson.com/csv2json

async function displayStocks() {
    try {
        const msciWorldData = [{date:"2002-06-28",value:2479.285361},{date:"2002-07-31",value:2270.613464},{date:"2002-08-30",value:2275.334606},{date:"2002-09-30",value:2025.606348},{date:"2002-10-31",value:2175.474558},{date:"2002-11-29",value:2293.254456},{date:"2002-12-31",value:2182.570329},{date:"2003-01-31",value:2116.623607},{date:"2003-02-28",value:2080.382442},{date:"2003-03-31",value:2074.666153},{date:"2003-04-30",value:2259.956329},{date:"2003-05-30",value:2390.220118},{date:"2003-06-30",value:2432.4746},{date:"2003-07-31",value:2482.327782},{date:"2003-08-29",value:2536.553097},{date:"2003-09-30",value:2552.643003},{date:"2003-10-31",value:2704.633537},{date:"2003-11-28",value:2746.463629},{date:"2003-12-31",value:2919.44177},{date:"2004-01-30",value:2966.931861},{date:"2004-02-27",value:3017.675344},{date:"2004-03-31",value:2998.82999},{date:"2004-04-30",value:2939.075723},{date:"2004-05-31",value:2967.884134},{date:"2004-06-30",value:3030.093073},{date:"2004-07-30",value:2931.964193},{date:"2004-08-31",value:2946.022205},{date:"2004-09-30",value:3002.6955},{date:"2004-10-29",value:3076.904211},{date:"2004-11-30",value:3239.895069},{date:"2004-12-31",value:3364.558345},{date:"2005-01-31",value:3289.438908},{date:"2005-02-28",value:3395.133482},{date:"2005-03-31",value:3330.63462},{date:"2005-04-29",value:3260.390162},{date:"2005-05-31",value:3320.818075},{date:"2005-06-30",value:3351.01918},{date:"2005-07-29",value:3468.822784},{date:"2005-08-31",value:3496.581253},{date:"2005-09-30",value:3588.40956},{date:"2005-10-31",value:3502.062889},{date:"2005-11-30",value:3620.657193},{date:"2005-12-30",value:3701.794585},{date:"2006-01-31",value:3867.81377},{date:"2006-02-28",value:3863.679046},{date:"2006-03-31",value:3950.381312},{date:"2006-04-28",value:4072.426018},{date:"2006-05-31",value:3936.963505},{date:"2006-06-30",value:3937.43287},{date:"2006-07-31",value:3962.860777},{date:"2006-08-31",value:4067.753546},{date:"2006-09-29",value:4117.42896},{date:"2006-10-31",value:4269.390748},{date:"2006-11-30",value:4376.153465},{date:"2006-12-29",value:4466.298194},{date:"2007-01-31",value:4519.914584},{date:"2007-02-28",value:4498.257682},{date:"2007-03-30",value:4582.511727},{date:"2007-04-30",value:4787.379529},{date:"2007-05-31",value:4926.190984},{date:"2007-06-29",value:4889.921852},{date:"2007-07-31",value:4782.624196},{date:"2007-08-31",value:4781.075029},{date:"2007-09-28",value:5010.068913},{date:"2007-10-31",value:5164.824547},{date:"2007-11-30",value:4956.048845},{date:"2007-12-31",value:4893.542599},{date:"2008-01-31",value:4520.672214},{date:"2008-02-29",value:4496.69501},{date:"2008-03-31",value:4455.80466},{date:"2008-04-30",value:4693.577317},{date:"2008-05-30",value:4770.995512},{date:"2008-06-30",value:4392.17244},{date:"2008-07-31",value:4285.968826},{date:"2008-08-29",value:4227.702323},{date:"2008-09-30",value:3726.687575},{date:"2008-10-31",value:3021.073597},{date:"2008-11-28",value:2827.607531},{date:"2008-12-31",value:2919.782614},{date:"2009-01-30",value:2664.847172},{date:"2009-02-27",value:2393.873995},{date:"2009-03-31",value:2575.816373},{date:"2009-04-30",value:2867.371642},{date:"2009-05-29",value:3130.78568},{date:"2009-06-30",value:3117.982151},{date:"2009-07-31",value:3383.009336},{date:"2009-08-31",value:3524.075058},{date:"2009-09-30",value:3665.755558},{date:"2009-10-30",value:3601.322067},{date:"2009-11-30",value:3750.306086},{date:"2009-12-31",value:3818.859038},{date:"2010-01-29",value:3661.751978},{date:"2010-02-26",value:3714.830292},{date:"2010-03-31",value:3946.960009},{date:"2010-04-30",value:3949.717839},{date:"2010-05-31",value:3575.136513},{date:"2010-06-30",value:3453.891084},{date:"2010-07-30",value:3734.815772},{date:"2010-08-31",value:3596.902173},{date:"2010-09-30",value:3933.681227},{date:"2010-10-29",value:4081.18627},{date:"2010-11-30",value:3994.994271},{date:"2010-12-31",value:4290.045368},{date:"2011-01-31",value:4387.969544},{date:"2011-02-28",value:4543.546134},{date:"2011-03-31",value:4500.825242},{date:"2011-04-29",value:4694.883908},{date:"2011-05-31",value:4602.240757},{date:"2011-06-30",value:4531.207531},{date:"2011-07-29",value:4450.249251},{date:"2011-08-31",value:4138.562322},{date:"2011-09-30",value:3782.757039},{date:"2011-10-31",value:4175.102956},{date:"2011-11-30",value:4075.560085},{date:"2011-12-30",value:4074.833677},{date:"2012-01-31",value:4280.520734},{date:"2012-02-29",value:4491.978708},{date:"2012-03-30",value:4552.201557},{date:"2012-04-30",value:4503.679588},{date:"2012-05-31",value:4119.206386},{date:"2012-06-29",value:4331.155403},{date:"2012-07-31",value:4388.035805},{date:"2012-08-31",value:4501.500939},{date:"2012-09-28",value:4627.184251},{date:"2012-10-31",value:4597.231193},{date:"2012-11-30",value:4658.581487},{date:"2012-12-31",value:4748.698511},{date:"2013-01-31",value:4992.061167},{date:"2013-02-28",value:5002.798508},{date:"2013-03-29",value:5122.563061},{date:"2013-04-30",value:5287.524128},{date:"2013-05-31",value:5294.214565},{date:"2013-06-28",value:5165.877084},{date:"2013-07-31",value:5439.34652},{date:"2013-08-30",value:5325.887115},{date:"2013-09-30",value:5594.335573},{date:"2013-10-31",value:5814.648991},{date:"2013-11-29",value:5920.682817},{date:"2013-12-31",value:6048.181012},{date:"2014-01-31",value:5825.526876},{date:"2014-02-28",value:6120.253606},{date:"2014-03-31",value:6132.591574},{date:"2014-04-30",value:6198.797954},{date:"2014-05-30",value:6326.600987},{date:"2014-06-30",value:6442.500674},{date:"2014-07-31",value:6341.234415},{date:"2014-08-29",value:6483.570232},{date:"2014-09-30",value:6310.268156},{date:"2014-10-31",value:6352.598337},{date:"2014-11-28",value:6482.900453},{date:"2014-12-31",value:6381.054489},{date:"2015-01-30",value:6266.933709},{date:"2015-02-27",value:6637.222188},{date:"2015-03-31",value:6537.618526},{date:"2015-04-30",value:6694.313819},{date:"2015-05-29",value:6723.059942},{date:"2015-06-30",value:6569.46635},{date:"2015-07-31",value:6689.575637},{date:"2015-08-31",value:6249.64635},{date:"2015-09-30",value:6021.954302},{date:"2015-10-30",value:6500.909759},{date:"2015-11-30",value:6471.71718},{date:"2015-12-31",value:6360.574954},{date:"2016-01-29",value:5981.67427},{date:"2016-02-29",value:5940.800331},{date:"2016-03-31",value:6348.294514},{date:"2016-04-29",value:6452.776567},{date:"2016-05-31",value:6494.942746},{date:"2016-06-30",value:6425.279863},{date:"2016-07-29",value:6698.465937},{date:"2016-08-31",value:6707.420309},{date:"2016-09-30",value:6746.076641},{date:"2016-10-31",value:6617.258395},{date:"2016-11-30",value:6716.016518},{date:"2016-12-30",value:6879.162363},{date:"2017-01-31",value:7046.796149},{date:"2017-02-28",value:7245.762912},{date:"2017-03-31",value:7328.13507},{date:"2017-04-28",value:7440.259608},{date:"2017-05-31",value:7604.861196},{date:"2017-06-30",value:7637.015307},{date:"2017-07-31",value:7822.146969},{date:"2017-08-31",value:7837.107664},{date:"2017-09-29",value:8016.091279},{date:"2017-10-31",value:8169.600974},{date:"2017-11-30",value:8350.801848},{date:"2017-12-29",value:8466.344501},{date:"2018-01-31",value:8915.277691},{date:"2018-02-28",value:8549.698834},{date:"2018-03-30",value:8368.878782},{date:"2018-04-30",value:8470.212767},{date:"2018-05-31",value:8531.326869},{date:"2018-06-29",value:8530.353984},{date:"2018-07-31",value:8798.941068},{date:"2018-08-31",value:8911.933486},{date:"2018-09-28",value:8965.287627},{date:"2018-10-31",value:8309.110332},{date:"2018-11-30",value:8407.844611},{date:"2018-12-31",value:7771.710261},{date:"2019-01-31",value:8379.028953},{date:"2019-02-28",value:8635.203361},{date:"2019-03-29",value:8754.488883},{date:"2019-04-30",value:9069.951224},{date:"2019-05-31",value:8554.772217},{date:"2019-06-28",value:9122.090094},{date:"2019-07-31",value:9169.81569},{date:"2019-08-30",value:8986.643663},{date:"2019-09-30",value:9182.16764},{date:"2019-10-31",value:9418.381319},{date:"2019-11-29",value:9685.175388},{date:"2019-12-31",value:9979.03366},{date:"2020-01-31",value:9921.108777},{date:"2020-02-28",value:9086.788157},{date:"2020-03-31",value:7890.18073},{date:"2020-04-30",value:8756.464871},{date:"2020-05-29",value:9185.249174},{date:"2020-06-30",value:9432.107145},{date:"2020-07-31",value:9886.493432},{date:"2020-08-31",value:10550.971824},{date:"2020-09-30",value:10191.07874},{date:"2020-10-30",value:9881.075667},{date:"2020-11-30",value:11148.599773},{date:"2020-12-31",value:11625.198749},{date:"2021-01-29",value:11512.425105},{date:"2021-02-26",value:11811.310416},{date:"2021-03-31",value:12211.116272},{date:"2021-04-30",value:12784.973299},{date:"2021-05-31",value:12976.577906},{date:"2021-06-30",value:13174.250989},{date:"2021-07-30",value:13413.449833},{date:"2021-08-31",value:13751.460508},{date:"2021-09-30",value:13186.526695},{date:"2021-10-29",value:13936.992021},{date:"2021-11-30",value:13636.233449},{date:"2021-12-31",value:14223.136794},{date:"2022-01-31",value:13473.4354},{date:"2022-02-28",value:13137.03442},{date:"2022-03-31",value:13505.741311},{date:"2022-04-29",value:12389.188861},{date:"2022-05-31",value:12408.089771},{date:"2022-06-30",value:11337.723549},{date:"2022-07-29",value:12241.139674},{date:"2022-08-31",value:11734.160889},{date:"2022-09-30",value:10648.162536},{date:"2022-10-31",value:11415.734483},{date:"2022-11-30",value:12215.105868},{date:"2022-12-30",value:11700.992418},{date:"2023-01-31",value:12532.085435},{date:"2023-02-28",value:12235.685754},{date:"2023-03-31",value:12622.659609},{date:"2023-04-28",value:12850.378508},{date:"2023-05-31",value:12731.907782},{date:"2023-06-30",value:13506.744492},{date:"2023-07-31",value:13963.885805},{date:"2023-08-31",value:13636.081474},{date:"2023-09-29",value:13052.604114},{date:"2023-10-31",value:12676.970282},{date:"2023-11-30",value:13871.961001},{date:"2023-12-29",value:14557.826422},{date:"2024-01-31",value:14735.888914},{date:"2024-02-29",value:15366.381971},{date:"2024-03-29",value:15868.8896},{date:"2024-04-30",value:15286.59151},{date:"2024-05-31",value:15979.455491},{date:"2024-06-28",value:16309.886618},{date:"2024-07-31",value:16601.012475},{date:"2024-08-30",value:17045.470265},{date:"2024-09-30",value:17364.011736},{date:"2024-10-31",value:17023.445476},{date:"2024-11-29",value:17810.63517},{date:"2024-12-31",value:17352.115351},{date:"2025-01-31",value:17968.349835},{date:"2025-02-28",value:17844.251038},{date:"2025-03-31",value:17059.748793}]
        //const daxData = [{date:"07/01/2002",price:"3,700.14","Open":"4,377.10","High":"4,483.03","Low":"3,265.96","Vol.":"","Change %":"-15.57%"},{date:"08/01/2002",price:"3,712.94","Open":"3,699.31","High":"3,930.96","Low":"3,235.38","Vol.":"","Change %":"0.35%"},{date:"09/01/2002",price:"2,769.03","Open":"3,698.69","High":"3,698.69","Low":"2,719.49","Vol.":"","Change %":"-25.42%"},{date:"10/01/2002",price:"3,152.85","Open":"2,772.96","High":"3,299.01","Low":"2,519.30","Vol.":"","Change %":"13.86%"},{date:"11/01/2002",price:"3,320.32","Open":"3,152.19","High":"3,443.49","Low":"2,987.85","Vol.":"","Change %":"5.31%"},{date:"12/01/2002",price:"2,892.63","Open":"3,332.73","High":"3,476.83","Low":"2,836.01","Vol.":"","Change %":"-12.88%"},{date:"01/01/2003",price:"2,747.83","Open":"2,898.68","High":"3,157.25","Low":"2,563.92","Vol.":"","Change %":"-5.01%"},{date:"02/01/2003",price:"2,547.05","Open":"2,750.40","High":"2,802.93","Low":"2,433.15","Vol.":"","Change %":"-7.31%"},{date:"03/01/2003",price:"2,423.87","Open":"2,553.74","High":"2,731.57","Low":"2,188.75","Vol.":"","Change %":"-4.84%"},{date:"04/01/2003",price:"2,942.04","Open":"2,426.24","High":"3,004.79","Low":"2,395.72","Vol.":"","Change %":"21.38%"},{date:"05/01/2003",price:"2,982.68","Open":"2,938.72","High":"3,068.08","Low":"2,769.45","Vol.":"","Change %":"1.38%"},{date:"06/01/2003",price:"3,220.58","Open":"2,990.93","High":"3,324.44","Low":"2,990.93","Vol.":"","Change %":"7.98%"},{date:"07/01/2003",price:"3,487.86","Open":"3,217.21","High":"3,487.86","Low":"3,119.35","Vol.":"","Change %":"8.30%"},{date:"08/01/2003",price:"3,484.58","Open":"3,481.81","High":"3,588.53","Low":"3,299.77","Vol.":"1.76B","Change %":"-0.09%"},{date:"09/01/2003",price:"3,256.78","Open":"3,493.34","High":"3,676.88","Low":"3,202.87","Vol.":"2.26B","Change %":"-6.54%"},{date:"10/01/2003",price:"3,655.99","Open":"3,255.76","High":"3,675.78","Low":"3,217.40","Vol.":"2.16B","Change %":"12.26%"},{date:"11/01/2003",price:"3,745.95","Open":"3,657.61","High":"3,814.21","Low":"3,576.52","Vol.":"1.93B","Change %":"2.46%"},{date:"12/01/2003",price:"3,965.16","Open":"3,752.72","High":"3,996.28","Low":"3,752.72","Vol.":"1.69B","Change %":"5.85%"},{date:"01/01/2004",price:"4,058.60","Open":"3,969.04","High":"4,175.48","Low":"3,969.04","Vol.":"2.31B","Change %":"2.36%"},{date:"02/01/2004",price:"4,018.16","Open":"4,062.79","High":"4,150.56","Low":"3,960.41","Vol.":"1.86B","Change %":"-1.00%"},{date:"03/01/2004",price:"3,856.70","Open":"4,026.19","High":"4,163.19","Low":"3,692.40","Vol.":"2.69B","Change %":"-4.02%"},{date:"04/01/2004",price:"3,985.21","Open":"3,858.34","High":"4,156.89","Low":"3,857.04","Vol.":"2.05B","Change %":"3.33%"},{date:"05/01/2004",price:"3,921.41","Open":"3,972.88","High":"4,029.32","Low":"3,710.02","Vol.":"1.87B","Change %":"-1.60%"},{date:"06/01/2004",price:"4,052.73","Open":"3,924.30","High":"4,090.75","Low":"3,856.04","Vol.":"1.79B","Change %":"3.35%"},{date:"07/01/2004",price:"3,895.61","Open":"4,078.36","High":"4,101.52","Low":"3,749.04","Vol.":"1.84B","Change %":"-3.88%"},{date:"08/01/2004",price:"3,785.21","Open":"3,891.18","High":"3,891.78","Low":"3,618.58","Vol.":"1.83B","Change %":"-2.83%"},{date:"09/01/2004",price:"3,892.90","Open":"3,794.17","High":"4,000.13","Low":"3,792.25","Vol.":"1.90B","Change %":"2.85%"},{date:"10/01/2004",price:"3,960.25","Open":"3,895.15","High":"4,078.50","Low":"3,838.98","Vol.":"2.06B","Change %":"1.73%"},{date:"11/01/2004",price:"4,126.00","Open":"3,961.18","High":"4,219.05","Low":"3,959.25","Vol.":"2.06B","Change %":"4.19%"},{date:"12/01/2004",price:"4,256.08","Open":"4,108.55","High":"4,272.18","Low":"4,107.62","Vol.":"1.66B","Change %":"3.15%"},{date:"01/01/2005",price:"4,254.85","Open":"4,260.92","High":"4,325.77","Low":"4,160.83","Vol.":"2.22B","Change %":"-0.03%"},{date:"02/01/2005",price:"4,350.49","Open":"4,256.65","High":"4,409.09","Low":"4,249.69","Vol.":"2.01B","Change %":"2.25%"},{date:"03/01/2005",price:"4,348.77","Open":"4,345.24","High":"4,435.31","Low":"4,275.55","Vol.":"2.13B","Change %":"-0.04%"},{date:"04/01/2005",price:"4,184.84","Open":"4,348.03","High":"4,422.88","Low":"4,157.51","Vol.":"2.18B","Change %":"-3.77%"},{date:"05/01/2005",price:"4,460.63","Open":"4,208.63","High":"4,482.02","Low":"4,205.05","Vol.":"1.97B","Change %":"6.59%"},{date:"06/01/2005",price:"4,586.28","Open":"4,467.32","High":"4,637.34","Low":"4,467.04","Vol.":"2.37B","Change %":"2.82%"},{date:"07/01/2005",price:"4,886.50","Open":"4,584.44","High":"4,913.02","Low":"4,444.94","Vol.":"2.29B","Change %":"6.55%"},{date:"08/01/2005",price:"4,829.69","Open":"4,882.39","High":"4,990.57","Low":"4,726.33","Vol.":"2.17B","Change %":"-1.16%"},{date:"09/01/2005",price:"5,044.12","Open":"4,846.66","High":"5,061.84","Low":"4,816.67","Vol.":"2.37B","Change %":"4.44%"},{date:"10/01/2005",price:"4,929.07","Open":"5,060.99","High":"5,138.02","Low":"4,762.75","Vol.":"2.24B","Change %":"-2.28%"},{date:"11/01/2005",price:"5,193.40","Open":"4,922.91","High":"5,241.00","Low":"4,891.62","Vol.":"2.27B","Change %":"5.36%"},{date:"12/01/2005",price:"5,408.26","Open":"5,210.54","High":"5,469.96","Low":"5,208.49","Vol.":"1.74B","Change %":"4.14%"},{date:"01/01/2006",price:"5,674.15","Open":"5,410.24","High":"5,697.01","Low":"5,290.49","Vol.":"2.53B","Change %":"4.92%"},{date:"02/01/2006",price:"5,796.04","Open":"5,662.05","High":"5,916.80","Low":"5,598.05","Vol.":"2.13B","Change %":"2.15%"},{date:"03/01/2006",price:"5,970.08","Open":"5,806.96","High":"5,993.90","Low":"5,664.19","Vol.":"2.78B","Change %":"3.00%"},{date:"04/01/2006",price:"6,009.89","Open":"5,989.08","High":"6,121.95","Low":"5,860.50","Vol.":"2.11B","Change %":"0.67%"},{date:"05/01/2006",price:"5,692.86","Open":"6,014.38","High":"6,162.37","Low":"5,513.43","Vol.":"3.34B","Change %":"-5.28%"},{date:"06/01/2006",price:"5,683.31","Open":"5,677.53","High":"5,778.78","Low":"5,243.71","Vol.":"2.86B","Change %":"-0.17%"},{date:"07/01/2006",price:"5,681.97","Open":"5,688.00","High":"5,729.59","Low":"5,365.06","Vol.":"2.09B","Change %":"-0.02%"},{date:"08/01/2006",price:"5,859.57","Open":"5,678.01","High":"5,886.78","Low":"5,557.59","Vol.":"2.54B","Change %":"3.13%"},{date:"09/01/2006",price:"6,004.33","Open":"5,861.25","High":"6,031.55","Low":"5,737.20","Vol.":"2.48B","Change %":"2.47%"},{date:"10/01/2006",price:"6,268.92","Open":"6,019.34","High":"6,304.78","Low":"5,944.57","Vol.":"2.43B","Change %":"4.41%"},{date:"11/01/2006",price:"6,309.19","Open":"6,262.71","High":"6,497.06","Low":"6,201.00","Vol.":"2.66B","Change %":"0.64%"},{date:"12/01/2006",price:"6,596.92","Open":"6,322.18","High":"6,629.33","Low":"6,195.81","Vol.":"1.92B","Change %":"4.56%"},{date:"01/01/2007",price:"6,789.11","Open":"6,614.73","High":"6,805.09","Low":"6,531.25","Vol.":"3.02B","Change %":"2.91%"},{date:"02/01/2007",price:"6,715.44","Open":"6,821.31","High":"7,040.20","Low":"6,640.99","Vol.":"2.86B","Change %":"-1.09%"},{date:"03/01/2007",price:"6,917.03","Open":"6,714.25","High":"6,965.84","Low":"6,437.25","Vol.":"3.60B","Change %":"3.00%"},{date:"04/01/2007",price:"7,408.87","Open":"6,911.13","High":"7,436.30","Low":"6,891.80","Vol.":"2.47B","Change %":"7.11%"},{date:"05/01/2007",price:"7,883.04","Open":"7,429.93","High":"7,895.71","Low":"7,304.61","Vol.":"3.12B","Change %":"6.40%"},{date:"06/01/2007",price:"8,007.32","Open":"7,891.20","High":"8,131.73","Low":"7,499.43","Vol.":"3.54B","Change %":"1.58%"},{date:"07/01/2007",price:"7,584.14","Open":"7,969.27","High":"8,151.57","Low":"7,372.89","Vol.":"3.17B","Change %":"-5.28%"},{date:"08/01/2007",price:"7,638.17","Open":"7,472.36","High":"7,659.72","Low":"7,190.36","Vol.":"3.82B","Change %":"0.71%"},{date:"09/01/2007",price:"7,861.51","Open":"7,643.64","High":"7,882.18","Low":"7,369.70","Vol.":"2.80B","Change %":"2.92%"},{date:"10/01/2007",price:"8,019.22","Open":"7,851.29","High":"8,063.83","Low":"7,763.64","Vol.":"3.01B","Change %":"2.01%"},{date:"11/01/2007",price:"7,870.52","Open":"8,024.41","High":"8,038.41","Low":"7,444.62","Vol.":"3.62B","Change %":"-1.85%"},{date:"12/01/2007",price:"8,067.32","Open":"7,859.39","High":"8,117.79","Low":"7,777.40","Vol.":"2.18B","Change %":"2.50%"},{date:"01/01/2008",price:"6,851.75","Open":"8,045.97","High":"8,100.64","Low":"6,384.40","Vol.":"4.97B","Change %":"-15.07%"},{date:"02/01/2008",price:"6,748.13","Open":"6,896.19","High":"7,079.74","Low":"6,655.65","Vol.":"3.51B","Change %":"-1.51%"},{date:"03/01/2008",price:"6,534.97","Open":"6,692.98","High":"6,720.16","Low":"6,167.82","Vol.":"3.65B","Change %":"-3.16%"},{date:"04/01/2008",price:"6,948.82","Open":"6,519.02","High":"6,966.47","Low":"6,496.94","Vol.":"3.06B","Change %":"6.33%"},{date:"05/01/2008",price:"7,096.79","Open":"6,982.06","High":"7,231.86","Low":"6,905.86","Vol.":"2.70B","Change %":"2.13%"},{date:"06/01/2008",price:"6,418.32","Open":"7,098.70","High":"7,102.05","Low":"6,308.24","Vol.":"3.11B","Change %":"-9.56%"},{date:"07/01/2008",price:"6,479.56","Open":"6,394.08","High":"6,577.10","Low":"5,999.32","Vol.":"3.93B","Change %":"0.95%"},{date:"08/01/2008",price:"6,422.30","Open":"6,461.01","High":"6,626.70","Low":"6,219.10","Vol.":"2.63B","Change %":"-0.88%"},{date:"09/01/2008",price:"5,831.02","Open":"6,400.85","High":"6,553.90","Low":"5,658.20","Vol.":"4.71B","Change %":"-9.21%"},{date:"10/01/2008",price:"4,987.97","Open":"5,865.08","High":"5,876.93","Low":"4,014.60","Vol.":"6.54B","Change %":"-14.46%"},{date:"11/01/2008",price:"4,669.44","Open":"5,053.94","High":"5,302.57","Low":"4,034.96","Vol.":"3.29B","Change %":"-6.39%"},{date:"12/01/2008",price:"4,810.20","Open":"4,653.12","High":"4,850.39","Low":"4,304.03","Vol.":"3.03B","Change %":"3.01%"},{date:"01/01/2009",price:"4,338.35","Open":"4,856.85","High":"5,111.02","Low":"4,067.43","Vol.":"3.16B","Change %":"-9.81%"},{date:"02/01/2009",price:"3,843.74","Open":"4,309.17","High":"4,688.59","Low":"3,764.69","Vol.":"2.82B","Change %":"-11.40%"},{date:"03/01/2009",price:"4,084.76","Open":"3,817.51","High":"4,272.12","Low":"3,588.89","Vol.":"3.48B","Change %":"6.27%"},{date:"04/01/2009",price:"4,769.45","Open":"4,074.79","High":"4,837.22","Low":"3,997.46","Vol.":"2.92B","Change %":"16.76%"},{date:"05/01/2009",price:"4,940.82","Open":"4,790.03","High":"5,060.76","Low":"4,653.25","Vol.":"2.49B","Change %":"3.59%"},{date:"06/01/2009",price:"4,808.64","Open":"4,992.10","High":"5,177.59","Low":"4,669.80","Vol.":"2.20B","Change %":"-2.68%"},{date:"07/01/2009",price:"5,332.14","Open":"4,820.61","High":"5,396.95","Low":"4,524.01","Vol.":"2.15B","Change %":"10.89%"},{date:"08/01/2009",price:"5,464.61","Open":"5,330.87","High":"5,575.53","Low":"5,158.60","Vol.":"1.81B","Change %":"2.48%"},{date:"09/01/2009",price:"5,675.16","Open":"5,479.35","High":"5,760.83","Low":"5,263.11","Vol.":"2.48B","Change %":"3.85%"},{date:"10/01/2009",price:"5,414.96","Open":"5,681.88","High":"5,888.21","Low":"5,394.80","Vol.":"2.84B","Change %":"-4.58%"},{date:"11/01/2009",price:"5,625.95","Open":"5,410.61","High":"5,843.27","Low":"5,312.64","Vol.":"2.33B","Change %":"3.90%"},{date:"12/01/2009",price:"5,957.43","Open":"5,653.88","High":"6,026.69","Low":"5,605.43","Vol.":"1.88B","Change %":"5.89%"},{date:"01/01/2010",price:"5,608.79","Open":"5,975.52","High":"6,094.26","Low":"5,540.33","Vol.":"2.64B","Change %":"-5.85%"},{date:"02/01/2010",price:"5,598.46","Open":"5,587.50","High":"5,743.89","Low":"5,433.02","Vol.":"2.61B","Change %":"-0.18%"},{date:"03/01/2010",price:"6,153.55","Open":"5,652.85","High":"6,203.50","Low":"5,641.18","Vol.":"2.58B","Change %":"9.92%"},{date:"04/01/2010",price:"6,135.70","Open":"6,189.38","High":"6,341.52","Low":"6,024.01","Vol.":"2.74B","Change %":"-0.29%"},{date:"05/01/2010",price:"5,964.33","Open":"6,122.76","High":"6,276.80","Low":"5,607.68","Vol.":"3.89B","Change %":"-2.79%"},{date:"06/01/2010",price:"5,965.52","Open":"5,943.94","High":"6,330.81","Low":"5,798.76","Vol.":"2.63B","Change %":"0.02%"},{date:"07/01/2010",price:"6,147.97","Open":"5,885.61","High":"6,253.64","Low":"5,809.37","Vol.":"2.22B","Change %":"3.06%"},{date:"08/01/2010",price:"5,925.22","Open":"6,187.64","High":"6,386.97","Low":"5,833.51","Vol.":"2.10B","Change %":"-3.62%"},{date:"09/01/2010",price:"6,229.02","Open":"5,936.94","High":"6,339.97","Low":"5,876.43","Vol.":"2.45B","Change %":"5.13%"},{date:"10/01/2010",price:"6,601.37","Open":"6,244.06","High":"6,668.54","Low":"6,115.87","Vol.":"2.17B","Change %":"5.98%"},{date:"11/01/2010",price:"6,688.49","Open":"6,637.09","High":"6,907.61","Low":"6,586.01","Vol.":"2.33B","Change %":"1.32%"},{date:"12/01/2010",price:"6,914.19","Open":"6,748.36","High":"7,087.84","Low":"6,736.69","Vol.":"1.79B","Change %":"3.37%"},{date:"01/01/2011",price:"7,077.48","Open":"6,973.39","High":"7,180.15","Low":"6,835.74","Vol.":"2.36B","Change %":"2.36%"},{date:"02/01/2011",price:"7,272.32","Open":"7,133.34","High":"7,441.82","Low":"7,093.91","Vol.":"2.13B","Change %":"2.75%"},{date:"03/01/2011",price:"7,041.31","Open":"7,309.80","High":"7,356.33","Low":"6,483.39","Vol.":"3.09B","Change %":"-3.18%"},{date:"04/01/2011",price:"7,514.46","Open":"7,086.56","High":"7,514.69","Low":"6,994.56","Vol.":"2.42B","Change %":"6.72%"},{date:"05/01/2011",price:"7,293.69","Open":"7,570.86","High":"7,600.41","Low":"7,071.42","Vol.":"3.55B","Change %":"-2.94%"},{date:"06/01/2011",price:"7,376.24","Open":"7,310.56","High":"7,378.35","Low":"6,991.62","Vol.":"3.22B","Change %":"1.13%"},{date:"07/01/2011",price:"7,158.77","Open":"7,374.49","High":"7,523.53","Low":"6,996.26","Vol.":"3.30B","Change %":"-2.95%"},{date:"08/01/2011",price:"5,784.85","Open":"7,254.50","High":"7,282.01","Low":"5,345.36","Vol.":"5.64B","Change %":"-19.19%"},{date:"09/01/2011",price:"5,502.02","Open":"5,793.10","High":"5,794.50","Low":"4,965.80","Vol.":"4.65B","Change %":"-4.89%"},{date:"10/01/2011",price:"6,141.34","Open":"5,311.93","High":"6,430.60","Low":"5,125.44","Vol.":"3.74B","Change %":"11.62%"},{date:"11/01/2011",price:"6,088.84","Open":"5,934.54","High":"6,193.34","Low":"5,366.50","Vol.":"4.07B","Change %":"-0.85%"},{date:"12/01/2011",price:"5,898.35","Open":"6,080.48","High":"6,170.04","Low":"5,637.53","Vol.":"3.00B","Change %":"-3.13%"},{date:"01/01/2012",price:"6,458.91","Open":"5,900.18","High":"6,574.19","Low":"5,900.18","Vol.":"3.83B","Change %":"9.50%"},{date:"02/01/2012",price:"6,856.08","Open":"6,482.95","High":"6,971.03","Low":"6,482.56","Vol.":"3.64B","Change %":"6.15%"},{date:"03/01/2012",price:"6,946.83","Open":"6,831.97","High":"7,194.33","Low":"6,612.61","Vol.":"3.74B","Change %":"1.32%"},{date:"04/01/2012",price:"6,761.19","Open":"6,973.99","High":"7,081.06","Low":"6,499.07","Vol.":"3.21B","Change %":"-2.67%"},{date:"05/01/2012",price:"6,264.38","Open":"6,861.30","High":"6,875.87","Low":"6,208.09","Vol.":"3.35B","Change %":"-7.35%"},{date:"06/01/2012",price:"6,416.28","Open":"6,259.76","High":"6,427.49","Low":"5,914.43","Vol.":"3.39B","Change %":"2.42%"},{date:"07/01/2012",price:"6,772.26","Open":"6,405.39","High":"6,835.19","Low":"6,324.53","Vol.":"3.15B","Change %":"5.55%"},{date:"08/01/2012",price:"6,970.79","Open":"6,775.99","High":"7,105.43","Low":"6,596.21","Vol.":"2.80B","Change %":"2.93%"},{date:"09/01/2012",price:"7,216.15","Open":"6,946.61","High":"7,478.53","Low":"6,892.86","Vol.":"3.42B","Change %":"3.52%"},{date:"10/01/2012",price:"7,260.63","Open":"7,227.81","High":"7,447.81","Low":"7,120.68","Vol.":"2.73B","Change %":"0.62%"},{date:"11/01/2012",price:"7,405.50","Open":"7,255.30","High":"7,442.60","Low":"6,950.53","Vol.":"2.86B","Change %":"2.00%"},{date:"12/01/2012",price:"7,612.39","Open":"7,427.41","High":"7,682.90","Low":"7,417.30","Vol.":"1.90B","Change %":"2.79%"},{date:"01/01/2013",price:"7,776.05","Open":"7,689.46","High":"7,871.79","Low":"7,634.26","Vol.":"2.74B","Change %":"2.15%"},{date:"02/01/2013",price:"7,741.70","Open":"7,792.59","High":"7,860.57","Low":"7,537.29","Vol.":"2.81B","Change %":"-0.44%"},{date:"03/01/2013",price:"7,795.31","Open":"7,735.35","High":"8,074.47","Low":"7,627.99","Vol.":"3.18B","Change %":"0.69%"},{date:"04/01/2013",price:"7,913.71","Open":"7,806.12","High":"7,965.90","Low":"7,418.36","Vol.":"2.70B","Change %":"1.52%"},{date:"05/01/2013",price:"8,348.84","Open":"7,905.35","High":"8,557.86","Low":"7,896.99","Vol.":"2.39B","Change %":"5.50%"},{date:"06/01/2013",price:"7,959.22","Open":"8,291.49","High":"8,395.56","Low":"7,655.83","Vol.":"2.05B","Change %":"-4.67%"},{date:"07/01/2013",price:"8,275.97","Open":"8,000.02","High":"8,415.33","Low":"7,730.37","Vol.":"2.09B","Change %":"3.98%"},{date:"08/01/2013",price:"8,103.15","Open":"8,320.38","High":"8,457.05","Low":"8,094.22","Vol.":"1.85B","Change %":"-2.09%"},{date:"09/01/2013",price:"8,594.40","Open":"8,224.34","High":"8,770.10","Low":"8,095.91","Vol.":"2.08B","Change %":"6.06%"},{date:"10/01/2013",price:"9,033.92","Open":"8,618.59","High":"9,070.17","Low":"8,489.62","Vol.":"1.94B","Change %":"5.11%"},{date:"11/01/2013",price:"9,405.30","Open":"9,032.29","High":"9,424.62","Low":"8,962.42","Vol.":"1.68B","Change %":"4.11%"},{date:"12/01/2013",price:"9,552.16","Open":"9,412.95","High":"9,594.35","Low":"8,984.28","Vol.":"1.44B","Change %":"1.56%"},{date:"01/01/2014",price:"9,306.48","Open":"9,598.25","High":"9,794.05","Low":"9,166.05","Vol.":"2.13B","Change %":"-2.57%"},{date:"02/01/2014",price:"9,692.08","Open":"9,318.77","High":"9,720.66","Low":"9,071.25","Vol.":"1.69B","Change %":"4.14%"},{date:"03/01/2014",price:"9,555.91","Open":"9,553.08","High":"9,634.82","Low":"8,913.27","Vol.":"2.04B","Change %":"-1.40%"},{date:"04/01/2014",price:"9,603.23","Open":"9,601.96","High":"9,721.50","Low":"9,166.53","Vol.":"1.60B","Change %":"0.50%"},{date:"05/01/2014",price:"9,943.27","Open":"9,611.79","High":"9,970.77","Low":"9,407.09","Vol.":"1.77B","Change %":"3.54%"},{date:"06/01/2014",price:"9,833.07","Open":"9,986.86","High":"10,050.98","Low":"9,749.75","Vol.":"1.71B","Change %":"-1.11%"},{date:"07/01/2014",price:"9,407.48","Open":"9,853.74","High":"10,032.28","Low":"9,395.35","Vol.":"1.71B","Change %":"-4.33%"},{date:"08/01/2014",price:"9,470.17","Open":"9,379.74","High":"9,600.85","Low":"8,903.49","Vol.":"1.69B","Change %":"0.67%"},{date:"09/01/2014",price:"9,474.30","Open":"9,484.53","High":"9,891.20","Low":"9,369.62","Vol.":"1.72B","Change %":"0.04%"},{date:"10/01/2014",price:"9,326.87","Open":"9,454.04","High":"9,520.97","Low":"8,354.97","Vol.":"2.63B","Change %":"-1.56%"},{date:"11/01/2014",price:"9,980.85","Open":"9,305.73","High":"9,992.67","Low":"9,148.78","Vol.":"1.84B","Change %":"7.01%"},{date:"12/01/2014",price:"9,805.55","Open":"9,915.74","High":"10,093.03","Low":"9,219.05","Vol.":"1.81B","Change %":"-1.76%"},{date:"01/01/2015",price:"10,694.32","Open":"9,869.13","High":"10,810.57","Low":"9,382.82","Vol.":"2.37B","Change %":"9.06%"},{date:"02/01/2015",price:"11,401.66","Open":"10,719.18","High":"11,401.66","Low":"10,594.32","Vol.":"1.83B","Change %":"6.61%"},{date:"03/01/2015",price:"11,966.17","Open":"11,408.28","High":"12,219.05","Low":"11,193.30","Vol.":"2.18B","Change %":"4.95%"},{date:"04/01/2015",price:"11,454.38","Open":"11,902.92","High":"12,390.75","Low":"11,331.37","Vol.":"1.81B","Change %":"-4.28%"},{date:"05/01/2015",price:"11,413.82","Open":"11,506.84","High":"11,920.31","Low":"11,167.55","Vol.":"1.78B","Change %":"-0.35%"},{date:"06/01/2015",price:"10,944.97","Open":"11,462.97","High":"11,635.85","Low":"10,797.85","Vol.":"2.24B","Change %":"-4.11%"},{date:"07/01/2015",price:"11,308.99","Open":"11,050.32","High":"11,802.37","Low":"10,652.79","Vol.":"1.89B","Change %":"3.33%"},{date:"08/01/2015",price:"10,259.46","Open":"11,295.50","High":"11,669.86","Low":"9,338.20","Vol.":"2.18B","Change %":"-9.28%"},{date:"09/01/2015",price:"9,660.44","Open":"10,073.74","High":"10,512.61","Low":"9,325.05","Vol.":"2.66B","Change %":"-5.84%"},{date:"10/01/2015",price:"10,850.14","Open":"9,757.04","High":"10,886.98","Low":"9,396.34","Vol.":"2.19B","Change %":"12.32%"},{date:"11/01/2015",price:"11,382.23","Open":"10,749.98","High":"11,430.87","Low":"10,607.46","Vol.":"1.73B","Change %":"4.90%"},{date:"12/01/2015",price:"10,743.01","Open":"11,422.47","High":"11,430.38","Low":"10,122.95","Vol.":"1.84B","Change %":"-5.62%"},{date:"01/01/2016",price:"9,798.11","Open":"10,485.81","High":"10,485.91","Low":"9,314.57","Vol.":"2.23B","Change %":"-8.80%"},{date:"02/01/2016",price:"9,495.40","Open":"9,823.73","High":"9,827.10","Low":"8,699.29","Vol.":"2.53B","Change %":"-3.09%"},{date:"03/01/2016",price:"9,965.51","Open":"9,482.66","High":"10,112.17","Low":"9,471.09","Vol.":"2.10B","Change %":"4.95%"},{date:"04/01/2016",price:"10,038.97","Open":"9,833.26","High":"10,474.38","Low":"9,484.75","Vol.":"1.85B","Change %":"0.74%"},{date:"05/01/2016",price:"10,262.74","Open":"10,091.17","High":"10,365.24","Low":"9,737.00","Vol.":"1.78B","Change %":"2.23%"},{date:"06/01/2016",price:"9,680.09","Open":"10,242.78","High":"10,340.84","Low":"9,214.10","Vol.":"2.50B","Change %":"-5.68%"},{date:"07/01/2016",price:"10,337.50","Open":"9,742.84","High":"10,381.90","Low":"9,304.01","Vol.":"1.87B","Change %":"6.79%"},{date:"08/01/2016",price:"10,592.69","Open":"10,426.36","High":"10,802.32","Low":"10,092.53","Vol.":"1.62B","Change %":"2.47%"},{date:"09/01/2016",price:"10,511.02","Open":"10,622.33","High":"10,780.42","Low":"10,189.94","Vol.":"2.24B","Change %":"-0.77%"},{date:"10/01/2016",price:"10,665.01","Open":"10,492.97","High":"10,827.72","Low":"10,349.06","Vol.":"1.85B","Change %":"1.47%"},{date:"11/01/2016",price:"10,640.30","Open":"10,724.14","High":"10,802.39","Low":"10,174.92","Vol.":"2.19B","Change %":"-0.23%"},{date:"12/01/2016",price:"11,481.06","Open":"10,593.06","High":"11,481.66","Low":"10,402.59","Vol.":"1.98B","Change %":"7.90%"},{date:"01/01/2017",price:"11,535.31","Open":"11,426.38","High":"11,893.08","Low":"11,414.82","Vol.":"1.90B","Change %":"0.47%"},{date:"02/01/2017",price:"11,834.41","Open":"11,646.42","High":"12,031.11","Low":"11,479.78","Vol.":"1.69B","Change %":"2.59%"},{date:"03/01/2017",price:"12,312.87","Open":"11,915.03","High":"12,313.29","Low":"11,850.27","Vol.":"2.43B","Change %":"4.04%"},{date:"04/01/2017",price:"12,438.01","Open":"12,368.82","High":"12,486.29","Low":"11,941.57","Vol.":"1.70B","Change %":"1.02%"},{date:"05/01/2017",price:"12,615.06","Open":"12,478.46","High":"12,841.66","Low":"12,433.51","Vol.":"2.07B","Change %":"1.42%"},{date:"06/01/2017",price:"12,325.12","Open":"12,623.61","High":"12,951.54","Low":"12,319.00","Vol.":"2.11B","Change %":"-2.30%"},{date:"07/01/2017",price:"12,118.25","Open":"12,396.34","High":"12,676.52","Low":"12,097.36","Vol.":"1.83B","Change %":"-1.68%"},{date:"08/01/2017",price:"12,055.84","Open":"12,147.89","High":"12,336.00","Low":"11,868.84","Vol.":"1.79B","Change %":"-0.52%"},{date:"09/01/2017",price:"12,828.86","Open":"12,101.15","High":"12,828.86","Low":"12,050.53","Vol.":"1.83B","Change %":"6.41%"},{date:"10/01/2017",price:"13,229.57","Open":"12,866.27","High":"13,255.38","Low":"12,849.59","Vol.":"1.61B","Change %":"3.12%"},{date:"11/01/2017",price:"13,023.98","Open":"13,342.44","High":"13,525.56","Low":"12,847.88","Vol.":"2.19B","Change %":"-1.55%"},{date:"12/01/2017",price:"12,917.64","Open":"13,044.15","High":"13,338.91","Low":"12,810.13","Vol.":"1.67B","Change %":"-0.82%"},{date:"01/01/2018",price:"13,189.48","Open":"12,897.69","High":"13,596.89","Low":"12,745.15","Vol.":"2.17B","Change %":"2.10%"},{date:"02/01/2018",price:"12,435.85","Open":"13,235.15","High":"13,301.41","Low":"12,003.36","Vol.":"2.40B","Change %":"-5.71%"},{date:"03/01/2018",price:"12,096.73","Open":"12,386.40","High":"12,459.90","Low":"11,726.62","Vol.":"2.49B","Change %":"-2.73%"},{date:"04/01/2018",price:"12,612.11","Open":"11,997.47","High":"12,647.16","Low":"11,792.35","Vol.":"1.92B","Change %":"4.26%"},{date:"05/01/2018",price:"12,604.89","Open":"12,610.78","High":"13,204.31","Low":"12,547.61","Vol.":"2.29B","Change %":"-0.06%"},{date:"06/01/2018",price:"12,306.00","Open":"12,678.07","High":"13,170.05","Low":"12,104.41","Vol.":"2.40B","Change %":"-2.37%"},{date:"07/01/2018",price:"12,805.50","Open":"12,147.94","High":"12,886.83","Low":"12,132.72","Vol.":"2.03B","Change %":"4.06%"},{date:"08/01/2018",price:"12,364.06","Open":"12,826.70","High":"12,833.11","Low":"12,120.65","Vol.":"1.88B","Change %":"-3.45%"},{date:"09/01/2018",price:"12,246.73","Open":"12,338.36","High":"12,458.30","Low":"11,865.47","Vol.":"2.15B","Change %":"-0.95%"},{date:"10/01/2018",price:"11,447.51","Open":"12,265.89","High":"12,373.29","Low":"11,051.04","Vol.":"2.31B","Change %":"-6.53%"},{date:"11/01/2018",price:"11,257.24","Open":"11,419.61","High":"11,689.96","Low":"11,009.25","Vol.":"2.06B","Change %":"-1.66%"},{date:"12/01/2018",price:"10,558.96","Open":"11,534.75","High":"11,566.97","Low":"10,279.20","Vol.":"1.81B","Change %":"-6.20%"},{date:"01/01/2019",price:"11,173.10","Open":"10,477.77","High":"11,321.62","Low":"10,386.97","Vol.":"1.93B","Change %":"5.82%"},{date:"02/01/2019",price:"11,515.64","Open":"11,198.46","High":"11,556.87","Low":"10,863.56","Vol.":"1.66B","Change %":"3.07%"},{date:"03/01/2019",price:"11,526.04","Open":"11,584.24","High":"11,823.29","Low":"11,299.80","Vol.":"1.93B","Change %":"0.09%"},{date:"04/01/2019",price:"12,344.08","Open":"11,617.18","High":"12,376.06","Low":"11,612.70","Vol.":"1.69B","Change %":"7.10%"},{date:"05/01/2019",price:"11,726.84","Open":"12,349.10","High":"12,435.67","Low":"11,662.07","Vol.":"2.17B","Change %":"-5.00%"},{date:"06/01/2019",price:"12,398.80","Open":"11,661.12","High":"12,438.37","Low":"11,620.64","Vol.":"1.85B","Change %":"5.73%"},{date:"07/01/2019",price:"12,189.04","Open":"12,616.34","High":"12,656.05","Low":"12,115.28","Vol.":"1.90B","Change %":"-1.69%"},{date:"08/01/2019",price:"11,939.28","Open":"12,134.71","High":"12,254.03","Low":"11,266.48","Vol.":"2.02B","Change %":"-2.05%"},{date:"09/01/2019",price:"12,428.08","Open":"11,939.99","High":"12,494.25","Low":"11,869.28","Vol.":"1.75B","Change %":"4.09%"},{date:"10/01/2019",price:"12,866.79","Open":"12,469.67","High":"12,986.49","Low":"11,878.98","Vol.":"1.84B","Change %":"3.53%"},{date:"11/01/2019",price:"13,236.38","Open":"12,912.09","High":"13,374.27","Low":"12,896.72","Vol.":"1.60B","Change %":"2.87%"},{date:"12/01/2019",price:"13,249.01","Open":"13,264.93","High":"13,425.85","Low":"12,886.55","Vol.":"1.37B","Change %":"0.10%"},{date:"01/01/2020",price:"12,981.97","Open":"13,233.71","High":"13,640.06","Low":"12,948.17","Vol.":"1.74B","Change %":"-2.02%"},{date:"02/01/2020",price:"11,890.35","Open":"13,033.17","High":"13,795.24","Low":"11,724.12","Vol.":"2.23B","Change %":"-8.41%"},{date:"03/01/2020",price:"9,935.84","Open":"12,030.27","High":"12,272.99","Low":"8,255.65","Vol.":"4.83B","Change %":"-16.44%"},{date:"04/01/2020",price:"10,861.64","Open":"9,610.67","High":"11,235.57","Low":"9,337.02","Vol.":"2.51B","Change %":"9.32%"},{date:"05/01/2020",price:"11,586.85","Open":"10,543.36","High":"11,813.14","Low":"10,160.89","Vol.":"2.22B","Change %":"6.68%"},{date:"06/01/2020",price:"12,310.93","Open":"11,896.70","High":"12,913.13","Low":"11,597.82","Vol.":"2.75B","Change %":"6.25%"},{date:"07/01/2020",price:"12,313.36","Open":"12,391.72","High":"13,313.90","Low":"12,095.11","Vol.":"1.71B","Change %":"0.02%"},{date:"08/01/2020",price:"12,945.38","Open":"12,374.46","High":"13,221.82","Low":"12,365.61","Vol.":"1.26B","Change %":"5.13%"},{date:"09/01/2020",price:"12,760.73","Open":"13,037.20","High":"13,460.46","Low":"12,341.58","Vol.":"1.62B","Change %":"-1.43%"},{date:"10/01/2020",price:"11,556.48","Open":"12,812.08","High":"13,151.80","Low":"11,450.08","Vol.":"1.56B","Change %":"-9.44%"},{date:"11/01/2020",price:"13,291.16","Open":"11,602.91","High":"13,445.11","Low":"11,551.36","Vol.":"1.83B","Change %":"15.01%"},{date:"12/01/2020",price:"13,718.78","Open":"13,371.66","High":"13,903.11","Low":"13,009.48","Vol.":"1.36B","Change %":"3.22%"},{date:"01/01/2021",price:"13,432.87","Open":"13,890.22","High":"14,131.52","Low":"13,310.95","Vol.":"1.56B","Change %":"-2.08%"},{date:"02/01/2021",price:"13,786.29","Open":"13,559.94","High":"14,169.49","Low":"13,518.45","Vol.":"1.44B","Change %":"2.63%"},{date:"03/01/2021",price:"15,008.34","Open":"13,962.43","High":"15,029.70","Low":"13,868.20","Vol.":"1.94B","Change %":"8.86%"},{date:"04/01/2021",price:"15,135.91","Open":"15,053.77","High":"15,501.84","Low":"15,032.52","Vol.":"1.32B","Change %":"0.85%"},{date:"05/01/2021",price:"15,421.13","Open":"15,191.79","High":"15,568.60","Low":"14,816.35","Vol.":"1.44B","Change %":"1.88%"},{date:"06/01/2021",price:"15,531.04","Open":"15,513.13","High":"15,802.67","Low":"15,309.44","Vol.":"1.23B","Change %":"0.71%"},{date:"07/01/2021",price:"15,544.39","Open":"15,624.28","High":"15,810.68","Low":"15,048.56","Vol.":"1.21B","Change %":"0.09%"},{date:"08/01/2021",price:"15,835.09","Open":"15,631.70","High":"16,030.33","Low":"15,492.58","Vol.":"1.03B","Change %":"1.87%"},{date:"09/01/2021",price:"15,260.69","Open":"15,958.41","High":"15,981.70","Low":"15,019.49","Vol.":"1.34B","Change %":"-3.63%"},{date:"10/01/2021",price:"15,688.77","Open":"15,041.60","High":"15,781.00","Low":"14,818.71","Vol.":"1.35B","Change %":"2.81%"},{date:"11/01/2021",price:"15,100.13","Open":"15,764.55","High":"16,290.19","Low":"15,015.42","Vol.":"1.64B","Change %":"-3.75%"},{date:"12/01/2021",price:"15,884.86","Open":"15,233.37","High":"15,974.79","Low":"15,060.10","Vol.":"1.35B","Change %":"5.20%"},{date:"01/01/2022",price:"15,471.20","Open":"15,947.44","High":"16,285.35","Low":"14,952.67","Vol.":"1.66B","Change %":"-2.60%"},{date:"02/01/2022",price:"14,461.02","Open":"15,620.56","High":"15,736.52","Low":"13,807.28","Vol.":"2.03B","Change %":"-6.53%"},{date:"03/01/2022",price:"14,414.75","Open":"14,404.22","High":"14,925.25","Low":"12,438.85","Vol.":"2.77B","Change %":"-0.32%"},{date:"04/01/2022",price:"14,097.88","Open":"14,447.78","High":"14,603.44","Low":"13,566.20","Vol.":"1.65B","Change %":"-2.20%"},{date:"05/01/2022",price:"14,388.35","Open":"13,996.82","High":"14,589.45","Low":"13,380.67","Vol.":"1.80B","Change %":"2.06%"},{date:"06/01/2022",price:"12,783.77","Open":"14,478.37","High":"14,709.38","Low":"12,618.68","Vol.":"1.72B","Change %":"-11.15%"},{date:"07/01/2022",price:"13,484.05","Open":"12,627.66","High":"13,515.03","Low":"12,390.95","Vol.":"1.52B","Change %":"5.48%"},{date:"08/01/2022",price:"12,834.96","Open":"13,471.20","High":"13,947.85","Low":"12,758.44","Vol.":"1.31B","Change %":"-4.81%"},{date:"09/01/2022",price:"12,114.36","Open":"12,713.75","High":"13,564.83","Low":"11,862.84","Vol.":"1.61B","Change %":"-5.61%"},{date:"10/01/2022",price:"13,253.74","Open":"11,951.84","High":"13,307.09","Low":"11,893.94","Vol.":"1.40B","Change %":"9.41%"},{date:"11/01/2022",price:"14,397.04","Open":"13,344.85","High":"14,571.66","Low":"13,022.64","Vol.":"1.46B","Change %":"8.63%"},{date:"12/01/2022",price:"13,923.59","Open":"14,543.80","High":"14,675.84","Low":"13,791.52","Vol.":"1.13B","Change %":"-3.29%"},{date:"01/01/2023",price:"15,128.27","Open":"13,992.71","High":"15,269.71","Low":"13,976.44","Vol.":"1.26B","Change %":"8.65%"},{date:"02/01/2023",price:"15,365.14","Open":"15,125.12","High":"15,658.56","Low":"15,107.83","Vol.":"1.32B","Change %":"1.57%"},{date:"03/01/2023",price:"15,628.84","Open":"15,399.91","High":"15,706.37","Low":"14,458.39","Vol.":"2.33B","Change %":"1.72%"},{date:"04/01/2023",price:"15,922.38","Open":"15,623.45","High":"15,922.38","Low":"15,482.88","Vol.":"1.23B","Change %":"1.88%"},{date:"05/01/2023",price:"15,664.02","Open":"15,950.36","High":"16,331.94","Low":"15,629.12","Vol.":"1.52B","Change %":"-1.62%"},{date:"06/01/2023",price:"16,147.90","Open":"15,744.01","High":"16,427.42","Low":"15,713.70","Vol.":"1.66B","Change %":"3.09%"},{date:"07/01/2023",price:"16,446.83","Open":"16,187.91","High":"16,528.97","Low":"15,456.16","Vol.":"1.34B","Change %":"1.85%"},{date:"08/01/2023",price:"15,947.08","Open":"16,414.79","High":"16,430.66","Low":"15,468.65","Vol.":"1.35B","Change %":"-3.04%"},{date:"09/01/2023",price:"15,386.58","Open":"15,936.34","High":"15,989.30","Low":"15,138.66","Vol.":"1.48B","Change %":"-3.51%"},{date:"10/01/2023",price:"14,810.34","Open":"15,439.96","High":"15,575.28","Low":"14,630.21","Vol.":"1.51B","Change %":"-3.75%"},{date:"11/01/2023",price:"16,215.43","Open":"14,851.96","High":"16,262.96","Low":"14,786.32","Vol.":"1.62B","Change %":"9.49%"},{date:"12/01/2023",price:"16,751.64","Open":"16,296.92","High":"17,003.28","Low":"16,279.45","Vol.":"1.32B","Change %":"3.31%"},{date:"01/01/2024",price:"16,903.76","Open":"16,828.75","High":"16,999.58","Low":"16,345.02","Vol.":"1.47B","Change %":"0.91%"},{date:"02/01/2024",price:"17,678.19","Open":"16,834.13","High":"17,742.48","Low":"16,821.60","Vol.":"1.47B","Change %":"4.58%"},{date:"03/01/2024",price:"18,492.49","Open":"17,795.15","High":"18,514.65","Low":"17,619.45","Vol.":"75.72M","Change %":"4.61%"},{date:"04/01/2024",price:"17,932.17","Open":"18,119.93","High":"18,153.69","Low":"17,920.72","Vol.":"88.21M","Change %":"-3.03%"},{date:"05/01/2024",price:"18,497.94","Open":"17,919.75","High":"18,890.05","Low":"17,874.85","Vol.":"144.01M","Change %":"3.16%"},{date:"06/01/2024",price:"18,235.45","Open":"18,658.85","High":"18,786.35","Low":"17,949.85","Vol.":"64.59M","Change %":"-1.42%"},{date:"07/01/2024",price:"18,508.65","Open":"18,419.75","High":"18,781.45","Low":"18,023.45","Vol.":"62.45M","Change %":"1.50%"},{date:"08/01/2024",price:"18,906.92","Open":"18,404.95","High":"18,971.75","Low":"17,021.65","Vol.":"95.58M","Change %":"2.15%"},{date:"09/01/2024",price:"19,324.93","Open":"18,913.53","High":"19,491.93","Low":"18,208.84","Vol.":"1.39B","Change %":"2.21%"},{date:"10/01/2024",price:"19,077.54","Open":"19,409.39","High":"19,674.68","Low":"18,911.72","Vol.":"1.22B","Change %":"-1.28%"},{date:"11/01/2024",price:"19,626.45","Open":"19,093.99","High":"19,640.15","Low":"18,812.53","Vol.":"1.42B","Change %":"2.88%"},{date:"12/01/2024",price:"19,909.14","Open":"19,586.17","High":"20,522.82","Low":"19,568.50","Vol.":"1.11B","Change %":"1.44%"},{date:"01/01/2025",price:"21,732.05","Open":"19,923.07","High":"21,800.52","Low":"19,833.82","Vol.":"1.42B","Change %":"9.16%"},{date:"02/01/2025",price:"22,551.43","Open":"21,301.53","High":"22,935.06","Low":"21,252.71","Vol.":"1.44B","Change %":"3.77%"},{date:"03/01/2025",price:"22,163.49","Open":"22,682.95","High":"23,476.01","Low":"21,978.46","Vol.":"1.95B","Change %":"-1.72%"},{date:"04/01/2025",price:"20,787.44","Open":"22,343.41","High":"22,573.71","Low":"18,813.25","Vol.":"1.02B","Change %":"-6.21%"}]
        //console.log(JSON.stringify(daxData.map(item => ({ date: item.date, price: parseFloat(item.price.replace(",", "")) }))));
        const daxData = [{date:"07/01/2002",price:3700.14},{date:"08/01/2002",price:3712.94},{date:"09/01/2002",price:2769.03},{date:"10/01/2002",price:3152.85},{date:"11/01/2002",price:3320.32},{date:"12/01/2002",price:2892.63},{date:"01/01/2003",price:2747.83},{date:"02/01/2003",price:2547.05},{date:"03/01/2003",price:2423.87},{date:"04/01/2003",price:2942.04},{date:"05/01/2003",price:2982.68},{date:"06/01/2003",price:3220.58},{date:"07/01/2003",price:3487.86},{date:"08/01/2003",price:3484.58},{date:"09/01/2003",price:3256.78},{date:"10/01/2003",price:3655.99},{date:"11/01/2003",price:3745.95},{date:"12/01/2003",price:3965.16},{date:"01/01/2004",price:4058.6},{date:"02/01/2004",price:4018.16},{date:"03/01/2004",price:3856.7},{date:"04/01/2004",price:3985.21},{date:"05/01/2004",price:3921.41},{date:"06/01/2004",price:4052.73},{date:"07/01/2004",price:3895.61},{date:"08/01/2004",price:3785.21},{date:"09/01/2004",price:3892.9},{date:"10/01/2004",price:3960.25},{date:"11/01/2004",price:4126},{date:"12/01/2004",price:4256.08},{date:"01/01/2005",price:4254.85},{date:"02/01/2005",price:4350.49},{date:"03/01/2005",price:4348.77},{date:"04/01/2005",price:4184.84},{date:"05/01/2005",price:4460.63},{date:"06/01/2005",price:4586.28},{date:"07/01/2005",price:4886.5},{date:"08/01/2005",price:4829.69},{date:"09/01/2005",price:5044.12},{date:"10/01/2005",price:4929.07},{date:"11/01/2005",price:5193.4},{date:"12/01/2005",price:5408.26},{date:"01/01/2006",price:5674.15},{date:"02/01/2006",price:5796.04},{date:"03/01/2006",price:5970.08},{date:"04/01/2006",price:6009.89},{date:"05/01/2006",price:5692.86},{date:"06/01/2006",price:5683.31},{date:"07/01/2006",price:5681.97},{date:"08/01/2006",price:5859.57},{date:"09/01/2006",price:6004.33},{date:"10/01/2006",price:6268.92},{date:"11/01/2006",price:6309.19},{date:"12/01/2006",price:6596.92},{date:"01/01/2007",price:6789.11},{date:"02/01/2007",price:6715.44},{date:"03/01/2007",price:6917.03},{date:"04/01/2007",price:7408.87},{date:"05/01/2007",price:7883.04},{date:"06/01/2007",price:8007.32},{date:"07/01/2007",price:7584.14},{date:"08/01/2007",price:7638.17},{date:"09/01/2007",price:7861.51},{date:"10/01/2007",price:8019.22},{date:"11/01/2007",price:7870.52},{date:"12/01/2007",price:8067.32},{date:"01/01/2008",price:6851.75},{date:"02/01/2008",price:6748.13},{date:"03/01/2008",price:6534.97},{date:"04/01/2008",price:6948.82},{date:"05/01/2008",price:7096.79},{date:"06/01/2008",price:6418.32},{date:"07/01/2008",price:6479.56},{date:"08/01/2008",price:6422.3},{date:"09/01/2008",price:5831.02},{date:"10/01/2008",price:4987.97},{date:"11/01/2008",price:4669.44},{date:"12/01/2008",price:4810.2},{date:"01/01/2009",price:4338.35},{date:"02/01/2009",price:3843.74},{date:"03/01/2009",price:4084.76},{date:"04/01/2009",price:4769.45},{date:"05/01/2009",price:4940.82},{date:"06/01/2009",price:4808.64},{date:"07/01/2009",price:5332.14},{date:"08/01/2009",price:5464.61},{date:"09/01/2009",price:5675.16},{date:"10/01/2009",price:5414.96},{date:"11/01/2009",price:5625.95},{date:"12/01/2009",price:5957.43},{date:"01/01/2010",price:5608.79},{date:"02/01/2010",price:5598.46},{date:"03/01/2010",price:6153.55},{date:"04/01/2010",price:6135.7},{date:"05/01/2010",price:5964.33},{date:"06/01/2010",price:5965.52},{date:"07/01/2010",price:6147.97},{date:"08/01/2010",price:5925.22},{date:"09/01/2010",price:6229.02},{date:"10/01/2010",price:6601.37},{date:"11/01/2010",price:6688.49},{date:"12/01/2010",price:6914.19},{date:"01/01/2011",price:7077.48},{date:"02/01/2011",price:7272.32},{date:"03/01/2011",price:7041.31},{date:"04/01/2011",price:7514.46},{date:"05/01/2011",price:7293.69},{date:"06/01/2011",price:7376.24},{date:"07/01/2011",price:7158.77},{date:"08/01/2011",price:5784.85},{date:"09/01/2011",price:5502.02},{date:"10/01/2011",price:6141.34},{date:"11/01/2011",price:6088.84},{date:"12/01/2011",price:5898.35},{date:"01/01/2012",price:6458.91},{date:"02/01/2012",price:6856.08},{date:"03/01/2012",price:6946.83},{date:"04/01/2012",price:6761.19},{date:"05/01/2012",price:6264.38},{date:"06/01/2012",price:6416.28},{date:"07/01/2012",price:6772.26},{date:"08/01/2012",price:6970.79},{date:"09/01/2012",price:7216.15},{date:"10/01/2012",price:7260.63},{date:"11/01/2012",price:7405.5},{date:"12/01/2012",price:7612.39},{date:"01/01/2013",price:7776.05},{date:"02/01/2013",price:7741.7},{date:"03/01/2013",price:7795.31},{date:"04/01/2013",price:7913.71},{date:"05/01/2013",price:8348.84},{date:"06/01/2013",price:7959.22},{date:"07/01/2013",price:8275.97},{date:"08/01/2013",price:8103.15},{date:"09/01/2013",price:8594.4},{date:"10/01/2013",price:9033.92},{date:"11/01/2013",price:9405.3},{date:"12/01/2013",price:9552.16},{date:"01/01/2014",price:9306.48},{date:"02/01/2014",price:9692.08},{date:"03/01/2014",price:9555.91},{date:"04/01/2014",price:9603.23},{date:"05/01/2014",price:9943.27},{date:"06/01/2014",price:9833.07},{date:"07/01/2014",price:9407.48},{date:"08/01/2014",price:9470.17},{date:"09/01/2014",price:9474.3},{date:"10/01/2014",price:9326.87},{date:"11/01/2014",price:9980.85},{date:"12/01/2014",price:9805.55},{date:"01/01/2015",price:10694.32},{date:"02/01/2015",price:11401.66},{date:"03/01/2015",price:11966.17},{date:"04/01/2015",price:11454.38},{date:"05/01/2015",price:11413.82},{date:"06/01/2015",price:10944.97},{date:"07/01/2015",price:11308.99},{date:"08/01/2015",price:10259.46},{date:"09/01/2015",price:9660.44},{date:"10/01/2015",price:10850.14},{date:"11/01/2015",price:11382.23},{date:"12/01/2015",price:10743.01},{date:"01/01/2016",price:9798.11},{date:"02/01/2016",price:9495.4},{date:"03/01/2016",price:9965.51},{date:"04/01/2016",price:10038.97},{date:"05/01/2016",price:10262.74},{date:"06/01/2016",price:9680.09},{date:"07/01/2016",price:10337.5},{date:"08/01/2016",price:10592.69},{date:"09/01/2016",price:10511.02},{date:"10/01/2016",price:10665.01},{date:"11/01/2016",price:10640.3},{date:"12/01/2016",price:11481.06},{date:"01/01/2017",price:11535.31},{date:"02/01/2017",price:11834.41},{date:"03/01/2017",price:12312.87},{date:"04/01/2017",price:12438.01},{date:"05/01/2017",price:12615.06},{date:"06/01/2017",price:12325.12},{date:"07/01/2017",price:12118.25},{date:"08/01/2017",price:12055.84},{date:"09/01/2017",price:12828.86},{date:"10/01/2017",price:13229.57},{date:"11/01/2017",price:13023.98},{date:"12/01/2017",price:12917.64},{date:"01/01/2018",price:13189.48},{date:"02/01/2018",price:12435.85},{date:"03/01/2018",price:12096.73},{date:"04/01/2018",price:12612.11},{date:"05/01/2018",price:12604.89},{date:"06/01/2018",price:12306},{date:"07/01/2018",price:12805.5},{date:"08/01/2018",price:12364.06},{date:"09/01/2018",price:12246.73},{date:"10/01/2018",price:11447.51},{date:"11/01/2018",price:11257.24},{date:"12/01/2018",price:10558.96},{date:"01/01/2019",price:11173.1},{date:"02/01/2019",price:11515.64},{date:"03/01/2019",price:11526.04},{date:"04/01/2019",price:12344.08},{date:"05/01/2019",price:11726.84},{date:"06/01/2019",price:12398.8},{date:"07/01/2019",price:12189.04},{date:"08/01/2019",price:11939.28},{date:"09/01/2019",price:12428.08},{date:"10/01/2019",price:12866.79},{date:"11/01/2019",price:13236.38},{date:"12/01/2019",price:13249.01},{date:"01/01/2020",price:12981.97},{date:"02/01/2020",price:11890.35},{date:"03/01/2020",price:9935.84},{date:"04/01/2020",price:10861.64},{date:"05/01/2020",price:11586.85},{date:"06/01/2020",price:12310.93},{date:"07/01/2020",price:12313.36},{date:"08/01/2020",price:12945.38},{date:"09/01/2020",price:12760.73},{date:"10/01/2020",price:11556.48},{date:"11/01/2020",price:13291.16},{date:"12/01/2020",price:13718.78},{date:"01/01/2021",price:13432.87},{date:"02/01/2021",price:13786.29},{date:"03/01/2021",price:15008.34},{date:"04/01/2021",price:15135.91},{date:"05/01/2021",price:15421.13},{date:"06/01/2021",price:15531.04},{date:"07/01/2021",price:15544.39},{date:"08/01/2021",price:15835.09},{date:"09/01/2021",price:15260.69},{date:"10/01/2021",price:15688.77},{date:"11/01/2021",price:15100.13},{date:"12/01/2021",price:15884.86},{date:"01/01/2022",price:15471.2},{date:"02/01/2022",price:14461.02},{date:"03/01/2022",price:14414.75},{date:"04/01/2022",price:14097.88},{date:"05/01/2022",price:14388.35},{date:"06/01/2022",price:12783.77},{date:"07/01/2022",price:13484.05},{date:"08/01/2022",price:12834.96},{date:"09/01/2022",price:12114.36},{date:"10/01/2022",price:13253.74},{date:"11/01/2022",price:14397.04},{date:"12/01/2022",price:13923.59},{date:"01/01/2023",price:15128.27},{date:"02/01/2023",price:15365.14},{date:"03/01/2023",price:15628.84},{date:"04/01/2023",price:15922.38},{date:"05/01/2023",price:15664.02},{date:"06/01/2023",price:16147.9},{date:"07/01/2023",price:16446.83},{date:"08/01/2023",price:15947.08},{date:"09/01/2023",price:15386.58},{date:"10/01/2023",price:14810.34},{date:"11/01/2023",price:16215.43},{date:"12/01/2023",price:16751.64},{date:"01/01/2024",price:16903.76},{date:"02/01/2024",price:17678.19},{date:"03/01/2024",price:18492.49},{date:"04/01/2024",price:17932.17},{date:"05/01/2024",price:18497.94},{date:"06/01/2024",price:18235.45},{date:"07/01/2024",price:18508.65},{date:"08/01/2024",price:18906.92},{date:"09/01/2024",price:19324.93},{date:"10/01/2024",price:19077.54},{date:"11/01/2024",price:19626.45},{date:"12/01/2024",price:19909.14},{date:"01/01/2025",price:21732.05},{date:"02/01/2025",price:22551.43},{date:"03/01/2025",price:22163.49},{date:"04/01/2025",price:20787.44}]
        const msciGraphData = msciWorldData.map(item => item.value);
        let labels = msciWorldData.map(item => item.date);
        const daxGraphData = daxData.map(item => item.price);
        const ctx = document.getElementById('stocksChart');
        updateTheme();
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'DAX',
                        data: daxGraphData,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'MSCI World',
                        data: msciGraphData,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        tension: 0.05,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: fontColor
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor,
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '',
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    },
                    y1: {
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '',
                            color: fontColor
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor
                        }
                    }
                }
            }
        };
        if (window.stoksChartInstance) {
            window.stoksChartInstance.destroy();
        }
        window.stoksChartInstance = new Chart(ctx, config);

    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}
displayStocks()

//----------------------------- Helpers -----------------------------------
document.querySelector(".theme-toggle").addEventListener("click", () => {
    setTimeout(() => {
        displayPM25Value();
        displayWeather();
        displayCO2();
        displayInflation();
        displayStocks();
    }, 10);
});

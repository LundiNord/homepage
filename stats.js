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
            { year: 2002, value: 0 },
            { year: 2003, value: 0 },
            { year: 2004, value: 0 },
            { year: 2005, value: 0 },
            { year: 2006, value: 0 },
            { year: 2007, value: 0 },
            { year: 2008, value: 0 },
            { year: 2009, value: 0 },
            { year: 2010, value: 0 },
            { year: 2011, value: 0 },
            { year: 2012, value: 0 },
            { year: 2013, value: 0 },
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

//----------------------------- Helpers -----------------------------------
document.querySelector(".theme-toggle").addEventListener("click", () => {
    setTimeout(() => {
        displayPM25Value();
        displayWeather();
        displayCO2();
        displayInflation();
    }, 10);
});

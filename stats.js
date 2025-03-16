let currentTheme;
let gridColor;
let fontColor;
function updateTheme() {
    currentTheme = document.documentElement.getAttribute("data-theme");
    gridColor = currentTheme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    fontColor = currentTheme === "dark" ? '#eee' : '#333';
}
updateTheme();

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

//----------------------------- Helpers -----------------------------------
document.querySelector(".theme-toggle").addEventListener("click", () => {
    setTimeout(() => {
        displayPM25Value();
        displayWeather();
    }, 10);
});

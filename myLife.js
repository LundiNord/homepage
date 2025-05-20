const items = document.querySelectorAll('.chart li');
const weeks_lived = weeksLived();

//----------------------------- Sections -----------------------------------

paintWeeksWithDate("2008-09-11", "2013-07-25", "blue", "Elementary School");
paintWeeksWithDate("2013-09-10", "2022-07-07", "green", "Highschool");
paintWeeksWithDate("2019-07-16", "2019-12-18", "gray", "Half year abroad in New Zealand");
paintWeeksWithDate("2022-11-19", new Date, "yellow", "Bachelor at KIT");

paintWeeks("red", weeks_lived, weeks_lived, "now");
paintWeekWithDate("2021-04-21", "red", "First Java Programm written");
paintWeekWithDate("2002-07-01", "red", "My first week on this planet, Hooray!");

//----------------------------- Helpers -----------------------------------

function paintWeekWithDate(date, color, tooltip) {
    paintWeeksWithDate(date, date, color, tooltip);
}
function paintWeeksWithDate(startDate, endDate, color, tooltip) {
    const startWeek = Math.floor((new Date(startDate) - new Date('2002-07-01T00:00:00Z')) / (1000 * 60 * 60 * 24 * 7));
    const endWeek = Math.floor((new Date(endDate) - new Date('2002-07-01T00:00:00Z')) / (1000 * 60 * 60 * 24 * 7));
    paintWeeks(color, startWeek, endWeek, tooltip);
}
function paintWeeks(color, weekStart, weekEnd, tooltip) {
    let j = 1;
    for (let i = weekStart - 1; i <= weekEnd - 1; i++) {
        items[i + 1].style.backgroundColor = color;
        items[i + 1].setAttribute('data-tooltip', "Week: " + (i + 1) + " " + tooltip + " week: " + j);
        j++;
    }
}
function weeksLived() {
    const birthDate = new Date('2002-07-01T00:00:00Z'); // Specify time in UTC
    const now = new Date();
    const diffInMilliseconds = now - birthDate;
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return weeksLived = Math.floor(diffInMilliseconds / millisecondsPerWeek);
}

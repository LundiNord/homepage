const items = document.querySelectorAll('.chart li');

//----------------------------- Sections -----------------------------------



paintWeeks("green", 598, 1066, "Highschool");


const weeks_lived = weeksLived();
paintWeeks("red", weeks_lived, weeks_lived, "now");
//----------------------------- Helpers -----------------------------------

function paintWeeks(color, weekStart, weekEnd, tooltip) {
    for (let i = weekStart - 1; i <= weekEnd - 1; i++) {
        items[i].style.backgroundColor = color;
        items[i].setAttribute('data-tooltip', tooltip);
    }
}
function weeksLived() {
    const birthDate = new Date('2002-07-01T00:00:00Z'); // Specify time in UTC
    const now = new Date();
    const diffInMilliseconds = now - birthDate;
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return weeksLived = Math.floor(diffInMilliseconds / millisecondsPerWeek);
}


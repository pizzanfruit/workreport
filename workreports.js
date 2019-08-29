// Example usage
// workreport("一括処理のUnitTest", false, "2019/07/22");

const tokenCookie = getCookie("YII_CSRF_TOKEN");
const token = tokenCookie.match(/^(\w+)%3A(\w+)%3A%22(\w+)%22%3B$/)[3];
if (!token) console.log("log in first dude");

const taskIdByType = {
    officeCleaning: 10574,
    dailyMeeting: 10516,
    psMeeting: 10572,
    lunch: 10568,
    backlog: 10608,
    retrospective: 10519,
    planning: 10517,
    review: 10520
};

window.workreport = workreport;

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function workreport(backlogTask, isEndOfSprint, startStr) {
    // - Office cleaning
    const now = new Date();
    let start;
    if (!startStr || startStr == "") {
        start = getMonday(now);
    } else {
        start = new Date(startStr);
    }
    if (!isFinite(start)) {
        console.error("Invalid start date! Try again...");
        return;
    }
    let end = getFriday(now);
    let current = new Date(start);
    let tzoffset = new Date().getTimezoneOffset() * 60000;
    while (current.getTime() <= end.getTime()) {
        const currentDay = current.getDay();
        if (currentDay === 0 || currentDay === 6) {
            // No work on Sunday and Saturday
            return;
        }
        let currentStr = new Date(current.getTime() - tzoffset)
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "/");
        const report = reportForDate(currentStr);
        console.log(`**${currentStr}**`);
        report("backlog", "9:00", "9:15", backlogTask);
        report("officeCleaning", "9:15", "10:30", "Office cleaning");
        report("dailyMeeting", "10:30", "10:45", "Daily meeting");
        report("backlog", "10:45", "12:00", backlogTask);
        report("lunch", "12:00", "13:00", "Lunch");
        if (isEndOfSprint && currentDay === 4) {
            // Thursday of end of sprint week
            report("review", "13:00", "14:00", "Scrum review");
            report("retrospective", "14:00", "15:30", "Scrum retrospective");
            report("planning", "15:30", "18:00", "Scrum planning");
        } else {
            report("backlog", "13:00", "18:00", backlogTask);
        }
        // next day
        current.setDate(current.getDate() + 1);
        console.log("\n");
    }
}

function getMonday(d) {
    const diffFromMonday = d.getDay() - 1;
    if (diffFromMonday === -1) {
        diffFromMonday = 6;
    }
    return new Date(d.setDate(d.getDate() - diffFromMonday));
}

function getFriday(d) {
    const diffFromFriday = 5 - d.getDay();
    return new Date(d.setDate(d.getDate() + diffFromFriday));
}

function reportForDate(date) {
    return (type, start, end, task) => {
        let taskId = taskIdByType[type];
        if (!type) {
            console.error("Unknown task type!");
            return;
        }
        let startStr = start || "13:00";
        let endStr = end || "18:00";
        let taskStr = task || "dummy task";
        console.log("task", date, startStr, endStr, taskStr);
        fetch("https://hrbc-jp.porterscloud.com/screen/update?mode=add", {
            credentials: "include",
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9,vi;q=0.8,ja;q=0.7,ko;q=0.6",
                "cache-control": "max-age=0",
                "content-type": "application/json; charset=UTF-8",
                "if-modified-since": "01 Jan 1970 00:00:00 GMT",
                "x-requested-with": "XMLHttpRequest"
            },
            referrer: "https://hrbc-jp.porterscloud.com/calendar",
            referrerPolicy: "no-referrer-when-downgrade",
            body: `{\"form\":{\"displayItem_9010\":\"${taskStr}\",\"displayItem_9011\":\"${taskStr}\",\"displayItem_10317\":[${taskId}],\"displayItem_9007\":\"${date} ${startStr}\",\"displayItem_9008\":\"${date} ${endStr}\",\"displayItem_10308\":null,\"displayItem_10309\":null,\"displayItem_10035\":null,\"displayItem_10315\":null,\"displayItem_10314\":null,\"displayItem_9001\":null,\"displayItem_9012\":null,\"displayItem_9013\":null,\"displayItem_9006\":\"212\",\"displayItem_9014\":null,\"displayItem_9015\":null,\"displayItem_9002\":null,\"displayItem_9005\":null,\"displayItem_10036\":[\"212\"],\"displayItem_9003\":null,\"displayItem_9004\":null},\"type\":\"activity\",\"id\":\"\",\"parent_type\":null,\"mail_flg\":[],\"activity_id\":null,\"YII_CSRF_TOKEN\":\"${token}\",\"version\":null}`,
            method: "POST",
            mode: "cors"
        });
    };
}

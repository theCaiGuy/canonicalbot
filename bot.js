var HTTPS = require('https');
var dateFormat = require('dateformat');
var fs = require('fs');
var google = require('googleapis');

// data and keys for auth and sending (you need to update these on your
// own.
var botIDs = {
    // group id (from request) : bot id (to send back to right group)
    // like this:
    // "<group id>": "<bot id>",
    "21013430":"218ad65c315e318d5c3407ac83",
    "18032921":"ff628b90a3b0a1372e326f3847",
    "1689488":"2cfb0f7188d1d9c5392c9f3b36",
    "17134214":"ebc25e337c1c99d2026b8f85d9",
    "1695911":"edbebb46c0f5fdf568cfaa955c",
    "17051947":"fbc74e3b377914610a6e27b062"
}
var SCOPES = process.env.SCOPES.split(' ');
var calendarId = process.env.CALENDAR_ID;
var serviceAccountEmail = process.env.SERVICE_ACCOUNT_EMAIL;
var impersonatedAccount = process.env.IMPERSONATED_ACCOUNT;
var key = fs.readFileSync('key.pem');
var quotes = [
    "it's just a prank bro",
    "this week in band (lame)",
    "~~send zoolz ur quotez so that this can be funny~~",
    "look at all these things we have to go to",
    "schedule ur lives accordingly",
    "groupmeklue",
    "botklue",
    "what memo",
    "its lit",
]
var helpString = "Canonical bot is pretty and you can do some neat stuff:\nGet events on a specific date:\nCanonical 4/20\nCanonical Saturday\nCanonical today\nCanonical Sat\nOr get all the events in the next seven days:\nCanonical\nLike canonical bot or interested in contributing? email webmaster@lsjumb.edu. Everything else, text brad @ (650) 847-0828"; 

function respond() {
    var request = JSON.parse(this.req.chunks[0]);
    console.log(request);
    var botRegex = /^canonical/i;

    if (request.text && typeof request.text === "string" && botRegex.test(request.text)) {
        this.res.writeHead(200);
        postMessage(request);
        this.res.end();
    } else {
        console.log("not posting");
        this.res.writeHead(200);
        this.res.end();
    }
}


function quote() {
    return quotes[Math.floor(Math.random()*quotes.length)];
}

function gmcTypeOf(request) {
    var text = request.text;
    var textarr = text.split(/ +/);
    return textarr[1] == "help"?"help":null; // wow this is bad but hopefully gmcTypeOf is used in switch statements
}

function generateMessage(auth, request, callback) {
    var botResponse = 'No upcoming events found.';
    var calendar = google.calendar('v3');
    var today = new Date();
    var nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    var specifiedDate = getDateFromRequest(request); 

    if (gmcTypeOf(request) == "help") {
        callback(null, helpString);
        return;
    }

    calendar.events.list({
        auth: auth,
        calendarId: calendarId,
        timeMin: specifiedDate ? specifiedDate.min.toISOString() : today.toISOString(),
        timeMax: specifiedDate ? specifiedDate.max.toISOString() : nextWeek.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        // yay so we have a response, let's build the text to send to groupme
        if (err) {
            callback(err, null);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            console.log("events sent:");
            botResponse = "~~" + quote() + "~~\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var start = event.start.dateTime || event.start.date;
                    start = new Date(start);
                    var event = dateFormat(start, "ddd @ h:MMTT") +  ": " + event.summary + "\n";
                    botResponse += event
                        console.log(start, event);
                }
            botResponse += "~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
        }
        //send it back up 
        callback(null, botResponse);
    });
}

function postMessage(request) {
    if (botIDs[request.group_id] == null) {
        console.log("request from not a good group");
        return;
    }
    var botResponse, options, body, botReq;

    botResponse = "did not work lol try again later";
    // Load client secrets from a local file.
    var jwtClient = new google.auth.JWT( 
            serviceAccountEmail,
            null,
            key,
            SCOPES,
            impersonatedAccount);

    jwtClient.authorize(function(err, tokens) {
        if (err) {
            console.log("error in authorize:", err);
            return;
        }
            generateMessage(jwtClient, request, function(err, botResponse) {
                if (err) {
                    console.log("error in generate message:", err);
                    return;
                }
                // we have a response! and it's good! so we should send it off :)
                options = {
                    hostname: 'api.groupme.com',
                    path: '/v3/bots/post',
                    method: 'POST'
                };

                body = {
                    "bot_id" : botIDs[request.group_id],
                    "text" : botResponse
                };
                botReq = HTTPS.request(options, function(res) {
                    if(res.statusCode == 202) {
                        //neat
                    } else {
                        console.log("rejecting bad status code " + res.statusCode + ": " + res.statusMessage);
                    }
                });

                botReq.on('error', function(err) {
                    console.log('error posting message '  + JSON.stringify(err));
                });
                botReq.on('timeout', function(err) {
                    console.log('timeout posting message '  + JSON.stringify(err));
                });
                botReq.end(JSON.stringify(body));
            });
    });
}

// returns a date object or null
function getDateFromRequest(request) {
    var text = request.text;
    var textarr = text.split(/ +/);
    var specifiedDate = {
        min: null,
        max: null
    }
    if (textarr[1]) {
        console.log(textarr[1]);
        var daydate = dateFromDay(textarr[1]);
        if (daydate == null) {
            return getDateRangeFromDate(dateFromDate(textarr[1]));
        } else {
            return getDateRangeFromDate(daydate);
        }
    } else {
        console.log(textarr);
        return null;
    }
}
function getDateRangeFromDate(date) {
    if (date) {
    var specifiedDate = {
        min: null,
        max: null
    };
    specifiedDate.min = date;
    specifiedDate.max = new Date(specifiedDate.min.getFullYear(), specifiedDate.min.getMonth(), specifiedDate.min.getDate() + 1, 0,0,0,0);
    return specifiedDate;
    }
    return null;

}
function dateFromDate(date) {
    var req = date.split('/');
    var now = new Date();
    console.log(req, "with length", req.length);
    if (req.length == 1) {
        return new Date(now.getFullYear(), now.getMonth(), req[0], 0,0,0,0);
    } else if (req.length == 2) {
        return new Date(now.getFullYear(), parseInt(req[0], 10) - 1, parseInt(req[1], 10),0,0,0,0);
    } else if (req.length == 3) {
        var year = parseInt(req[2], 10);
        if (year < 100) {
            year = year + 2000; // really roundabout but it doesn't really matter. i don't think this code will be used in year 3000 so there
        } 
        return new Date(year, parseInt(req[0], 10) - 1, parseInt(req[1], 10),0,0,0,0);
    } else {
        return null;
    }
}
function dateFromDay(day) {
    var now = new Date();
    var today = now.getDay();
    var request = -1;
    switch(day) {
        case "sunday":
        case "Sunday":
        case "Sun":
        case "sun":
            request = 0;
            break;
        case "monday":
        case "mon":
        case "Monday":
        case "Mon":
            request = 1;
            break;
        case "tuesday":
        case "tues":
        case "Tuesday":
        case "Tues":
            request = 2;
            break;
        case "wednesday":
        case "wed":
        case "Wednesday":
        case "Wed":
            request = 3;
            break;
        case "thursday":
        case "thurs":
        case "Thursday":
        case "Thurs":
            request = 4;
            break;
        case "friday":
        case "fri":
        case "Friday":
        case "Fri":
            request = 5;
            break;
        case "saturday":
        case "sat":
        case "Saturday":
        case "Sat":
            request = 6;
            break;
        case "today":
        case "Today":
            request = -2;
            break;
    }
    if (request == -2) {
        return now;
    }
    if (request == -1) {
        return null;
    }
    var daysahead = 0;
    if (today < request) {
        daysahead = request - today;
    } else {
        daysahead = 7 - (today - request);
    }
    return new Date(now.getTime() + daysahead * 24 * 60 * 60 * 1000);
}

exports.respond = respond;

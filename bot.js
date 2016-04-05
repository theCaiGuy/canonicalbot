var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var dateFormat = require('dateformat');

var botID = process.env.BOT_ID;

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /canonical/i;

  if (request.text && typeof request.text === "string" && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  } else {
    console.log("not posting");
    this.res.writeHead(200);
    this.res.end();
  }
}
function quote() {
    return "we should have some quotes for here"
}

function generateMessage(auth, botResponse, options, body, botReq) {
    var calendar = google.calendar('v3');
    var today = new Date();
    var nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    calendar.events.list({
        auth: auth,
        calendarId: 'lshal8co1phedgq1dl77h2fkhs@group.calendar.google.com',
        timeMin: today.toISOString(),
        timeMax: nextWeek.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        //where the sending of thre response happens
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            botResponse = 'No upcoming events found.';
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
        //set up the http
        options = {
            hostname: 'api.groupme.com',
            path: '/v3/bots/post',
            method: 'POST'
        };

        body = {
            "bot_id" : botID,
            "text" : botResponse
        };

        //console.log('sending ' + botResponse + ' to ' + botID);

        botReq = HTTPS.request(options, function(res) {
            if(res.statusCode == 202) {
                //neat
            } else {
                console.log('rejecting bad status code ' + res.statusCode);
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
}

function postMessage() {
  var botResponse, options, body, botReq;

  botResponse = "did not work lol try again later";
  // Load client secrets from a local file.
  var key = fs.readFileSync('key.pem');
  var jwtClient = new google.auth.JWT( 
          'gmc-658@groupmecanonical.iam.gserviceaccount.com', 
          null,
          key,
          SCOPES,
          'webmaster@lsjumb.com');

  jwtClient.authorize(function(err, tokens) {
      if (err) {
          console.log("error in authorize:", err);
          return;
      }
    
      generateMessage(jwtClient, botResponse, options, body, botReq) 
          // Make an authorized request to list Drive files.
  });
}


exports.respond = respond;

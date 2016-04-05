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
    "1689488":"2cfb0f7188d1d9c5392c9f3b36"

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

function respond() {
    var request = JSON.parse(this.req.chunks[0]);
    console.log(request);
    var botRegex = /canonical/i;

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

function generateMessage(auth) {
    var botResponse = 'No upcoming events found.';
    var calendar = google.calendar('v3');
    var today = new Date();
    var nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    calendar.events.list({
        auth: auth,
        calendarId: calendarId,
        timeMin: today.toISOString(),
        timeMax: nextWeek.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        //where the sending of thre response happens
        if (err) {
            throw err
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
        return botResponse
    });
}

function postMessage(request) {
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
      try {
          botResponse = generateMessage(jwtClient);
      } catch(err) {
          console.log('API returned an error:', err);
          return;
      } 
      //set up the http
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
          } else if(res.statusCode == 400) {
              console.log('status code is 400 and groupme didnt get anything. punk heroku is down or we sleepin');
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


exports.respond = respond;

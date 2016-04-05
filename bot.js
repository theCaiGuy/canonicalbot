var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var dateFormat = require('dateformat');

var botID = process.env.BOT_ID;

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
/*
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
    var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
    */

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
            console.log('Upcoming in the next seven days:');
            botResponse = "~~" + quote() + "~~\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var start = event.start.dateTime || event.start.date;
                    start = new Date(start);
                    botResponse += dateFormat(start, "ddd @ h:MMTT") +  ": " + event.summary + "\n";
                    console.log('%s - %s', start, event.summary);
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

        console.log('sending ' + botResponse + ' to ' + botID);

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
  /* TRY TWO - FAILED
  request({
      //url: 'https://www.googleapis.com/calendar/v3',
      url: 'https://www.googleapis.com/auth/calendar.readonly',
      jwt: {
          //use the email address of the service account, as seen in the API console
          email: 'gmc-212@groupmecanonical.iam.gserviceaccount.com',
          // use the PEM file we generated from the downloaded key
          keyFile: 'groupMeCanonicalKey.pem',
          // specify the scopes you wish to access
          scopes: SCOPES
      }
  }, function (err, res, body) {
      if (err) {
          console.log("authentication returned an error", err);
          return
      }
      console.log(body);
      console.log(res.result);
      for (var property in res) {
          console.log("HERES ONE", property);
      }
      //console.log(JSON.parse(body));
      //generateMessage(auth, botResponse, options, body, botReq) 
  });
  */
  /* TRY ONE - WORKED SORTA
  fs.readFile('groupMeCanonical-8e8bda5bb3c9.json', function processClientSecrets(err, content) {
      if (err) {
          console.log('Error loading client secret file: ' + err);
          return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Calendar API.
      authorize(JSON.parse(content), function(auth) {
        generateMessage(auth, botResponse, options, body, botReq) 
      });
  });
  */

}

/*
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
//function authorize(credentials, callback) {
    /*
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    */
    /*
    iat = new Date();
    //var jwtstr = '{"alg":"RS256","typ":"JWT"}.  { "iss":"' + credentials.client_email + '", "scope":"' + SCOPES[0] + '", "aud":"https://www.googleapis.com/oauth2/v4/token", "exp":' + 
    //   ((iat.getTime() / 1000)+(60*60)) + '", iat":' + (iat.getTime() / 1000) + '}.'
    var payload =  {
        "iss": credentials.client_email,
        "scope": SCOPES[0],
        "aud":"https://www.googleapis.com/oauth2/v4/token",
        "sub":"webmaster@lsjumb.com",
        "exp":((iat.getTime() / 1000)+(60*60)),
        "iat":(iat.getTime() / 1000) 
    }
    var headers = {
        "alg":"RS256",
        "typ":"JWT"
    }

    var token = jwt.sign(payload, credentials.private_key, {algorithm: 'RS256', headers: headers});
    console.log(token);
    var decoded = jwt.verify(token, credentials.private_key, { algorithms: ['RS256'] });
    console.log(decoded);
    */
/*
    googleAuth.authenticate({
        //use the email address of the service account, as seen in the API console
            email: 'gmc-212@groupmecanonical.iam.gserviceaccount.com',
        // use the PEM file we generated from the downloaded key
            keyFile: 'groupMeCanonicalKey.pem',
            // specify the scopes you wish to access
            scopes: SCOPES
    }, function (err, token) {
        console.log(token);
    });
    */
    /*
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
     //       oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
    */
//}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
/*
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log(authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        console.log("in callback");
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}
*/

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
/*
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}
*/

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
/*
function listEvents(auth) {
    var calendar = google.calendar('v3');
    calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}
*/

exports.respond = respond;

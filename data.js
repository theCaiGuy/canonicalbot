var botIDs = {
    // group id (from request) : bot id (to send back to right group)
    // like this:
    // "<group id>": "<bot id>",
    "21013430":"218ad65c315e318d5c3407ac83",
    "18032921":"ff628b90a3b0a1372e326f3847",
    "1689488":"2cfb0f7188d1d9c5392c9f3b36",
    "17134214": "ebc25e337c1c99d2026b8f85d9"

}
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var calendarId = 'lshal8co1phedgq1dl77h2fkhs@group.calendar.google.com'
var serviceAccountEmail = 'gmc-658@groupmecanonical.iam.gserviceaccount.com' 
var impersonatedAccount = 'webmaster@lsjumb.com'

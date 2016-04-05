# GroupMe Canonical - A GroupMe NodeJS Callback Bot

## Introduction

LSJUMB uses groupme a lot. it'd be nice if we could get the canonical in groupme directly
so we don't have to look it up every time. 

If you want this in your own groupme, talk to the webmaster. Tell em Zoolz sent you. or at
least the github did.

but if you want to be cool and do your own thing (maybe clone this repo or add a cool 
feature and create a pull request) keep reading homie. 

## Contents

  * [Get this bot in your own groupme!](#deploy)
    * Get started with Heroku
    * Get that google authentication
    * Create a bot
    * Configure to your bot's credentials
  * [Make changes to the bot](#pull)
    * Pull the code down to your local machine
    * Configure the local environment variables to your bot's credentials

## Requirements:

  * GroupMe account
  * Heroku account
  * Google developer account
  * Local copy of Node and npm installed
  * [Heroku Toolbelt](https://toolbelt.heroku.com/)

# Get your bot up and running<a name="deploy"></a>

## Get started with Heroku:

first get set up with Heroku command line stuff and login locally. follow the steps on just this page:
also i'd suggest reading up on this entire page. it really helps for like debugging and testing too.

[Getting Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)

now let's clone this repo locally:

    $ git clone https://github.com/heroku/node-js-getting-started.git
    $ cd node-js-getting-started

now, before we push to heroku, you need to set up some variables so you can access the canonical 
and other fun google related stuff.

## Google Auth

this is a pain and i will write it up l8er
basically you need to define all the variables in process.env at the top of bot.js

## Next, create a GroupMe Bot:

Go to:
https://dev.groupme.com/session/new

Use your GroupMe credentials to log into the developer site.

![Log into dev.groupme.com](https://i.groupme.com/640x292.png.38c9e590383149c1a01424fc61cdce4e)

Once you have successfully logged in, go to https://dev.groupme.com/bots/new

![Create your new bot](http://i.groupme.com/567x373.png.242d18352d7742858cf9a263f597c5d9)

Fill out the form to create your new bot:

  * Select the group where you want the bot to live
  * Give your bot a name
  * Paste in the url to your newly deply heroku app
    * `http://your-app-name-here.herokuapp.com/`
  * (Optional) Give your bot an avatar by providing a url to an image
  * Click submit

## Find your Bot ID:<a name="get-bot-id"></a>

Go here to view all of your bots:
https://dev.groupme.com/bots

Click on the one you just created.

![Select your new bot](http://i.groupme.com/871x333.png.5a33ef2b6ab74ea59d5aaa5569aaaf23)

On your Bot's page, copy the group id and bot id and put them SOMEWHERE


## Start the server locally for testing

To test your bot locally, open terminal and run the following command to start a local server.

    $ nf start

Then navigate to `http://127.0.0.1:5000/` in a browser.
you'll see something like "Hey. you reached groupMe Canonical. nice."

if you want it to actually send stuff and see stuff printed like the server is supposed to act,
try curling:

    $ curl -X POST -d '{"text":"canonical", "group_id":"YOUR_GROUP_ID"}' -H 'Content-Type: application/json' http://127.0.0.1:5000

everything should be sent to the groupme at this point but only because you're using curl. we still need to 
deploy the bot to heroku for groupme users to request the canonical.

## Now, let's finish up the Heroku stuff

after all your setup with google is done, you want to commit your changes and push them up
to Heroku to run so:

    $ git add .
    $ git commit -m "first commit"

now let's actually create the heroku instance and push it up to there:

    $ heroku create
    $ git push heroku master

now check that everything is working by sending "canonical" to your groupme

## All done! Go play around and make the bot your own.

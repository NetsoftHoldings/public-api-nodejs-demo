# Public API Node.js Demo

This repository contains a simple sample application that shows off how to 
access the Hubstaff public api via nodejs.

The core access is all done via the openid-client package.

## Open ID Discovery

The Hubstaff account system uses the Open ID Connect discovery protocol to
allow an application to easily query what the token endpoint, authorization endpoints,
etc. are. Thus you only need to know the authentication domain (https://account.hubstaff.com/)
and the API endpoint url (https://api.hubstaff.com/)

The example code in api.js fetches and caches this discovery data for 1 week. This way it does
not need to be constantly fetched.

## Token persistence

This demo has a simple way of managing the API token. It simply stores it in json file that is read from
on startup and written when tokens are refreshed.

A proper storage should have locking around read and write. And also the code should lock and re-read the
 state file when refreshing in case another process already refreshed the token.
e.g. a proper refresh token flow should be

1) lock
2) re-read state and load the token
3) if the token is no longer expired or near expiring use the new token (another process refreshed)
4) otherwise refresh the token
5) save
6) release lock 

## Client app vs Personal access token

The Hubstaff account system's personal access token is designed to work very
similarly to our client apps in that they both produce short-lived access tokens
that must be refreshed periodically.

The code in api.js is an example on how to accomplish this task using disk access
as the permanent token storage.   If you have other mechanisms for storage you can
implement that in the saveState and loadState methods.

## Personal access token use

The default setup in api.js is to use a personal access token. To use create/edit
the configState.json so that it contains the following entry.

```json
{
    "token": {
        "refresh_token": "personal access refresh token goes here"
    }
}
```

Then when the api.js makes a request it will automatically refresh to acquire an access
token as needed and persist it to the configState.json between executions.

## Client app use

Setup the configState.json as defined above
Then run the cli_tool sample like this
```bash
node bin/cli_tool.js help

node bin/cli_tool.js myself

node bin/cli_tool.js organizations
```

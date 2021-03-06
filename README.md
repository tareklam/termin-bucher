# Introduction

This application emails you when it finds an available Anmeldung appointment in Berlin.


Diese Anwendung E-Mails Sie, wenn es eine verfügbare Anmeldung Termin in Berlin findet.


## Installation

```shell
$ git clone git@github.com:josephfinlayson/termin-bucher.git
$ cd termin-bucher
$ npm install
$ touch api-key.js```


Sign up for a [Mailgun](https://mailgun.com/signup) account.

Insert your public API key and email to be notified on into api-key.js.
```js
var api_key = "your api key"
var emails = "user@example.com"
exports.api_key = api_key
exports.emails = emails
```


### To run

```shell
$ node index.js
```



Feature set:
- you can enter your email
- you get notified when a termin is available

Tech implementation:
- Email gets put into a DB
- All emails in DB with type - ACTIVE get spammed with appt through mailgun
- Email contains a reset link to mark as disabled in DB



### To deploy

`eb set_env mailgun_api_key=value`


### logs

`eb logs -g /aws/elasticbeanstalk/master-termin-bucher/var/log/eb-docker/containers/eb-current-app/stdouterr.log --stream`

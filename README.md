# Collections

[![Join the chat at https://gitter.im/cos-labs/collections](https://badges.gitter.im/cos-labs/collections.svg)](https://gitter.im/cos-labs/collections?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Collections is a prototype project at the Center for Open Science. This project is experimental, scope, technologies, code and functionality may change. 

# Login Configuration
1. Create a developer app at [https://staging.osf.io/settings/applications/](https://staging.osf.io/settings/applications/) with the following settings:
    * Project homepage URL: http://localhost:8000/
    * Callback URL: http://localhost:8000/accounts/osf/login/callback/

2. In the django admin panel, create a new Site with domain name: http://localhost:8000/
    * Note: The site id must match the `SITE_ID` variable defined in `collections/service/service/settings/base.py`
    or `SITE_ID` should be set to the site id in `collections/service/service/settings/local.py`

3. In the django admin panel, create a SocialAccount:
    * Set provider to "Open Science Framework"
    * Set the client id and secret key to the ones defined in your developer app
    * Select http://localhost:8000/ as the site


# Django Instructions

Set up the backend to use either staging or prod.

`export BACKEND=prod` or `export BACKEND=stage`

Run the server with this command:

`python manage.py runserver`

# Ember Instructions
## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* `cd collections`
* `npm install`
* `bower install`

## Running / Development

Set up the app to use either staging or prod.

`export BACKEND=prod` or `export BACKEND=stage`

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)


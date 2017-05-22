/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'collections',
    environment: environment,
    rootURL: '/',
    apiBaseUrl: 'http://localhost:8000',
    osfHostUrl: 'http://localhost:8000',
    csrfCookie: 'csrftoken',
    locationType: 'auto',
    authorizationType: 'token',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      usingCors: true,
      corsWithCreds: true,
      apiURL: 'http://localhost:8000/api'
    },
    PREPRINTS: {
            defaultProvider: 'osf',
            // Logos are needed for open graph sharing meta tags (Facebook, LinkedIn, etc) and must be at least 200x200
            providers: [
                // OSF must be the first provider
                {
                    id: 'osf',
                    domain: 'osf.io',
                    logoSharing: {
                        path: '/assets/img/provider_logos/osf-dark.png',
                        type: 'image/png',
                        width: 363,
                        height: 242
                    },
                    permissionLanguage: 'no_trademark'
                },
                {
                    id: 'engrxiv',
                    domain: 'engrxiv.org',
                    logoSharing: {
                        path: '/assets/img/provider_logos/engrxiv-sharing.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488

                    },
                    permissionLanguage: 'arxiv_non_endorsement'
                },
                {
                    id: 'socarxiv',
                    domain: 'socarxiv.org',
                    logoSharing: {
                        path: '/assets/img/provider_logos/socarxiv-sharing.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'arxiv_trademark_license'
                },
                {
                    id: 'psyarxiv',
                    domain: 'psyarxiv.com',
                    logoSharing: {
                        path: '/assets/img/provider_logos/psyarxiv-sharing.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'arxiv_trademark_license'
                },
                {
                    id: 'bitss',
                    logoSharing: {
                        path: '/assets/img/provider_logos/bitss-small.png',
                        type: 'image/png',
                        width: 1500,
                        height: 1500
                    },
                    permissionLanguage: 'no_trademark'
                },
                {
                    id: 'scielo',
                    // domain: 'scielo.org', // Temporarily disabling until ready
                    logoSharing: {
                        path: '/assets/img/provider_logos/scielo-logo.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'no_trademark'
                },
                {
                    id: 'agrixiv',
                    domain: 'agrixiv.org',
                    logoSharing: {
                        path: 'assets/img/provider_logos/agrixiv-banner.svg',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'arxiv_non_endorsement'
                },
                {
                    id: 'lawarxiv',
                    logoSharing: {
                        path: 'assets/img/provider_logos/lawarxiv-logo.png',
                        type: 'image/png',
                        width: 1200,
                        height: 488
                    },
                    permissionLanguage: 'arxiv_non_endorsement'
                }
            ]
        }
  };


  ENV.headerAuth = process.env.HEADER_AUTH;
  debugger;

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV['osfHostUrl'] = 'https://staging-api.osf.io';
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'stage') {
    ENV['osfHostUrl'] = 'https://staging-api.osf.io';

  }


    ENV['sanity'] = environment;
  if (environment === 'production') {
    ENV['osfHostUrl'] = 'https://api.osf.io';

  }

  ENV['simple-auth'] = {
    crossOriginWhitelist: [ENV.APP.apiURL]
  };

  return ENV;
};

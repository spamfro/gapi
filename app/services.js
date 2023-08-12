//----------------------------------------------------------------------------------------
class Services {
  constructor(config) {
    this.googleApi = new GoogleAPI(config.google);
    this.googleIdentityService = new GoogleIdentityService(config.google);
    this.googleMail = new GoogleMail(this.googleApi);
    this.persistentSettings = new PersistentSettings(localStorage);
  }
}

//----------------------------------------------------------------------------------------
class PersistentSettings {
  constructor(localStorage) {
    this.localStorage = localStorage;
  }
  accessToken() {
    return this.localStorage.getItem('access_token');
  }
  setAccessToken(value) {
    this.localStorage.setItem('access_token', value);
  }
}

//----------------------------------------------------------------------------------------
class GoogleMail {
  constructor(googleApi) {
    this.googleApi = googleApi;
  }
  requestLabels() {
    return new Promise((resolve, reject) => {
      this.googleApi.client.gmail.users.labels.list({ userId: 'me' })
        .then(({ result: { labels } }) => { resolve(labels) }, reject);
    });
  }
}

//----------------------------------------------------------------------------------------
class GoogleAPI {
  constructor(config) {
    this.config = config;
  }
  isAuthenticated() {
    return this.client.getToken() !== null;
  }
  loadClient() {
    return new Promise((resolve, reject) => {
      gapi.load('client', () => {
        const { apiKey, discoveryDocs } = this.config;
        gapi.client.init({ apiKey, discoveryDocs })
          .then(() => {
            this.client = gapi.client;
            resolve();
          }, reject);
      });
    });
  }
}

//----------------------------------------------------------------------------------------
class GoogleIdentityService {
  constructor(config) {
    this.config = config;
  }
  authenticateWithImplicitGrant({ prompt }) {
    const { clientId, scope } = this.config;
    return new Promise((resolve) => {
      this.tokenClient = google.accounts.oauth2.initTokenClient({  // OAuth 2 implicit grant
        callback: resolve,
        client_id: clientId,
        scope,
      });
      this.tokenClient.requestAccessToken({ prompt });
    });
  }
}

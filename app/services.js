//----------------------------------------------------------------------------------------
class Services {
  constructor(config) {
    this.googleApi = new GoogleAPI(config.google);
    this.googleIdentityService = new GoogleIdentityService(config.google);
    this.googleOpenID = new GoogleOpenID(config.google.openid);
    this.googleMail = new GoogleMail(this.googleApi);
    this.persistentSettings = new PersistentSettings(window.localStorage);
  }
}

//----------------------------------------------------------------------------------------
class GoogleOpenID {
  constructor(config) {
    this.config = config;
  }
  // TODO:
  // userInfo() {
  //   this.configuration = this.configuration ?? fetch(this.config.configuration).then(response => response.jeson());
  //   return this.configuration.
  // }
}
//----------------------------------------------------------------------------------------
class PersistentSettings {
  constructor(localStorage) {
    this.localStorage = localStorage;
    this.sensitiveValues = ['token'];
  }
  token() {
    const value = this.localStorage.getItem('token');
    try { return value && JSON.parse(value) }
    catch { }
  }
  setToken(token) {
    if (token) {
      this.localStorage.setItem('token', JSON.stringify(token));
    } else {
      this.localStorage.removeItem('token');
    }
  }
  email() { return this.localStorage.getItem('email') }
  setEmail(value) {
    if (value) {
      this.localStorage.setItem('email', value);
    } else {
      this.localStorage.removeItem('email');
    }
  }
  sub() { return this.localStorage.getItem('sub') }
  setSub(value) {
    if (value) {
      this.localStorage.setItem('sub', value);
    } else {
      this.localStorage.removeItem('sub');
    }
  }
  dbgInfo() {
    return Array.from(Array(this.localStorage.length), (_, i) => this.localStorage.key(i))
      .map(key => [key, this.maskSensitiveValue(key, this.localStorage.getItem(key))]);
  }
  maskSensitiveValue(key, value) {
    return this.sensitiveValues.includes(key) ? '***' : value;
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
  authenticateWithImplicitGrant({ login_hint, prompt }) {
    const { clientId, scope } = this.config;
    return new Promise((resolve) => {
      this.tokenClient = google.accounts.oauth2.initTokenClient({  // OAuth 2 implicit grant
        callback: resolve,
        client_id: clientId,
        include_granted_scopes: false,
        login_hint,
        scope,
      });
      this.tokenClient.requestAccessToken({ prompt });
    });
  }
}

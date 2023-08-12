//----------------------------------------------------------------------------------------
window.addEventListener('load', () => { window.app = new App(new Config()) })

//----------------------------------------------------------------------------------------
class Config {
  constructor() {
    this.services = {
      google: {
        apiKey: 'AIzaSyDxgR1btNNMWdaOr0S1Q-F6hpw-jCnCbrU',
        clientId: '588879659786-96ialt5l1bn240naa55eh7gberlo66ds.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
      }
    };
  }
}

//----------------------------------------------------------------------------------------
class App {
  constructor(config) {
    this.services = new Services(config.services);

    this.ui = new Ui(document.body);
    this.ui.addEventListener('ui:sign-in', () => { this.signIn() });

    const appendListItem = (ul) => (text = '') => {
      const li = ul.appendChild(document.createElement('li'));
      li.classList.add('list-group-item');
      if (text) { li.textContent = text }
    }
    const localStoragePairs = (localStorage) => (
      Array.from(Array(localStorage.length), (_, i) => [localStorage.key(i), !!localStorage.getItem(localStorage.key(i))])
    );
    const toStringLocalStorage = (localStorage) => (
      localStorage &&
      localStoragePairs(localStorage).map(([key, val]) => `${key}:${val}`).join(',')
    );
    const data = [
      `window: ${!!window}`,
      `localStorage: [${toStringLocalStorage(localStorage)}]`,
      `window.localStorage: [${toStringLocalStorage(window.localStorage)}]`,
      `indexedDB: ${!!indexedDB}`,
      `window.indexedDB: ${!!window.indexedDB}`
    ];
    const ul = document.body.querySelector('.list-group.dbg');
    data.forEach(appendListItem(ul));
  }

  signIn() {
    // TODO:
    this.services.googleApi.loadClient()
      .then(() => {
        this.services.googleApi.client.setToken(this.services.persistentSettings.accessToken());
        const handleTokenResponse = ({ access_token }) => {
          this.services.persistentSettings.setAccessToken(access_token);
        };
        const prompt = this.services.googleApi.isAuthenticated() ? '' : 'consent';
        return this.services.googleIdentityService.authenticateWithImplicitGrant({ prompt })
          .then(handleTokenResponse);
      })
      .then(() => {
        return this.services.googleMail.requestLabels();
      })
      .then(labels => {
        this.ui.render({ labels });
      });
  }
}

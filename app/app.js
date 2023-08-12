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

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
        scope: 'https://www.googleapis.com/auth/gmail.readonly openid',
        openid: {
          configuration: 'https://accounts.google.com/.well-known/openid-configuration'
        }
      }
    };
  }
}

//----------------------------------------------------------------------------------------
class App {
  constructor(config) {
    this.config = config;
    this.services = new Services(config.services);

    this.ui = new Ui(document.body);
    this.ui.addEventListener('ui:sign-in', () => { this.signIn() });

    //TODO:
    const infoItems = this.services.persistentSettings.dbgInfo()
      .map(([key, value]) => `${key}=${value}`);
    this.ui.render({ debug: { items: infoItems } });
  }

  signIn({ prompt } = {}) {
    // TODO:
    this.services.googleApi.loadClient()
      .then(() => {
        const { access_token, token_type } = this.services.persistentSettings.token() || {};
        if (access_token) {
          this.services.googleApi.client.setToken({ access_token, token_type });
        }
        if (prompt !== undefined) {
          const handleTokenResponse = (tokenResponse) => {
            const { access_token, token_type } = tokenResponse;
            if (!access_token) {
              this.services.persistentSettings.setToken(null);

            } else {
              this.services.persistentSettings.setToken({ access_token, token_type });

              fetch(this.config.services.google.openid.configuration)
                .then(response => response.json())
                .then(({ userinfo_endpoint }) => fetch(userinfo_endpoint, {
                  headers: { 'Authorization': `${token_type || 'Bearer'} ${access_token}` }
                }))
                .then(response => response.json())
                .then(({ email, sub }) => {
                  this.services.persistentSettings.setEmail(email);
                  this.services.persistentSettings.setSub(sub);
                });
            }
          }

          const email = this.services.persistentSettings.email();
          const sub = !email ? this.services.persistentSettings.sub() : undefined;
          return this.services.googleIdentityService.authenticateWithImplicitGrant({
            login_hint: email || sub,
            prompt,
          })
            .then(handleTokenResponse);
        }
      })
      .then(() => {
        return this.services.googleMail.requestLabels()
          .catch(error => {
            console.log('requestLabels', { error });
            // this.services.persistentSettings.setToken(null);
            this.signIn({ prompt: '' });
          });
      })
      .then(labels => {
        this.ui.render({ labels });
      });
  }
}

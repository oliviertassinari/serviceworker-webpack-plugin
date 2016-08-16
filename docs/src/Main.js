/* eslint-disable no-console */
import React, {Component} from 'react';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import registerEvents from 'serviceworker-webpack-plugin/lib/browser/registerEvents';
import applyUpdate from 'serviceworker-webpack-plugin/lib/browser/applyUpdate';
import Head from './Head';
import Body from './Body';
import Footer from './Footer';

class Main extends Component {
  state = {
    logs: [],
  };

  componentDidMount() {
    this.pushLog('the main JS thread was loaded');

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost')
    ) {
      const registration = runtime.register();

      registerEvents(registration, {
        onInstalled: () => {
          this.pushLog('a new serviceworker was installed');
        },
        onUpdateReady: () => {
          this.pushLog('a new serviceworker update is ready');
        },
        onUpdating: () => {
          this.pushLog('a new serviceworker is updating');
        },
        onUpdateFailed: () => {
          this.pushLog('a new serviceworker update failed');
        },
        onUpdated: () => {
          this.pushLog('a new serviceworker was updated');
        },
      });
    } else {
      this.pushLog('serviceWorker not available');
    }
  }

  pushLog(log) {
    this.setState({
      logs: [
        ...this.state.logs,
        log,
      ],
    });
  }

  handleClickReload = (event) => {
    event.preventDefault();

    applyUpdate().then(() => {
      window.location.reload();
    });
  };

  render() {
    return (
      <div>
        <Head
          name="Serviceworker webpack plugin"
          description="Simplifies creation of a service worker to serve your webpack bundles"
        >
          <a className="btn" href="https://github.com/oliviertassinari/serviceworker-webpack-plugin">
            {'View on GitHub'}
          </a>
        </Head>
        <Body>
          <h3>{'Logs'}</h3>
          <ul>
            {this.state.logs.map((log, index) => {
              if (log === 'onUpdateReady') {
                return (
                  <li key={index}>
                    {`${log} `}
                    <a href="#" onClick={this.handleClickReload}>
                      {'Reload'}
                    </a>
                  </li>
                );
              }

              return <li key={index}>{log}</li>;
            })}
          </ul>
          <Footer
            maintainerName="oliviertassinari"
            maintainerUrl="https://github.com/oliviertassinari"
            repositoryName="serviceworker-webpack-plugin"
            repositoryUrl="https://github.com/oliviertassinari/serviceworker-webpack-plugin"
          />
        </Body>
      </div>
    );
  }
}

export default Main;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Footer from './components/Footer';
import 'semantic-ui-offline/semantic.min.css';
import './index.css';
import { UserProvider } from './context/User';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StatusProvider } from './context/Status';
import { Layout } from '@douyinfe/semi-ui';
import SiderBar from './components/SiderBar';
import { ThemeProvider } from './context/Theme';
import DisableDevtool from 'disable-devtool';

// initialization
DisableDevtool();

const root = ReactDOM.createRoot(document.getElementById('root'));
const { Content, Header } = Layout;
root.render(
  <React.StrictMode>
    <StatusProvider>
      <UserProvider>
        <BrowserRouter>
          <ThemeProvider>
            <Layout>
              <Layout>
                <Header>
                  <SiderBar />
                </Header>
                <Content
                  style={{
                    padding: '10px 24px',
                  }}
                >
                  <App />
                </Content>
                <Layout.Footer>
                  <Footer></Footer>
                </Layout.Footer>
              </Layout>
              <ToastContainer />
            </Layout>
          </ThemeProvider>
        </BrowserRouter>
      </UserProvider>
    </StatusProvider>
  </React.StrictMode>,
);

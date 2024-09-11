import React, { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Form,
  Grid,
  Header,
  Modal,
} from 'semantic-ui-react';
import { API, removeTrailingSlash, showError, verifyJSON } from '../helpers';

import { useTheme } from '../context/Theme';

const SystemSetting = () => {
  let [inputs, setInputs] = useState({
    PasswordLoginEnabled: '',
    PasswordRegisterEnabled: '',
    EmailVerificationEnabled: '',
    GitHubOAuthEnabled: '',
    GitHubClientId: '',
    GitHubClientSecret: '',
    Notice: '',
    SMTPServer: '',
    SMTPPort: '',
    SMTPAccount: '',
    SMTPFrom: '',
    SMTPToken: '',
    ServerAddress: '',
    WorkerUrl: '',
    WorkerValidKey: '',
    Price: 7.3,
    MinTopUp: 1,
    TopupGroupRatio: '',
    Footer: '',
    WeChatAuthEnabled: '',
    WeChatServerAddress: '',
    WeChatServerToken: '',
    WeChatAccountQRCodeImageURL: '',
    TurnstileCheckEnabled: '',
    TurnstileSiteKey: '',
    TurnstileSecretKey: '',
    RegisterEnabled: '',
    EmailDomainRestrictionEnabled: '',
    EmailAliasRestrictionEnabled: '',
    SMTPSSLEnabled: '',
    EmailDomainWhitelist: [],
    // telegram login
    TelegramOAuthEnabled: '',
    TelegramBotToken: '',
    TelegramBotName: '',
  });
  const [originInputs, setOriginInputs] = useState({});
  let [loading, setLoading] = useState(false);
  const [EmailDomainWhitelist, setEmailDomainWhitelist] = useState([]);
  const [restrictedDomainInput, setRestrictedDomainInput] = useState('');
  const [showPasswordWarningModal, setShowPasswordWarningModal] =
    useState(false);

  const theme = useTheme();
  const isDark = theme === 'dark';

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      let newInputs = {};
      data.forEach((item) => {
        if (item.key === 'TopupGroupRatio') {
          item.value = JSON.stringify(JSON.parse(item.value), null, 2);
        }
        newInputs[item.key] = item.value;
      });
      setInputs({
        ...newInputs,
        EmailDomainWhitelist: newInputs.EmailDomainWhitelist.split(','),
      });
      setOriginInputs(newInputs);

      setEmailDomainWhitelist(
        newInputs.EmailDomainWhitelist.split(',').map((item) => {
          return { key: item, text: item, value: item };
        }),
      );
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    getOptions().then();
  }, []);
  useEffect(() => {}, [inputs.EmailDomainWhitelist]);

  const updateOption = async (key, value) => {
    setLoading(true);
    switch (key) {
      case 'PasswordLoginEnabled':
      case 'PasswordRegisterEnabled':
      case 'EmailVerificationEnabled':
      case 'GitHubOAuthEnabled':
      case 'WeChatAuthEnabled':
      case 'TelegramOAuthEnabled':
      case 'TurnstileCheckEnabled':
      case 'EmailDomainRestrictionEnabled':
      case 'EmailAliasRestrictionEnabled':
      case 'SMTPSSLEnabled':
      case 'RegisterEnabled':
        value = inputs[key] === 'true' ? 'false' : 'true';
        break;
      default:
        break;
    }
    const res = await API.put('/api/option/', {
      key,
      value,
    });
    const { success, message } = res.data;
    if (success) {
      if (key === 'EmailDomainWhitelist') {
        value = value.split(',');
      }
      if (key === 'Price') {
        value = parseFloat(value);
      }
      setInputs((inputs) => ({
        ...inputs,
        [key]: value,
      }));
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const handleInputChange = async (e, { name, value }) => {
    if (name === 'PasswordLoginEnabled' && inputs[name] === 'true') {
      // block disabling password login
      setShowPasswordWarningModal(true);
      return;
    }

    if (
      name === 'Notice' ||
      (name.startsWith('SMTP') && name !== 'SMTPSSLEnabled') ||
      name === 'ServerAddress' ||
      name === 'WorkerUrl' ||
      name === 'WorkerValidKey' ||
      name === 'WeChatMerchantId' ||
      name === 'WeChatAppId' ||
      name === 'WeChatApiV2Password' ||
      name === 'WeChatMerchantCert' ||
      name === 'WeChatMerchantKey' ||
      name === 'Price' ||
      name === 'GitHubClientId' ||
      name === 'GitHubClientSecret' ||
      name === 'WeChatServerAddress' ||
      name === 'WeChatServerToken' ||
      name === 'WeChatAccountQRCodeImageURL' ||
      name === 'TurnstileSiteKey' ||
      name === 'TurnstileSecretKey' ||
      name === 'EmailDomainWhitelist' ||
      name === 'TopupGroupRatio' ||
      name === 'TelegramBotToken' ||
      name === 'TelegramBotName'
    ) {
      setInputs((inputs) => ({ ...inputs, [name]: value }));
    } else {
      await updateOption(name, value);
    }
  };

  const submitServerAddress = async () => {
    let ServerAddress = removeTrailingSlash(inputs.ServerAddress);
    await updateOption('ServerAddress', ServerAddress);
  };

  const submitPayConfig = async () => {
    if (inputs.ServerAddress === '') {
      showError('请先填写服务器地址');
      return;
    }
    
    if (inputs.WeChatMerchantId === '') {
      showError('请先填写微信商户 ID');
      return;
    }
    if (inputs.WeChatAppId === '') {
      showError('请先填写微信应用 ID');
      return;
    }
    if (inputs.WeChatApiV2Password === '') {
      showError('请先填写微信V2版本密钥');
      return;
    }
    if (inputs.WeChatMerchantCert === '') {
      showError('请先填写商户证书内容');
      return;
    }
    if (inputs.WeChatMerchantKey === '') {
      showError('请先填写商户证书密钥内容');
      return;
    }

    if (originInputs['TopupGroupRatio'] !== inputs.TopupGroupRatio) {
      if (!verifyJSON(inputs.TopupGroupRatio)) {
        showError('充值分组倍率不是合法的 JSON 字符串');
        return;
      }
      await updateOption('TopupGroupRatio', inputs.TopupGroupRatio);
    }
    // wechat pay
    inputs.WeChatMerchantId !== '' && await updateOption('WeChatMerchantId', inputs.WeChatMerchantId);
    inputs.WeChatAppId !== '' && await updateOption('WeChatAppId', inputs.WeChatAppId);
    inputs.WeChatApiV2Password !== '' && await updateOption('WeChatApiV2Password', inputs.WeChatApiV2Password);
    inputs.WeChatMerchantCert !== '' && await updateOption('WeChatMerchantCert', inputs.WeChatMerchantCert);
    inputs.WeChatMerchantKey !== '' && await updateOption('WeChatMerchantKey', inputs.WeChatMerchantKey);

    // prize update
    await updateOption('Price', '' + inputs.Price);
  };

  const submitSMTP = async () => {
    if (originInputs['SMTPServer'] !== inputs.SMTPServer) {
      await updateOption('SMTPServer', inputs.SMTPServer);
    }
    if (originInputs['SMTPAccount'] !== inputs.SMTPAccount) {
      await updateOption('SMTPAccount', inputs.SMTPAccount);
    }
    if (originInputs['SMTPFrom'] !== inputs.SMTPFrom) {
      await updateOption('SMTPFrom', inputs.SMTPFrom);
    }
    if (
      originInputs['SMTPPort'] !== inputs.SMTPPort &&
      inputs.SMTPPort !== ''
    ) {
      await updateOption('SMTPPort', inputs.SMTPPort);
    }
    if (
      originInputs['SMTPToken'] !== inputs.SMTPToken &&
      inputs.SMTPToken !== ''
    ) {
      await updateOption('SMTPToken', inputs.SMTPToken);
    }
  };

  const submitWeChat = async () => {
    if (originInputs['WeChatServerAddress'] !== inputs.WeChatServerAddress) {
      await updateOption(
        'WeChatServerAddress',
        removeTrailingSlash(inputs.WeChatServerAddress),
      );
    }
    if (
      originInputs['WeChatAccountQRCodeImageURL'] !==
      inputs.WeChatAccountQRCodeImageURL
    ) {
      await updateOption(
        'WeChatAccountQRCodeImageURL',
        inputs.WeChatAccountQRCodeImageURL,
      );
    }
    if (
      originInputs['WeChatServerToken'] !== inputs.WeChatServerToken &&
      inputs.WeChatServerToken !== ''
    ) {
      await updateOption('WeChatServerToken', inputs.WeChatServerToken);
    }
  };

  return (
    <Grid columns={1}>
      <Grid.Column>
        <Form loading={loading} inverted={isDark} layout="horizontal" style={{marginTop: 10}}>
          <Form.Group widths='equal'>
            <Form.Input
                placeholder='必须与服务器可访问域名一致，支付回调也是这里'
                value={inputs.ServerAddress}
                name='ServerAddress'
                onChange={handleInputChange}
            />
            <Form.Button onClick={submitServerAddress}>
              更新服务器地址
            </Form.Button>
          </Form.Group>
          <Divider />
          <Form.Group widths='equal'>
            <Form.Input
              label='微信商户ID'
              placeholder='例如：16******65'
              value={inputs.WeChatMerchantId}
              name='WeChatMerchantId'
              onChange={handleInputChange}
            />
            <Form.Input
              label='微信AppID'
              placeholder='例如：wx*******'
              value={inputs.WeChatAppId}
              name='WeChatAppId'
              onChange={handleInputChange}
            />
            <Form.Input
              label='微信 API V2 商户密钥'
              placeholder='敏感信息不会发送到前端显示'
              value={inputs.WeChatApiV2Password}
              name='WeChatApiV2Password'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input
              label='微信商户证书 Cert.pem'
              placeholder='敏感信息不会发送到前端显示'
              value={inputs.WeChatMerchantCert}
              name='WeChatMerchantCert'
              onChange={handleInputChange}
            />
            <Form.Input
              label='微信商户证书密钥 Key.pem'
              placeholder='敏感信息不会发送到前端显示'
              value={inputs.WeChatMerchantKey}
              name='WeChatMerchantKey'
              onChange={handleInputChange}
            />
            <Form.Input
              label='充值价格（x元/美金）'
              placeholder='例如：7，就是7元/美金'
              value={inputs.Price}
              name='Price'
              min={0}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Input
              label='最低充值金额'
              placeholder='例如：2，就是最低充值 $2'
              value={inputs.MinTopUp}
              name='MinTopUp'
              min={5}
              onChange={handleInputChange}
            />
          <Form.Group widths='equal'>
            <Form.TextArea
              label='充值分组倍率'
              name='TopupGroupRatio'
              onChange={handleInputChange}
              style={{ minHeight: 120, fontFamily: 'JetBrains Mono, Consolas' }}
              autoComplete='new-password'
              value={inputs.TopupGroupRatio}
              placeholder='为一个 JSON 文本，键为组名称，值为倍率'
            />
          </Form.Group>
          <Form.Button onClick={submitPayConfig}>更新支付设置</Form.Button>
          <Divider />
          <Header as='h3' inverted={isDark}>
            配置登录注册
          </Header>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.PasswordLoginEnabled === 'true'}
              label='允许通过密码进行登录'
              name='PasswordLoginEnabled'
              onChange={handleInputChange}
            />
            {showPasswordWarningModal && (
              <Modal
                open={showPasswordWarningModal}
                onClose={() => setShowPasswordWarningModal(false)}
                size={'tiny'}
                style={{ maxWidth: '450px' }}
              >
                <Modal.Header>警告</Modal.Header>
                <Modal.Content>
                  <p>
                    取消密码登录将导致所有未绑定其他登录方式的用户（包括管理员）无法通过密码登录，确认取消？
                  </p>
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={() => setShowPasswordWarningModal(false)}>
                    取消
                  </Button>
                  <Button
                    color='yellow'
                    onClick={async () => {
                      setShowPasswordWarningModal(false);
                      await updateOption('PasswordLoginEnabled', 'false');
                    }}
                  >
                    确定
                  </Button>
                </Modal.Actions>
              </Modal>
            )}
            <Form.Checkbox
              checked={inputs.PasswordRegisterEnabled === 'true'}
              label='允许通过密码进行注册'
              name='PasswordRegisterEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.EmailVerificationEnabled === 'true'}
              label='通过密码注册时需要进行邮箱验证'
              name='EmailVerificationEnabled'
              onChange={handleInputChange}
            />
            <Form.Checkbox
              checked={inputs.WeChatAuthEnabled === 'true'}
              label='允许通过微信登录 & 注册'
              name='WeChatAuthEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group inline>
            <Form.Checkbox
              checked={inputs.RegisterEnabled === 'true'}
              label='允许新用户注册（此项为否时，新用户将无法以任何方式进行注册）'
              name='RegisterEnabled'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Divider />
          <Header as='h3' inverted={isDark}>
            配置 SMTP
            <Header.Subheader>用以支持系统的邮件发送</Header.Subheader>
          </Header>
          <Form.Group widths={3}>
            <Form.Input
              label='SMTP 服务器地址'
              name='SMTPServer'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPServer}
              placeholder='例如：smtp.qq.com'
            />
            <Form.Input
              label='SMTP 端口'
              name='SMTPPort'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPPort}
              placeholder='默认: 587'
            />
            <Form.Input
              label='SMTP 账户'
              name='SMTPAccount'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPAccount}
              placeholder='通常是邮箱地址'
            />
          </Form.Group>
          <Form.Group widths={3}>
            <Form.Input
              label='SMTP 发送者邮箱'
              name='SMTPFrom'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.SMTPFrom}
              placeholder='通常和邮箱地址保持一致'
            />
            <Form.Input
              label='SMTP 访问凭证'
              name='SMTPToken'
              onChange={handleInputChange}
              type='password'
              autoComplete='new-password'
              checked={inputs.RegisterEnabled === 'true'}
              placeholder='敏感信息不会发送到前端显示'
            />
          </Form.Group>
          <Form.Group widths={3}>
            <Form.Checkbox
              label='启用SMTP SSL（465端口强制开启）'
              name='SMTPSSLEnabled'
              onChange={handleInputChange}
              checked={inputs.SMTPSSLEnabled === 'true'}
            />
          </Form.Group>
          <Form.Button onClick={submitSMTP}>保存 SMTP 设置</Form.Button>
          <Divider />
          <Header as='h3' inverted={isDark}>
            配置 WeChat Server
            <Header.Subheader>
              用以支持通过微信进行登录注册，
              <a
                href='https://github.com/songquanpeng/wechat-server'
                target='_blank'
                rel='noreferrer'
              >
                点击此处
              </a>
              了解 WeChat Server
            </Header.Subheader>
          </Header>
          <Form.Group widths={3}>
            <Form.Input
              label='WeChat Server 服务器地址'
              name='WeChatServerAddress'
              placeholder='例如：https://yourdomain.com'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.WeChatServerAddress}
            />
            <Form.Input
              label='WeChat Server 访问凭证'
              name='WeChatServerToken'
              type='password'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.WeChatServerToken}
              placeholder='敏感信息不会发送到前端显示'
            />
            <Form.Input
              label='微信公众号二维码图片链接'
              name='WeChatAccountQRCodeImageURL'
              onChange={handleInputChange}
              autoComplete='new-password'
              value={inputs.WeChatAccountQRCodeImageURL}
              placeholder='输入一个图片链接'
            />
          </Form.Group>
          <Form.Button onClick={submitWeChat}>
            保存 WeChat Server 设置
          </Form.Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default SystemSetting;

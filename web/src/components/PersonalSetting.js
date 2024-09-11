import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  API,
  copy,
  isRoot,
  showError,
  showInfo,
  showSuccess,
} from '../helpers';
import Turnstile from 'react-turnstile';
import { UserContext } from '../context/User';
import { onGitHubOAuthClicked } from './utils';
import {
  Avatar,
  Banner,
  Button,
  Card,
  Descriptions,
  Image,
  Input,
  InputNumber,
  Layout,
  Modal,
  Space,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import {
  getQuotaPerUnit,
  renderQuota,
  renderQuotaWithPrompt,
  stringToColor,
} from '../helpers/render';
import TelegramLoginButton from 'react-telegram-login';

const PersonalSetting = () => {
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();

  const [inputs, setInputs] = useState({
    wechat_verification_code: '',
    email_verification_code: '',
    email: '',
    self_account_deletion_confirmation: '',
    set_new_password: '',
    set_new_password_confirmation: '',
  });
  const [status, setStatus] = useState({});
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showWeChatBindModal, setShowWeChatBindModal] = useState(false);
  const [showEmailBindModal, setShowEmailBindModal] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [affLink, setAffLink] = useState('');
  const [systemToken, setSystemToken] = useState('');
  const [models, setModels] = useState([]);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);

  useEffect(() => {
    // let user = localStorage.getItem('user');
    // if (user) {
    //   userDispatch({ type: 'login', payload: user });
    // }
    // console.log(localStorage.getItem('user'))

    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
    getUserData().then((res) => {
      console.log(userState);
    });
    loadModels().then();
    getAffLink().then();
    setTransferAmount(getQuotaPerUnit());
  }, []);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval); // Clean up on unmount
  }, [disableButton, countdown]);

  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const getAffLink = async () => {
    const res = await API.get('/api/user/aff');
    const { success, message, data } = res.data;
    if (success) {
      let link = `${window.location.origin}/register?aff=${data}`;
      setAffLink(link);
    } else {
      showError(message);
    }
  };

  const getUserData = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      userDispatch({ type: 'login', payload: data });
    } else {
      showError(message);
    }
  };

  const loadModels = async () => {
    let res = await API.get(`/api/user/models`);
    const { success, message, data } = res.data;
    if (success) {
      setModels(data);
      console.log(data);
    } else {
      showError(message);
    }
  };

  const bindWeChat = async () => {
    if (inputs.wechat_verification_code === '') return;
    const res = await API.get(
      `/api/oauth/wechat/bind?code=${inputs.wechat_verification_code}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('微信账户绑定成功！');
      setShowWeChatBindModal(false);
    } else {
      showError(message);
    }
  };

  const changePassword = async () => {
    if (inputs.set_new_password !== inputs.set_new_password_confirmation) {
      showError('两次输入的密码不一致！');
      return;
    }
    const res = await API.put(`/api/user/self`, {
      password: inputs.set_new_password,
    });
    const { success, message } = res.data;
    if (success) {
      showSuccess('密码修改成功！');
      setShowWeChatBindModal(false);
    } else {
      showError(message);
    }
    setShowChangePasswordModal(false);
  };

  const sendVerificationCode = async () => {
    if (inputs.email === '') {
      showError('请输入邮箱！');
      return;
    }
    setDisableButton(true);
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setLoading(true);
    const res = await API.get(
      `/api/verification?email=${inputs.email}&turnstile=${turnstileToken}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('验证码发送成功，请检查邮箱！');
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const bindEmail = async () => {
    if (inputs.email_verification_code === '') {
      showError('请输入邮箱验证码！');
      return;
    }
    setLoading(true);
    const res = await API.get(
      `/api/oauth/email/bind?email=${inputs.email}&code=${inputs.email_verification_code}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('邮箱账户绑定成功！');
      setShowEmailBindModal(false);
      userState.user.email = inputs.email;
    } else {
      showError(message);
    }
    setLoading(false);
  };

  const getUsername = () => {
    if (userState.user) {
      return userState.user.username;
    } else {
      return 'null';
    }
  };

  const copyText = async (text) => {
    if (await copy(text)) {
      showSuccess('已复制：' + text);
    } else {
      // setSearchKeyword(text);
      Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
    }
  };

  return (
    <div>
      <Layout>
        <Layout.Content>
          <div style={{ marginTop: 20 }}>
            <Card
              title={
                <Card.Meta
                  avatar={
                    <Avatar
                      size='default'
                      color={stringToColor(getUsername())}
                      style={{ marginRight: 4 }}
                    >
                      {typeof getUsername() === 'string' &&
                        getUsername().slice(0, 1)}
                    </Avatar>
                  }
                  title={<Typography.Text>{getUsername()}</Typography.Text>}
                  description={
                    isRoot() ? (
                      <Tag color='red'>管理员</Tag>
                    ) : (
                      <Tag color='blue'>普通用户</Tag>
                    )
                  }
                ></Card.Meta>
              }
              headerExtraContent={
                <>
                  <Space vertical align='start'>
                    <Tag color='green'>{'ID: ' + userState?.user?.id}</Tag>
                    <Tag color='blue'>{userState?.user?.group}</Tag>
                  </Space>
                </>
              }
              footer={
                <Descriptions row>
                  <Descriptions.Item itemKey='当前余额'>
                    {renderQuota(userState?.user?.quota)}
                  </Descriptions.Item>
                  <Descriptions.Item itemKey='历史消耗'>
                    {renderQuota(userState?.user?.used_quota)}
                  </Descriptions.Item>
                  <Descriptions.Item itemKey='请求次数'>
                    {userState?.user?.request_count}
                  </Descriptions.Item>
                </Descriptions>
              }
            >
              <Typography.Title heading={6}>可用模型</Typography.Title>
              <div style={{ marginTop: 10 }}>
                <Space wrap>
                  {models.map((model) => (
                    <Tag
                      key={model}
                      color='cyan'
                      onClick={() => {
                        copyText(model);
                      }}
                    >
                      {model}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Card>
            <Card>
              <Typography.Title heading={6}>个人信息</Typography.Title>
              <div style={{ marginTop: 20 }}>
                <Typography.Text strong>邮箱</Typography.Text>
                <div
                  style={{ display: 'flex' }}
                >
                  <div>
                    <Input
                      value={
                        userState?.user && userState.user.email !== ''
                          ? userState.user.email
                          : '未绑定'
                      }
                      readonly={true}
                    ></Input>
                  </div>
                  <div>
                    <Button
                      style={{marginLeft: 8}}
                      onClick={() => {
                        setShowEmailBindModal(true);
                      }}
                    >
                      {userState?.user && userState.user.email !== ''
                        ? '修改绑定'
                        : '绑定邮箱'}
                    </Button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <Space>
                  <Button
                    onClick={() => {
                      setShowChangePasswordModal(true);
                    }}
                  >
                    修改密码
                  </Button>
                </Space>
                {/* <Space>
                  <Button
                      style={{marginLeft: 8}}
                      onClick={() => {
                        setShowWeChatBindModal(true);
                      }}
                    >
                      绑定微信账号
                  </Button>
                </Space> */}
                <Modal
                  onCancel={() => setShowWeChatBindModal(false)}
                  visible={showWeChatBindModal}
                  size={'small'}
                >
                  <Image src={status.wechat_qrcode} />
                  <div style={{ textAlign: 'center' }}>
                    <p>
                      微信扫码关注公众号，输入「验证码」获取验证码（三分钟内有效）
                    </p>
                  </div>
                  <Input
                    placeholder='验证码'
                    name='wechat_verification_code'
                    value={inputs.wechat_verification_code}
                    onChange={(v) =>
                      handleInputChange('wechat_verification_code', v)
                    }
                  />
                  <Button color='' fluid size='large' onClick={bindWeChat}>
                    绑定
                  </Button>
                </Modal>
              </div>
            </Card>
            <Modal
              onCancel={() => setShowEmailBindModal(false)}
              // onOpen={() => setShowEmailBindModal(true)}
              onOk={bindEmail}
              visible={showEmailBindModal}
              size={'small'}
              centered={true}
              maskClosable={false}
            >
              <Typography.Title heading={6}>绑定邮箱地址</Typography.Title>
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Input
                  fluid
                  placeholder='输入邮箱地址'
                  onChange={(value) => handleInputChange('email', value)}
                  name='email'
                  type='email'
                />
                <Button
                  onClick={sendVerificationCode}
                  disabled={disableButton || loading}
                >
                  {disableButton ? `重新发送 (${countdown})` : '获取验证码'}
                </Button>
              </div>
              <div style={{ marginTop: 10 }}>
                <Input
                  fluid
                  placeholder='验证码'
                  name='email_verification_code'
                  value={inputs.email_verification_code}
                  onChange={(value) =>
                    handleInputChange('email_verification_code', value)
                  }
                />
              </div>
              {turnstileEnabled ? (
                <Turnstile
                  sitekey={turnstileSiteKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                  }}
                />
              ) : (
                <></>
              )}
            </Modal>
            <Modal
              onCancel={() => setShowChangePasswordModal(false)}
              visible={showChangePasswordModal}
              size={'small'}
              centered={true}
              onOk={changePassword}
            >
              <div style={{ marginTop: 20 }}>
                <Input
                  name='set_new_password'
                  placeholder='新密码'
                  value={inputs.set_new_password}
                  onChange={(value) =>
                    handleInputChange('set_new_password', value)
                  }
                />
                <Input
                  style={{ marginTop: 20 }}
                  name='set_new_password_confirmation'
                  placeholder='确认新密码'
                  value={inputs.set_new_password_confirmation}
                  onChange={(value) =>
                    handleInputChange('set_new_password_confirmation', value)
                  }
                />
                {turnstileEnabled ? (
                  <Turnstile
                    sitekey={turnstileSiteKey}
                    onVerify={(token) => {
                      setTurnstileToken(token);
                    }}
                  />
                ) : (
                  <></>
                )}
              </div>
            </Modal>
          </div>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default PersonalSetting;

import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../context/User';
import { API, showError, showSuccess, updateAPI } from '../helpers';
import {
  Button,
  Card,
  Form,
  Layout,
} from '@douyinfe/semi-ui';
import Title from '@douyinfe/semi-ui/lib/es/typography/title';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import { setUserData } from '../helpers/data.js';

const LoginForm = () => {
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const { username, password } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError('未登录或登录已过期，请重新登录！');
    }
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
    }
  }, []);

  function handleChange(name, value) {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    setSubmitted(true);
    if (username && password) {
      const res = await API.post(
        `/api/user/login`,
        {
          username,
          password,
        },
      );
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        setUserData(data);
        updateAPI()
        showSuccess('登录成功！');
        navigate('/token');
      } else {
        showError(message);
      }
    } else {
      showError('请输入用户名和密码！');
    }
  }

  return (
    <div>
      <Layout>
        <Layout.Header></Layout.Header>
        <Layout.Content>
          <div
            style={{
              justifyContent: 'center',
              display: 'flex',
              marginTop: 120,
            }}
          >
            <div style={{ width: 500 }}>
              <Card>
                <Title heading={2} style={{ textAlign: 'center' }}>
                  用户登录
                </Title>
                <Form>
                  <Form.Input
                    field={'username'}
                    label={'用户名'}
                    placeholder='用户名'
                    name='username'
                    onChange={(value) => handleChange('username', value)}
                  />
                  <Form.Input
                    field={'password'}
                    label={'密码'}
                    placeholder='密码'
                    name='password'
                    type='password'
                    onChange={(value) => handleChange('password', value)}
                  />

                  <Button
                    theme='solid'
                    style={{ width: '100%' }}
                    type={'primary'}
                    size='large'
                    htmlType={'submit'}
                    onClick={handleSubmit}
                  >
                    登录
                  </Button>
                </Form>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 20,
                  }}
                >
                  <Text>
                    没有账号请先 <Link to='/register'>注册账号</Link>
                  </Text>
                  <Text>
                    忘记密码 <Link to='/reset'>点击重置</Link>
                  </Text>
                </div>
              </Card>
            </div>
          </div>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default LoginForm;

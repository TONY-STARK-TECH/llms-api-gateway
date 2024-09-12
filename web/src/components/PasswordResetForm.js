import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Image, Segment } from 'semantic-ui-react';
import { API, showError, showInfo, showSuccess } from '../helpers';

const PasswordResetForm = () => {
  const [inputs, setInputs] = useState({
    email: '',
  });
  const { email } = inputs;

  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);

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
    return () => clearInterval(countdownInterval);
  }, [disableButton, countdown]);

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    if (!email || email.length == 0) {
      showError("请输入邮箱地址");
      return
    }
    setDisableButton(true);
    
    setLoading(true);
    const res = await API.get(
      `/api/reset_password?email=${email}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('重置邮件发送成功，请检查邮箱！');
      setInputs({ ...inputs, email: '' });
    } else {
      showError(message);
    }
    setLoading(false);
  }

  return (
    <Grid textAlign='center' style={{ marginTop: '48px' }}>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as='h2' textAlign='center' style={{color: "#FFFFFF"}}>密码重置</Header>
        <Form size='large'>
            <Form.Input  
              icon='mail'
              iconPosition='left'
              placeholder='邮箱地址'
              name='email'
              value={email}
              onChange={handleChange}
            />
            <Button
              theme='solid'
              style={{ width: '100%' }}
              type={'primary'}
              size='large'
              onClick={handleSubmit}
              loading={loading}
              disabled={disableButton}
            >
              {disableButton ? `重试 (${countdown})` : '提交'}
            </Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default PasswordResetForm;

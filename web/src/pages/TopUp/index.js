import React, { useEffect, useState } from 'react';
import { API, showError, showInfo, showSuccess } from '../../helpers';
import {
  renderQuota,
  renderQuotaWithAmount,
} from '../../helpers/render';
import {
  Layout,
  Card,
  Button,
  Form,
  Space,
  Modal,
  Toast,
} from '@douyinfe/semi-ui';
import Title from '@douyinfe/semi-ui/lib/es/typography/title';
import { createRoot } from 'react-dom/client';
import {QRCodeSVG} from 'qrcode.react';

const TopUp = () => {
  const [topUpCount, setTopUpCount] = useState(0);
  const [amount, setAmount] = useState(0.0);
  const [minTopUp, setMinTopUp] = useState(1);
  const [topUpLink, setTopUpLink] = useState('');
  const [enableOnlineTopUp, setEnableOnlineTopUp] = useState(false);
  const [userQuota, setUserQuota] = useState(0);
  const [open, setOpen] = useState(false);

  const preTopUp = async () => {
    if (!enableOnlineTopUp) {
      showError('管理员未开启在线充值！');
      return;
    }
    await getAmount();
    if (topUpCount < minTopUp) {
      showError('充值数量不能小于' + minTopUp);
      return;
    }
    await onlineTopUp();
    setOpen(true);
  };

  const onlineTopUp = async () => {
    if (amount === 0) {
      await getAmount();
    }
    if (topUpCount < minTopUp) {
      showError('充值数量不能小于' + minTopUp);
      return;
    }
    setOpen(false);
    try {
      const res = await API.post('/api/user/pay', {
        amount: parseInt(topUpCount)
      });
      if (res !== undefined) {
        const { message, data } = res.data;
        if (message === 'success') {
          setTopUpLink(data);
        } else {
          showError(res);
        }
      } else {
        showError(res);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const getUserQuota = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      setUserQuota(data.quota);
    } else {
      showError(message);
    }
  };

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      if (status.min_topup) {
        setMinTopUp(status.min_topup);
      }
      if (status.enable_online_topup) {
        setEnableOnlineTopUp(status.enable_online_topup);
      }
    }
    getUserQuota().then();
  }, []);

  const renderAmount = () => {
    return amount;
  };

  const getAmount = async (value) => {
    if (value === undefined) {
      value = topUpCount;
    }
    try {
      const res = await API.post('/api/user/amount', {
        amount: parseFloat(value),
      });
      if (res !== undefined) {
        const { message, data } = res.data;
        // showInfo(message);
        if (message === 'success') {
          setAmount(parseFloat(data));
        } else {
          setAmount(0);
          Toast.error({ content: '错误：' + data, id: 'getAmount' });
        }
      } else {
        showError(res);
      }
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div>
      <Layout>
        <Layout.Content>
          <Modal
            title='在线充值'
            visible={open}
            onCancel={handleCancel}
            hasCancel={false}
            footer={<></>}
            maskClosable={false}
            size={'small'}
            centered={true}
          >
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
              <p>充值：$ {topUpCount}，<span style={{color: "#FF6A00"}}>实付：￥{renderAmount()}</span></p>
              <p>请打开微信扫码支付，支付成功后请主动刷新余额</p>
              <QRCodeSVG 
                  style={{width: 320, height: 320}}
                  value={topUpLink} 
                  imageSettings={{
                  width: 320,
                  height: 320
                }}/>
            </div>
          </Modal>
          <div
            style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}
          >
            <Card style={{ width: '100%' }}>
              <Title level={3} style={{ textAlign: 'center' }}>
                可用: {renderQuota(userQuota)}
              </Title>
              <div style={{ marginTop: 30, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <Form layout='horizontal'>
                  <Form.InputNumber
                    disabled={!enableOnlineTopUp}
                    field={'redemptionCount'}
                    label={'实付：' + renderAmount() + ' 元；'}
                    labelPosition={"inset"}
                    style={{
                      color: "#FF6A00",
                      fontSize:  18,
                      fontWeight: 1000,
                    }}
                    placeholder={
                      '充值数量，最低 ' + renderQuotaWithAmount(minTopUp)
                    }
                    name='redemptionCount'
                    suffix={"$"}
                    value={topUpCount}
                    onChange={async (value) => {
                      if (value < 1) {
                        value = 1;
                      }
                      setTopUpCount(value);
                      await getAmount(value);
                    }}
                  />
                  <Space>
                    <Button
                      style={{
                        backgroundColor: 'rgba(var(--semi-green-5), 1)',
                      }}
                      type={'primary'}
                      theme={'solid'}
                      onClick={async () => {
                        preTopUp();
                      }}
                    >
                      微信支付
                    </Button>
                  </Space>
                </Form>
                <p style={{
                  marginTop: 10
                }}>充值成功后，请刷新界面查看余额</p>
              </div>
            </Card>
          </div>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default TopUp;

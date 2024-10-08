import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import { StatusContext } from '../context/Status';
import { Nav, Button } from '@douyinfe/semi-ui';

import {
  API,
  isAdmin,
  isMobile,
  showError,
  showSuccess,
} from '../helpers';
import '../index.css';
import { Layout } from '@douyinfe/semi-ui';
import { setStatusData } from '../helpers/data.js';

const SiderBar = () => {
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState, statusDispatch] = useContext(StatusContext);
  const defaultIsCollapsed =
    isMobile() || localStorage.getItem('default_collapse_sidebar') === 'true';

  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed);

  const routerMap = {
    login: '/login',
    register: '/register',
    home: '/',
    channel: '/channel',
    token: '/token',
    redemption: '/redemption',
    topup: '/topup',
    user: '/user',
    log: '/log',
    setting: '/setting',
    chat: '/chat',
    detail: '/detail',
    pricing: '/pricing',
  };

  const headerButtons = useMemo(
    () => [
      {
        text: '首页',
        itemKey: 'home',
        to: '/',
      },
      {
        text: '渠道',
        itemKey: 'channel',
        to: '/channel',
        className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle',
      },
      {
        text: '聊天',
        itemKey: 'chat',
        to: '/chat',
        className: localStorage.getItem('chat_link')
          ? 'semi-navigation-item-normal'
          : 'tableHiddle',
      },
      {
        text: '令牌',
        itemKey: 'token',
        to: '/token',
      },
      {
        text: '兑换码',
        itemKey: 'redemption',
        to: '/redemption',
        className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle',
      },
      {
        text: '钱包',
        itemKey: 'topup',
        to: '/topup',
      },
      {
        text: '模型',
        itemKey: 'pricing',
        to: '/pricing',
      },
      {
        text: '用户管理',
        itemKey: 'user',
        to: '/user',
        className: isAdmin() ? 'semi-navigation-item-normal' : 'tableHiddle',
      },
      {
        text: '日志',
        itemKey: 'log',
        to: '/log',
      },
      {
        text: '数据',
        itemKey: 'detail',
        to: '/detail',
        className:
          localStorage.getItem('enable_data_export') === 'true'
            ? 'semi-navigation-item-normal'
            : 'tableHiddle',
      },
      {
        text: '设置',
        itemKey: 'setting',
        to: '/setting',
      },
    ],
    [
      localStorage.getItem('enable_data_export'),
      localStorage.getItem('chat_link'),
      isAdmin(),
    ],
  );

  let navigate = useNavigate();

  const logout = async () => {
    API.get('/api/user/logout');
    showSuccess('注销成功!');
    userDispatch({ type: 'logout' });
    localStorage.removeItem('user');
    navigate('/login');
  }

  const loadStatus = async () => {
    const res = await API.get('/api/status');
    if (res === undefined) {
      return;
    }
    const { success, data } = res.data;
    if (success) {
      statusDispatch({ type: 'set', payload: data });
      setStatusData(data);
    } else {
      showError('无法正常连接至服务器！');
    }
  };

  useEffect(() => {
    loadStatus().then(() => {
      setIsCollapsed(
        isMobile() ||
          localStorage.getItem('default_collapse_sidebar') === 'true',
      );
    });
    let localKey = window.location.pathname.split('/')[1];
    if (localKey === '') {
      localKey = 'home';
    }
    setSelectedKeys([localKey]);
  }, []);

  return (
    <>
      <Layout>
        <Nav
            mode = "horizontal"
            defaultIsCollapsed={
              isMobile() ||
              localStorage.getItem('default_collapse_sidebar') === 'true'
            }
            isCollapsed={isCollapsed}
            onCollapseChange={(collapsed) => {
              setIsCollapsed(collapsed);
            }}
            selectedKeys={selectedKeys}
            renderWrapper={({ itemElement, isSubNav, isInSubNav, props }) => {
              return (
                <Link
                  style={{ textDecoration: 'none' }}
                  to={routerMap[props.itemKey]}
                >
                  {itemElement}
                </Link>
              );
            }}
            items={headerButtons}
            onSelect={(key) => {
              setSelectedKeys([key.itemKey]);
            }}
            footer={
              <>
                {userState.user && <Button onClick={logout}>退出</Button>}
              </>
            }
          />
      </Layout>
    </>
  );
};

export default SiderBar;

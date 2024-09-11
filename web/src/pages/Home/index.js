import React, { useContext, useEffect, useState } from 'react';
import { API, showError, showNotice } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { Layout, Carousel, Typography, Space } from '@douyinfe/semi-ui';

const Home = () => {
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
  }, []);

  const { Title, Paragraph } = Typography;

  const style = {
      width: '100%',
      height: '400px',
  };

  const titleStyle = { 
      position: 'absolute', 
      top: '100px', 
      left: '100px',
      color: '#1C1F23'
  };

  const colorStyle = {
      color: '#1C1F23'
  };

  const renderLogo = () => {
      return (
          // <img src='https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/semi_logo.svg' alt='semi_logo' style={{ width: 87, height: 31 }} />   
          <div style={{ width: 87, height: 31 }} />   
      );
  };

  const imgList = [
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-1.png',
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-2.png',
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/hjeh7pldnulm/SemiDocs/bg-3.png',
  ];

  const textList = [
      ['光子人工智能 API 管理系统', '只做最专业的 OpenAI API 提供者', '官方通道，放心使用'],
      ['光子人工智能 API 管理系统', '只做最专业的 OpenAI API 提供者', '官方通道，放心使用'],
      ['光子人工智能 API 管理系统', '只做最专业的 OpenAI API 提供者', '官方通道，放心使用'],
  ];

  return (
    <Layout style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%"
    }}>
      <Carousel style={style} showIndicator={false} showArrow={false} autoPlay={{ interval: 5000 }} speed={500} theme='dark'>
            {
                imgList.map((src, index) => {
                    return (
                        <div key={index} style={{ backgroundSize: 'cover', backgroundImage: `url('${src}')` }}>
                            <Space vertical align='start' spacing='medium' style={titleStyle}>
                                {renderLogo()}
                                <Title heading={2} style={colorStyle}>{textList[index][0]}</Title>
                                <Space vertical align='start'>
                                    <Paragraph style={colorStyle}>{textList[index][1]}</Paragraph>
                                    <Paragraph style={colorStyle}>{textList[index][2]}</Paragraph>
                                </Space>
                            </Space>
                        </div>
                    );
                })
            }
      </Carousel>
    </Layout>
  );
};

export default Home;

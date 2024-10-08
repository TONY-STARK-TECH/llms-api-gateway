import React from 'react';
import { Spin } from '@douyinfe/semi-ui';

const Loading = ({ prompt: name = 'page' }) => {
  return (
    <Spin style={{ height: 100 }} spinning={true}/>
  );
};

export default Loading;

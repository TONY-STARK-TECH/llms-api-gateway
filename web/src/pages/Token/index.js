import React from 'react';
import TokensTable from '../../components/TokensTable';
import { Banner, Layout } from '@douyinfe/semi-ui';
const Token = () => (
  <>
    <Layout>
      <Layout.Content>
        <TokensTable />
      </Layout.Content>
      <Layout.Footer>
        <Banner
          type='info'
          description='令牌无法精确控制使用额度，请勿随意将令牌分发给其他用户。'
        />
      </Layout.Footer>
    </Layout>
  </>
);

export default Token;

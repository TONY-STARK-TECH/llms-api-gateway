import React from 'react';
import UsersTable from '../../components/UsersTable';
import { Layout } from '@douyinfe/semi-ui';

const User = () => (
  <>
    <Layout>
      <Layout.Content>
        <UsersTable />
      </Layout.Content>
    </Layout>
  </>
);

export default User;

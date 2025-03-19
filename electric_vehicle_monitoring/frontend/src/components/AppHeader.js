import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Col, Dropdown, Layout, Row } from 'antd';
import React from 'react';

const { Header } = Layout;

const AppHeader = () => {
  // 用户菜单项
  const userMenuItems = [
    {
      key: '1',
      label: '个人信息',
    },
    {
      key: '2',
      label: '修改密码',
    },
    {
      key: '3',
      label: '退出登录',
    },
  ];

  // 通知菜单项
  const notificationMenuItems = [
    {
      key: '1',
      label: '暂无新通知',
    },
  ];

  return (
    <Header className="site-layout-background" style={{ padding: 0, background: '#fff' }}>
      <Row justify="space-between" align="middle" style={{ height: '100%', padding: '0 24px' }}>
        <Col>
          <div className="header-title" style={{ color: '#000' }}>电动车充电安全实时智能监控系统</div>
        </Col>
        <Col>
          <Row gutter={16} align="middle">
            <Col>
              <Dropdown menu={{ items: notificationMenuItems }} placement="bottomRight">
                <Badge count={0} overflowCount={99}>
                  <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
                </Badge>
              </Dropdown>
            </Col>
            <Col>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text" icon={<UserOutlined style={{ fontSize: '18px' }} />}>
                  管理员
                </Button>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  );
};

export default AppHeader; 
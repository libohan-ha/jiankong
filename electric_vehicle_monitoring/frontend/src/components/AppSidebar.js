import {
    AlertOutlined,
    DashboardOutlined,
    LineChartOutlined,
    SettingOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // 菜单项
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>,
    },
    {
      key: '/cameras',
      icon: <VideoCameraOutlined />,
      label: <Link to="/cameras">摄像头监控</Link>,
    },
    {
      key: '/sensors',
      icon: <LineChartOutlined />,
      label: <Link to="/sensors">传感器数据</Link>,
    },
    {
      key: '/alerts',
      icon: <AlertOutlined />,
      label: <Link to="/alerts">报警管理</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">系统设置</Link>,
    },
  ];

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    return [path];
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <div className="logo">
        {collapsed ? 'EV' : '电动车监控'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKey()}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSidebar; 
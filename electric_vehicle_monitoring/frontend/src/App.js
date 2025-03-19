import { Layout } from 'antd';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// 导入组件
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import Alerts from './pages/Alerts';
import Cameras from './pages/Cameras';
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import Settings from './pages/Settings';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <AppSidebar />
        <Layout className="site-layout">
          <AppHeader />
          <Content style={{ margin: '16px' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cameras" element={<Cameras />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sensors" element={<Sensors />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App; 
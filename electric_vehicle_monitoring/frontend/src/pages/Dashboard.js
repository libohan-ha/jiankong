import { AlertOutlined, CheckCircleOutlined, LineChartOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Card, Col, Row, Spin, Statistic, Table, Tag } from 'antd';
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

// 注册Chart.js组件
Chart.register(...registerables);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAlerts: 0,
    activeCameras: 0,
    activeSensors: 0,
    systemStatus: 'normal'
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [sensorData, setSensorData] = useState({
    labels: [],
    datasets: []
  });

  // 获取仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 获取统计数据
        // 实际项目中应该从后端API获取
        // 这里使用模拟数据
        setStats({
          activeAlerts: 3,
          activeCameras: 4,
          activeSensors: 12,
          systemStatus: 'normal'
        });
        
        // 获取最近报警
        // 实际项目中应该从后端API获取
        setRecentAlerts([
          {
            id: 1,
            alert_type: 'fire',
            message: '检测到火灾隐患',
            source_type: 'camera',
            source_id: 'camera_1',
            severity: 5,
            status: 'new',
            created_at: '2025-03-17 10:30:00'
          },
          {
            id: 2,
            alert_type: 'overheat',
            message: '温度过高: 58°C',
            source_type: 'sensor',
            source_id: 'sensor_temperature',
            severity: 4,
            status: 'acknowledged',
            created_at: '2025-03-17 10:30:00'
          },
          {
            id: 3,
            alert_type: 'overcurrent',
            message: '电流异常: 19.5A',
            source_type: 'sensor',
            source_id: 'sensor_current',
            severity: 3,
            status: 'in_progress',
            created_at: '2025-03-17 10:30:00'
          }
        ]);
        
        // 获取传感器数据
        // 实际项目中应该从后端API获取
        setSensorData({
          labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00'],
          datasets: [
            {
              label: '温度 (°C)',
              data: [25, 26, 25, 27, 28, 32, 45],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              tension: 0.1
            },
            {
              label: '电流 (A)',
              data: [5, 5.5, 6, 7, 8, 10, 12],
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              tension: 0.1
            }
          ]
        });
        
        setLoading(false);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // 设置定时刷新
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 报警状态标签
  const getAlertStatusTag = (status) => {
    const statusMap = {
      'new': { color: 'red', text: '新报警' },
      'acknowledged': { color: 'orange', text: '已确认' },
      'in_progress': { color: 'blue', text: '处理中' },
      'resolved': { color: 'green', text: '已解决' },
      'false': { color: 'gray', text: '误报' }
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // 报警类型标签
  const getAlertTypeTag = (type) => {
    const typeMap = {
      'fire': { color: 'red', text: '火灾' },
      'overheat': { color: 'volcano', text: '过热' },
      'overcurrent': { color: 'orange', text: '过流' },
      'smoke': { color: 'gold', text: '烟雾' },
      'unauthorized': { color: 'lime', text: '未授权充电' },
      'abnormal': { color: 'green', text: '异常行为' },
      'connection': { color: 'cyan', text: '连接问题' },
      'system_error': { color: 'blue', text: '系统错误' }
    };
    
    const typeInfo = typeMap[type] || { color: 'default', text: type };
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  // 报警表格列定义
  const alertColumns = [
    {
      title: '类型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      render: (text) => getAlertTypeTag(text)
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: '来源',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (text, record) => `${text} (${record.source_id})`
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (text) => {
        const colors = ['', 'green', 'cyan', 'blue', 'orange', 'red'];
        return <Tag color={colors[text]}>{text}/5</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => getAlertStatusTag(text)
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    }
  ];

  // 图表选项
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '传感器数据趋势',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <h2>系统概览</h2>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃报警"
                value={stats.activeAlerts}
                valueStyle={{ color: stats.activeAlerts > 0 ? '#cf1322' : '#3f8600' }}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="摄像头"
                value={stats.activeCameras}
                valueStyle={{ color: '#1890ff' }}
                prefix={<VideoCameraOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="传感器"
                value={stats.activeSensors}
                valueStyle={{ color: '#1890ff' }}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="系统状态"
                value={stats.systemStatus === 'normal' ? '正常' : '异常'}
                valueStyle={{ color: stats.systemStatus === 'normal' ? '#3f8600' : '#cf1322' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="最近报警" style={{ marginBottom: 16 }}>
              <Table
                columns={alertColumns}
                dataSource={recentAlerts}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="传感器数据趋势" style={{ marginBottom: 16 }}>
              <div style={{ height: 300 }}>
                <Line options={chartOptions} data={sensorData} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard; 
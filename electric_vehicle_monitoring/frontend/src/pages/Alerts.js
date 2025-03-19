import { AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, Modal, Row, Select, Spin, Statistic, Table, Tabs, Tag, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Alerts = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    acknowledged: 0,
    in_progress: 0,
    resolved: 0,
    false_alarm: 0
  });
  const [filters, setFilters] = useState({
    status: null,
    type: null,
    date_range: null
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [form] = Form.useForm();

  // 获取报警数据
  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // 实际项目中应该从后端API获取
      // const params = {};
      // if (filters.status) params.status = filters.status;
      // if (filters.type) params.type = filters.type;
      // if (filters.date_range) {
      //   params.start_date = filters.date_range[0].format('YYYY-MM-DD');
      //   params.end_date = filters.date_range[1].format('YYYY-MM-DD');
      // }
      // const response = await axios.get('/api/alerts', { params });
      // setAlerts(response.data.items);
      
      // 使用模拟数据
      const mockAlerts = [
        {
          id: 1,
          alert_type: 'fire',
          status: 'new',
          message: '检测到火灾隐患',
          source_type: 'camera',
          source_id: 'camera_1',
          location: '地下停车场充电区',
          severity: 5,
          created_at: '2025-03-17 10:30:00',
          updated_at: '2025-03-17 10:30:00',
          image_url: null
        },
        {
          id: 2,
          alert_type: 'overheat',
          status: 'acknowledged',
          message: '温度过高: 58°C',
          source_type: 'sensor',
          source_id: 'sensor_temperature',
          location: '地下停车场充电区',
          severity: 4,
          created_at: '2025-03-17 23:30:00',
          updated_at: '2025-03-17 23:30:00',
          handled_by: '管理员',
          image_url: null
        },
        {
          id: 3,
          alert_type: 'overcurrent',
          status: 'in_progress',
          message: '电流异常: 19.5A',
          source_type: 'sensor',
          source_id: 'sensor_current',
          location: '室外充电桩',
          severity: 3,
          created_at: '2025-03-17 23:30:00',
          updated_at: '2025-03-17 23:30:00',
          handled_by: '技术人员',
          handler_notes: '正在检查电路',
          image_url: null
        },
        {
          id: 4,
          alert_type: 'smoke',
          status: 'resolved',
          message: '检测到烟雾: 450ppm',
          source_type: 'sensor',
          source_id: 'sensor_smoke',
          location: '地下停车场充电区',
          severity: 4,
          created_at: '2025-03-17 10:30:00',
          updated_at: '2025-03-17 10:30:00',
          resolved_at: '2025-03-17 10:30:00',
          handled_by: '安全人员',
          handler_notes: '已确认为灰尘导致的误报',
          image_url: null
        },
        {
          id: 5,
          alert_type: 'unauthorized',
          status: 'false',
          message: '检测到未授权充电行为',
          source_type: 'camera',
          source_id: 'camera_2',
          location: '室外充电桩',
          severity: 2,
          created_at: '2025-03-17 10:30:00',
          updated_at: '2025-03-17 10:30:00',
          handled_by: '管理员',
          handler_notes: '误报，是授权用户',
          image_url: null
        }
      ];
      
      // 应用过滤器
      let filteredAlerts = [...mockAlerts];
      
      if (filters.status) {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === filters.status);
      }
      
      if (filters.type) {
        filteredAlerts = filteredAlerts.filter(alert => alert.alert_type === filters.type);
      }
      
      if (filters.date_range) {
        const startDate = filters.date_range[0].startOf('day');
        const endDate = filters.date_range[1].endOf('day');
        
        filteredAlerts = filteredAlerts.filter(alert => {
          const alertDate = moment(alert.created_at);
          return alertDate.isBetween(startDate, endDate, null, '[]');
        });
      }
      
      setAlerts(filteredAlerts);
      
      // 计算统计数据
      const statsData = {
        total: mockAlerts.length,
        new: mockAlerts.filter(a => a.status === 'new').length,
        acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
        in_progress: mockAlerts.filter(a => a.status === 'in_progress').length,
        resolved: mockAlerts.filter(a => a.status === 'resolved').length,
        false_alarm: mockAlerts.filter(a => a.status === 'false').length
      };
      
      setStats(statsData);
      
      setLoading(false);
    } catch (error) {
      console.error('获取报警数据失败:', error);
      message.error('获取报警数据失败');
      setLoading(false);
    }
  };

  // 处理过滤器变化
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  // 重置过滤器
  const handleResetFilters = () => {
    setFilters({
      status: null,
      type: null,
      date_range: null
    });
  };

  // 查看报警详情
  const handleViewAlert = (alert) => {
    setCurrentAlert(alert);
    setDetailModalVisible(true);
  };

  // 更新报警状态
  const handleUpdateAlertStatus = async (values) => {
    try {
      // 实际项目中应该调用后端API
      // await axios.put(`/api/alerts/${currentAlert.id}`, values);
      
      // 更新本地状态
      const updatedAlerts = alerts.map(alert => 
        alert.id === currentAlert.id 
          ? { 
              ...alert, 
              status: values.status, 
              handled_by: values.handled_by || alert.handled_by,
              handler_notes: values.handler_notes || alert.handler_notes,
              updated_at: new Date().toISOString(),
              resolved_at: values.status === 'resolved' ? new Date().toISOString() : alert.resolved_at
            } 
          : alert
      );
      
      setAlerts(updatedAlerts);
      
      // 更新当前报警
      setCurrentAlert({
        ...currentAlert,
        status: values.status,
        handled_by: values.handled_by || currentAlert.handled_by,
        handler_notes: values.handler_notes || currentAlert.handler_notes,
        updated_at: new Date().toISOString(),
        resolved_at: values.status === 'resolved' ? new Date().toISOString() : currentAlert.resolved_at
      });
      
      // 更新统计数据
      const newStats = { ...stats };
      
      // 减少原状态计数
      if (currentAlert.status === 'new') newStats.new -= 1;
      else if (currentAlert.status === 'acknowledged') newStats.acknowledged -= 1;
      else if (currentAlert.status === 'in_progress') newStats.in_progress -= 1;
      else if (currentAlert.status === 'resolved') newStats.resolved -= 1;
      else if (currentAlert.status === 'false') newStats.false_alarm -= 1;
      
      // 增加新状态计数
      if (values.status === 'new') newStats.new += 1;
      else if (values.status === 'acknowledged') newStats.acknowledged += 1;
      else if (values.status === 'in_progress') newStats.in_progress += 1;
      else if (values.status === 'resolved') newStats.resolved += 1;
      else if (values.status === 'false') newStats.false_alarm += 1;
      
      setStats(newStats);
      
      message.success('报警状态已更新');
    } catch (error) {
      console.error('更新报警状态失败:', error);
      message.error('更新报警状态失败');
    }
  };

  // 报警状态标签
  const getAlertStatusTag = (status) => {
    const statusMap = {
      'new': { color: 'red', text: '新报警', icon: <AlertOutlined /> },
      'acknowledged': { color: 'orange', text: '已确认', icon: <ExclamationCircleOutlined /> },
      'in_progress': { color: 'blue', text: '处理中', icon: <ClockCircleOutlined /> },
      'resolved': { color: 'green', text: '已解决', icon: <CheckCircleOutlined /> },
      'false': { color: 'gray', text: '误报', icon: <ExclamationCircleOutlined /> }
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status, icon: null };
    return <Tag color={statusInfo.color} icon={statusInfo.icon}>{statusInfo.text}</Tag>;
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

  // 报警表格列
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '类型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      render: (text) => getAlertTypeTag(text)
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: '来源',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (text, record) => `${text} (${record.source_id})`
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true
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
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewAlert(record)}>
          查看
        </Button>
      )
    }
  ];

  return (
    <Spin spinning={loading}>
      <div>
        <h2>报警管理</h2>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="总报警数"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="新报警"
                value={stats.new}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已确认"
                value={stats.acknowledged}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="处理中"
                value={stats.in_progress}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已解决"
                value={stats.resolved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="误报"
                value={stats.false_alarm}
                valueStyle={{ color: '#d9d9d9' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Select
                placeholder="状态过滤"
                style={{ width: '100%' }}
                allowClear
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="new">新报警</Option>
                <Option value="acknowledged">已确认</Option>
                <Option value="in_progress">处理中</Option>
                <Option value="resolved">已解决</Option>
                <Option value="false">误报</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="类型过滤"
                style={{ width: '100%' }}
                allowClear
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
              >
                <Option value="fire">火灾</Option>
                <Option value="overheat">过热</Option>
                <Option value="overcurrent">过流</Option>
                <Option value="smoke">烟雾</Option>
                <Option value="unauthorized">未授权充电</Option>
                <Option value="abnormal">异常行为</Option>
                <Option value="connection">连接问题</Option>
                <Option value="system_error">系统错误</Option>
              </Select>
            </Col>
            <Col span={8}>
              <RangePicker
                style={{ width: '100%' }}
                value={filters.date_range}
                onChange={(dates) => handleFilterChange('date_range', dates)}
              />
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={handleResetFilters}>
                重置过滤器
              </Button>
            </Col>
          </Row>
          
          <Table
            columns={columns}
            dataSource={alerts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
        
        {/* 报警详情模态框 */}
        <Modal
          title="报警详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {currentAlert && (
            <div>
              <Tabs
                defaultActiveKey="details"
                items={[
                  {
                    key: 'details',
                    label: '基本信息',
                    children: (
                      <div>
                        <Row gutter={16}>
                          <Col span={12}>
                            <p><strong>ID:</strong> {currentAlert.id}</p>
                            <p><strong>类型:</strong> {getAlertTypeTag(currentAlert.alert_type)}</p>
                            <p><strong>消息:</strong> {currentAlert.message}</p>
                            <p><strong>来源:</strong> {currentAlert.source_type} ({currentAlert.source_id})</p>
                            <p><strong>位置:</strong> {currentAlert.location}</p>
                            <p><strong>严重程度:</strong> {currentAlert.severity}/5</p>
                          </Col>
                          <Col span={12}>
                            <p><strong>状态:</strong> {getAlertStatusTag(currentAlert.status)}</p>
                            <p><strong>创建时间:</strong> {moment(currentAlert.created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
                            <p><strong>更新时间:</strong> {moment(currentAlert.updated_at).format('YYYY-MM-DD HH:mm:ss')}</p>
                            {currentAlert.resolved_at && (
                              <p><strong>解决时间:</strong> {moment(currentAlert.resolved_at).format('YYYY-MM-DD HH:mm:ss')}</p>
                            )}
                            {currentAlert.handled_by && (
                              <p><strong>处理人:</strong> {currentAlert.handled_by}</p>
                            )}
                            {currentAlert.handler_notes && (
                              <p><strong>处理备注:</strong> {currentAlert.handler_notes}</p>
                            )}
                          </Col>
                        </Row>
                        
                        {currentAlert.image_url && (
                          <div style={{ marginTop: 16 }}>
                            <p><strong>报警图像:</strong></p>
                            <img 
                              src={currentAlert.image_url} 
                              alt="报警图像" 
                              style={{ maxWidth: '100%', maxHeight: 300 }} 
                            />
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'update',
                    label: '更新状态',
                    children: (
                      <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                          status: currentAlert.status,
                          handled_by: currentAlert.handled_by || '',
                          handler_notes: currentAlert.handler_notes || ''
                        }}
                        onFinish={handleUpdateAlertStatus}
                      >
                        <Form.Item
                          name="status"
                          label="状态"
                          rules={[{ required: true, message: '请选择状态' }]}
                        >
                          <Select>
                            <Option value="new">新报警</Option>
                            <Option value="acknowledged">已确认</Option>
                            <Option value="in_progress">处理中</Option>
                            <Option value="resolved">已解决</Option>
                            <Option value="false">误报</Option>
                          </Select>
                        </Form.Item>
                        
                        <Form.Item
                          name="handled_by"
                          label="处理人"
                        >
                          <Input placeholder="请输入处理人" />
                        </Form.Item>
                        
                        <Form.Item
                          name="handler_notes"
                          label="处理备注"
                        >
                          <TextArea rows={4} placeholder="请输入处理备注" />
                        </Form.Item>
                        
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            更新状态
                          </Button>
                        </Form.Item>
                      </Form>
                    )
                  }
                ]}
              />
            </div>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default Alerts; 
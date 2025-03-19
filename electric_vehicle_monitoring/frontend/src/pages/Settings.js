import { ApiOutlined, BellOutlined, CloudServerOutlined, SafetyOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, InputNumber, message, Row, Select, Spin, Switch, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [generalForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [apiForm] = Form.useForm();
  const [backupForm] = Form.useForm();

  // 加载设置数据
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // 实际项目中应该从后端API获取
      // const response = await axios.get('/api/settings');
      // const settings = response.data;
      
      // 使用模拟数据
      const mockSettings = {
        general: {
          system_name: '电动汽车充电安全监控系统',
          company_name: '智能监控科技有限公司',
          admin_email: '1661375622@qq.com',
          language: 'zh_CN',
          timezone: 'Asia/Shanghai',
          data_retention_days: 90
        },
        notification: {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          alert_sound: true,
          email_recipients: '1661375622@qq.com',
          sms_recipients: '15925687236',
          notification_frequency: 'immediate',
          daily_report: true,
          daily_report_time: '08:00',
          weekly_report: true,
          weekly_report_day: 'monday'
        },
        security: {
          two_factor_auth: false,
          password_expiry_days: 90,
          session_timeout_minutes: 30,
          failed_login_attempts: 5,
          ip_restriction: false,
          allowed_ips: '',
          audit_logging: true
        },
        api: {
          api_enabled: true,
          require_api_key: true,
          rate_limit: 100,
          webhook_url: 'https://example.com/webhook',
          webhook_events: ['alert.created', 'alert.updated']
        },
        backup: {
          auto_backup: true,
          backup_frequency: 'daily',
          backup_time: '02:00',
          backup_retention: 7,
          backup_location: 'local',
          cloud_backup: false,
          cloud_provider: '',
          cloud_credentials: ''
        }
      };
      
      // 设置表单初始值
      generalForm.setFieldsValue(mockSettings.general);
      notificationForm.setFieldsValue(mockSettings.notification);
      securityForm.setFieldsValue(mockSettings.security);
      apiForm.setFieldsValue(mockSettings.api);
      backupForm.setFieldsValue(mockSettings.backup);
      
      setLoading(false);
    } catch (error) {
      console.error('获取设置数据失败:', error);
      message.error('获取设置数据失败');
      setLoading(false);
    }
  };

  // 保存通用设置
  const saveGeneralSettings = async (values) => {
    try {
      // 实际项目中应该调用后端API
      // await axios.put('/api/settings/general', values);
      
      console.log('保存通用设置:', values);
      message.success('通用设置已保存');
    } catch (error) {
      console.error('保存通用设置失败:', error);
      message.error('保存通用设置失败');
    }
  };

  // 保存通知设置
  const saveNotificationSettings = async (values) => {
    try {
      // 实际项目中应该调用后端API
      // await axios.put('/api/settings/notification', values);
      
      console.log('保存通知设置:', values);
      message.success('通知设置已保存');
    } catch (error) {
      console.error('保存通知设置失败:', error);
      message.error('保存通知设置失败');
    }
  };

  // 保存安全设置
  const saveSecuritySettings = async (values) => {
    try {
      // 实际项目中应该调用后端API
      // await axios.put('/api/settings/security', values);
      
      console.log('保存安全设置:', values);
      message.success('安全设置已保存');
    } catch (error) {
      console.error('保存安全设置失败:', error);
      message.error('保存安全设置失败');
    }
  };

  // 保存API设置
  const saveApiSettings = async (values) => {
    try {
      // 实际项目中应该调用后端API
      // await axios.put('/api/settings/api', values);
      
      console.log('保存API设置:', values);
      message.success('API设置已保存');
    } catch (error) {
      console.error('保存API设置失败:', error);
      message.error('保存API设置失败');
    }
  };

  // 保存备份设置
  const saveBackupSettings = async (values) => {
    try {
      // 实际项目中应该调用后端API
      // await axios.put('/api/settings/backup', values);
      
      console.log('保存备份设置:', values);
      message.success('备份设置已保存');
    } catch (error) {
      console.error('保存备份设置失败:', error);
      message.error('保存备份设置失败');
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <h2>系统设置</h2>
        
        <Card>
          <Tabs defaultActiveKey="general">
            {/* 通用设置 */}
            <TabPane 
              tab={
                <span>
                  <SaveOutlined />
                  通用设置
                </span>
              } 
              key="general"
            >
              <Form
                form={generalForm}
                layout="vertical"
                onFinish={saveGeneralSettings}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="system_name"
                      label="系统名称"
                      rules={[{ required: true, message: '请输入系统名称' }]}
                    >
                      <Input placeholder="请输入系统名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="company_name"
                      label="公司名称"
                    >
                      <Input placeholder="请输入公司名称" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="admin_email"
                      label="管理员邮箱"
                      rules={[
                        { required: true, message: '请输入管理员邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <Input placeholder="请输入管理员邮箱" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="language"
                      label="系统语言"
                    >
                      <Select placeholder="请选择系统语言">
                        <Option value="zh_CN">简体中文</Option>
                        <Option value="en_US">English (US)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="timezone"
                      label="时区"
                    >
                      <Select placeholder="请选择时区">
                        <Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Option>
                        <Option value="America/New_York">美国东部时间 (UTC-5/4)</Option>
                        <Option value="Europe/London">格林威治标准时间 (UTC+0)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="data_retention_days"
                      label="数据保留天数"
                      rules={[{ required: true, message: '请输入数据保留天数' }]}
                    >
                      <InputNumber min={1} max={365} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存通用设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            {/* 通知设置 */}
            <TabPane 
              tab={
                <span>
                  <BellOutlined />
                  通知设置
                </span>
              } 
              key="notification"
            >
              <Form
                form={notificationForm}
                layout="vertical"
                onFinish={saveNotificationSettings}
              >
                <Divider orientation="left">通知方式</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="email_notifications"
                      label="邮件通知"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="sms_notifications"
                      label="短信通知"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="push_notifications"
                      label="推送通知"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email_recipients"
                      label="邮件接收人"
                      rules={[
                        { required: true, message: '请输入邮件接收人' }
                      ]}
                    >
                      <TextArea 
                        placeholder="请输入邮件接收人，多个邮箱用逗号分隔" 
                        rows={2}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="sms_recipients"
                      label="短信接收人"
                    >
                      <TextArea 
                        placeholder="请输入短信接收人，多个手机号用逗号分隔" 
                        rows={2}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="notification_frequency"
                      label="通知频率"
                    >
                      <Select placeholder="请选择通知频率">
                        <Option value="immediate">立即通知</Option>
                        <Option value="hourly">每小时汇总</Option>
                        <Option value="daily">每日汇总</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="alert_sound"
                      label="报警声音"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider orientation="left">报告设置</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="daily_report"
                      label="每日报告"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="daily_report_time"
                      label="每日报告时间"
                    >
                      <Select placeholder="请选择每日报告时间">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <Option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="weekly_report"
                      label="每周报告"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="weekly_report_day"
                      label="每周报告日期"
                    >
                      <Select placeholder="请选择每周报告日期">
                        <Option value="monday">星期一</Option>
                        <Option value="tuesday">星期二</Option>
                        <Option value="wednesday">星期三</Option>
                        <Option value="thursday">星期四</Option>
                        <Option value="friday">星期五</Option>
                        <Option value="saturday">星期六</Option>
                        <Option value="sunday">星期日</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存通知设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            {/* 安全设置 */}
            <TabPane 
              tab={
                <span>
                  <SafetyOutlined />
                  安全设置
                </span>
              } 
              key="security"
            >
              <Form
                form={securityForm}
                layout="vertical"
                onFinish={saveSecuritySettings}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="two_factor_auth"
                      label="双因素认证"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="password_expiry_days"
                      label="密码过期天数"
                    >
                      <InputNumber min={0} max={365} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="session_timeout_minutes"
                      label="会话超时时间（分钟）"
                    >
                      <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="failed_login_attempts"
                      label="允许失败登录次数"
                    >
                      <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ip_restriction"
                      label="IP限制"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="allowed_ips"
                      label="允许的IP地址"
                    >
                      <TextArea 
                        placeholder="请输入允许的IP地址，多个IP用逗号分隔" 
                        rows={2}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="audit_logging"
                      label="审计日志"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存安全设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            {/* API设置 */}
            <TabPane 
              tab={
                <span>
                  <ApiOutlined />
                  API设置
                </span>
              } 
              key="api"
            >
              <Form
                form={apiForm}
                layout="vertical"
                onFinish={saveApiSettings}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="api_enabled"
                      label="启用API"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="require_api_key"
                      label="需要API密钥"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="rate_limit"
                      label="API速率限制（每分钟请求数）"
                    >
                      <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider orientation="left">Webhook设置</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="webhook_url"
                      label="Webhook URL"
                    >
                      <Input placeholder="请输入Webhook URL" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="webhook_events"
                      label="Webhook事件"
                    >
                      <Select 
                        mode="multiple" 
                        placeholder="请选择触发Webhook的事件"
                      >
                        <Option value="alert.created">报警创建</Option>
                        <Option value="alert.updated">报警更新</Option>
                        <Option value="alert.resolved">报警解决</Option>
                        <Option value="camera.offline">摄像头离线</Option>
                        <Option value="sensor.offline">传感器离线</Option>
                        <Option value="system.error">系统错误</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存API设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            {/* 备份设置 */}
            <TabPane 
              tab={
                <span>
                  <CloudServerOutlined />
                  备份设置
                </span>
              } 
              key="backup"
            >
              <Form
                form={backupForm}
                layout="vertical"
                onFinish={saveBackupSettings}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="auto_backup"
                      label="自动备份"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="backup_frequency"
                      label="备份频率"
                    >
                      <Select placeholder="请选择备份频率">
                        <Option value="hourly">每小时</Option>
                        <Option value="daily">每天</Option>
                        <Option value="weekly">每周</Option>
                        <Option value="monthly">每月</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="backup_time"
                      label="备份时间"
                    >
                      <Select placeholder="请选择备份时间">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <Option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="backup_retention"
                      label="备份保留数量"
                    >
                      <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="backup_location"
                      label="备份位置"
                    >
                      <Select placeholder="请选择备份位置">
                        <Option value="local">本地存储</Option>
                        <Option value="remote">远程服务器</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider orientation="left">云备份设置</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="cloud_backup"
                      label="启用云备份"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="cloud_provider"
                      label="云服务提供商"
                    >
                      <Select placeholder="请选择云服务提供商">
                        <Option value="aws">Amazon S3</Option>
                        <Option value="azure">Microsoft Azure</Option>
                        <Option value="google">Google Cloud</Option>
                        <Option value="aliyun">阿里云</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="cloud_credentials"
                      label="云服务凭证"
                    >
                      <TextArea 
                        placeholder="请输入云服务凭证（JSON格式）" 
                        rows={4}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存备份设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </Spin>
  );
};

export default Settings; 
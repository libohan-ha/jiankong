import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Form, Input, message, Modal, Row, Select, Spin, Switch } from 'antd';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

const Cameras = () => {
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentCamera, setCurrentCamera] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewCamera, setPreviewCamera] = useState(null);
  const [form] = Form.useForm();

  // 获取摄像头列表
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      // 实际项目中应该从后端API获取
      // const response = await axios.get('/api/cameras');
      // setCameras(response.data);
      
      // 使用模拟数据
      setCameras([
        {
          id: 1,
          name: '停车场入口',
          url: 'http://example.com/camera1',
          location: '地下停车场入口',
          status: 'active',
          detection_enabled: true
        },
        {
          id: 2,
          name: '充电区域1',
          url: 'http://example.com/camera2',
          location: '地下停车场充电区',
          status: 'active',
          detection_enabled: true
        },
        {
          id: 3,
          name: '充电区域2',
          url: 'http://example.com/camera3',
          location: '室外充电桩',
          status: 'active',
          detection_enabled: true
        },
        {
          id: 4,
          name: '监控点4',
          url: 'http://example.com/camera4',
          location: '电动车停放区',
          status: 'inactive',
          detection_enabled: false
        }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('获取摄像头列表失败:', error);
      message.error('获取摄像头列表失败');
      setLoading(false);
    }
  };

  // 添加摄像头
  const handleAddCamera = () => {
    setModalType('add');
    setCurrentCamera(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑摄像头
  const handleEditCamera = (camera) => {
    setModalType('edit');
    setCurrentCamera(camera);
    form.setFieldsValue({
      name: camera.name,
      url: camera.url,
      location: camera.location,
      status: camera.status,
      detection_enabled: camera.detection_enabled
    });
    setModalVisible(true);
  };

  // 删除摄像头
  const handleDeleteCamera = async (cameraId) => {
    try {
      // 实际项目中应该调用后端API
      // await axios.delete(`/api/cameras/${cameraId}`);
      
      // 更新本地状态
      setCameras(cameras.filter(camera => camera.id !== cameraId));
      message.success('摄像头已删除');
    } catch (error) {
      console.error('删除摄像头失败:', error);
      message.error('删除摄像头失败');
    }
  };

  // 预览摄像头
  const handlePreviewCamera = (camera) => {
    setPreviewCamera(camera);
    setPreviewVisible(true);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      if (modalType === 'add') {
        // 添加摄像头
        // 实际项目中应该调用后端API
        // const response = await axios.post('/api/cameras', values);
        
        // 模拟添加
        const newCamera = {
          id: Date.now(),
          ...values
        };
        setCameras([...cameras, newCamera]);
        message.success('摄像头已添加');
      } else {
        // 编辑摄像头
        // 实际项目中应该调用后端API
        // await axios.put(`/api/cameras/${currentCamera.id}`, values);
        
        // 模拟编辑
        const updatedCameras = cameras.map(camera => 
          camera.id === currentCamera.id ? { ...camera, ...values } : camera
        );
        setCameras(updatedCameras);
        message.success('摄像头已更新');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('保存摄像头失败:', error);
      message.error('保存摄像头失败');
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h2>摄像头监控</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCamera}>
            添加摄像头
          </Button>
        </div>

        {cameras.length === 0 ? (
          <Empty description="暂无摄像头" />
        ) : (
          <Row gutter={[16, 16]}>
            {cameras.map(camera => (
              <Col key={camera.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  title={camera.name}
                  extra={
                    <div>
                      <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handlePreviewCamera(camera)}
                      />
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditCamera(camera)}
                      />
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteCamera(camera.id)}
                      />
                    </div>
                  }
                  className="camera-card"
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>位置:</strong> {camera.location}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>状态:</strong> {camera.status === 'active' ? '在线' : '离线'}
                  </div>
                  <div>
                    <strong>检测:</strong> {camera.detection_enabled ? '已启用' : '已禁用'}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* 添加/编辑摄像头模态框 */}
        <Modal
          title={modalType === 'add' ? '添加摄像头' : '编辑摄像头'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="摄像头名称"
              rules={[{ required: true, message: '请输入摄像头名称' }]}
            >
              <Input placeholder="请输入摄像头名称" />
            </Form.Item>
            
            <Form.Item
              name="url"
              label="摄像头URL"
              rules={[{ required: true, message: '请输入摄像头URL' }]}
            >
              <Input placeholder="请输入摄像头URL" />
            </Form.Item>
            
            <Form.Item
              name="location"
              label="位置"
            >
              <Input placeholder="请输入摄像头位置" />
            </Form.Item>
            
            <Form.Item
              name="status"
              label="状态"
              initialValue="active"
            >
              <Select>
                <Option value="active">在线</Option>
                <Option value="inactive">离线</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="detection_enabled"
              label="启用检测"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* 预览摄像头模态框 */}
        <Modal
          title={previewCamera?.name}
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button key="back" onClick={() => setPreviewVisible(false)}>
              关闭
            </Button>,
            <Button 
              key="settings" 
              type="primary" 
              icon={<SettingOutlined />}
              onClick={() => {
                setPreviewVisible(false);
                handleEditCamera(previewCamera);
              }}
            >
              设置
            </Button>
          ]}
          width={800}
        >
          {previewCamera && (
            <div>
              <div className="camera-stream" style={{ height: 400, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* 实际项目中应该显示摄像头视频流 */}
                <Empty description="摄像头视频流" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
              <div style={{ marginTop: 16 }}>
                <p><strong>位置:</strong> {previewCamera.location}</p>
                <p><strong>URL:</strong> {previewCamera.url}</p>
                <p><strong>状态:</strong> {previewCamera.status === 'active' ? '在线' : '离线'}</p>
                <p><strong>检测:</strong> {previewCamera.detection_enabled ? '已启用' : '已禁用'}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default Cameras; 
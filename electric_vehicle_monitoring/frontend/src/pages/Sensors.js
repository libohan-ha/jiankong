import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Row, Select, Slider, Spin, Statistic, Table, Tabs, Tag } from 'antd';
import { Chart, registerables } from 'chart.js';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

// 注册Chart.js组件
Chart.register(...registerables);

const { RangePicker } = DatePicker;
const { Option } = Select;

const Sensors = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [latestData, setLatestData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [timeRange, setTimeRange] = useState([moment().subtract(24, 'hours'), moment()]);
  const [thresholds, setThresholds] = useState({
    current: { min: 0, max: 20, warning: 15, critical: 18 },
    voltage: { min: 200, max: 240, warning: 230, critical: 235 },
    temperature: { min: -10, max: 60, warning: 45, critical: 55 },
    smoke: { min: 0, max: 1000, warning: 300, critical: 500 },
    humidity: { min: 0, max: 100, warning: 85, critical: 95 },
    power: { min: 0, max: 5000, warning: 3000, critical: 4500 }
  });
  const [editingThresholds, setEditingThresholds] = useState(false);
  const [tempThresholds, setTempThresholds] = useState({});

  // 获取传感器数据
  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      
      // 实际项目中应该从后端API获取
      // const latestResponse = await axios.get('/api/sensors/latest');
      // setLatestData(latestResponse.data);
      
      // 使用模拟数据
      setLatestData({
        current: {
          id: 1,
          sensor_type: 'current',
          value: 12.5,
          device_id: 'sensor_current_001',
          unit: 'A',
          timestamp: new Date().toISOString()
        },
        voltage: {
          id: 2,
          sensor_type: 'voltage',
          value: 220.5,
          device_id: 'sensor_voltage_001',
          unit: 'V',
          timestamp: new Date().toISOString()
        },
        temperature: {
          id: 3,
          sensor_type: 'temperature',
          value: 42.8,
          device_id: 'sensor_temperature_001',
          unit: '°C',
          timestamp: new Date().toISOString()
        },
        smoke: {
          id: 4,
          sensor_type: 'smoke',
          value: 120,
          device_id: 'sensor_smoke_001',
          unit: 'ppm',
          timestamp: new Date().toISOString()
        },
        humidity: {
          id: 5,
          sensor_type: 'humidity',
          value: 65.2,
          device_id: 'sensor_humidity_001',
          unit: '%',
          timestamp: new Date().toISOString()
        },
        power: {
          id: 6,
          sensor_type: 'power',
          value: 2750,
          device_id: 'sensor_power_001',
          unit: 'W',
          timestamp: new Date().toISOString()
        }
      });
      
      // 获取历史数据
      // 实际项目中应该从后端API获取
      // const historicalResponse = await axios.get('/api/sensors/data', {
      //   params: {
      //     start_time: timeRange[0].toISOString(),
      //     end_time: timeRange[1].toISOString()
      //   }
      // });
      // setHistoricalData(historicalResponse.data);
      
      // 使用模拟数据
      const generateHistoricalData = (sensorType, baseValue, unit) => {
        const now = new Date();
        const data = [];
        
        for (let i = 0; i < 24; i++) {
          const timestamp = new Date(now.getTime() - (23 - i) * 3600 * 1000);
          // 添加一些随机波动
          const randomFactor = 0.1; // 10%的随机波动
          const randomValue = baseValue * (1 + (Math.random() * 2 - 1) * randomFactor);
          
          data.push({
            id: i + 1,
            sensor_type: sensorType,
            value: parseFloat(randomValue.toFixed(2)),
            device_id: `sensor_${sensorType}_001`,
            unit: unit,
            timestamp: timestamp.toISOString()
          });
        }
        
        return data;
      };
      
      setHistoricalData({
        current: generateHistoricalData('current', 12.5, 'A'),
        voltage: generateHistoricalData('voltage', 220.5, 'V'),
        temperature: generateHistoricalData('temperature', 42.8, '°C'),
        smoke: generateHistoricalData('smoke', 120, 'ppm'),
        humidity: generateHistoricalData('humidity', 65.2, '%'),
        power: generateHistoricalData('power', 2750, 'W')
      });
      
      // 获取阈值设置
      // 实际项目中应该从后端API获取
      // const thresholdsResponse = await axios.get('/api/sensors/thresholds');
      // setThresholds(thresholdsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('获取传感器数据失败:', error);
      setLoading(false);
    }
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (dates) => {
    setTimeRange(dates);
    // 实际项目中应该重新获取历史数据
  };

  // 开始编辑阈值
  const handleEditThresholds = () => {
    setTempThresholds(JSON.parse(JSON.stringify(thresholds)));
    setEditingThresholds(true);
  };

  // 保存阈值设置
  const handleSaveThresholds = async () => {
    try {
      // 实际项目中应该调用后端API
      // await axios.put('/api/sensors/thresholds', tempThresholds);
      
      setThresholds(tempThresholds);
      setEditingThresholds(false);
    } catch (error) {
      console.error('保存阈值设置失败:', error);
    }
  };

  // 取消编辑阈值
  const handleCancelEditThresholds = () => {
    setEditingThresholds(false);
  };

  // 更新临时阈值
  const handleThresholdChange = (sensorType, thresholdType, value) => {
    setTempThresholds({
      ...tempThresholds,
      [sensorType]: {
        ...tempThresholds[sensorType],
        [thresholdType]: value
      }
    });
  };

  // 获取传感器值的状态
  const getSensorValueStatus = (sensorType, value) => {
    const threshold = thresholds[sensorType];
    
    if (value >= threshold.critical) {
      return 'critical';
    } else if (value >= threshold.warning) {
      return 'warning';
    } else {
      return 'normal';
    }
  };

  // 准备图表数据
  const prepareChartData = (sensorType) => {
    if (!historicalData[sensorType]) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    const data = historicalData[sensorType];
    const labels = data.map(item => moment(item.timestamp).format('HH:mm'));
    const values = data.map(item => item.value);
    
    // 添加阈值线
    const warningLine = Array(labels.length).fill(thresholds[sensorType].warning);
    const criticalLine = Array(labels.length).fill(thresholds[sensorType].critical);
    
    return {
      labels,
      datasets: [
        {
          label: `${sensorType} (${latestData[sensorType]?.unit || ''})`,
          data: values,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1
        },
        {
          label: '警告阈值',
          data: warningLine,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderDash: [5, 5],
          pointRadius: 0
        },
        {
          label: '临界阈值',
          data: criticalLine,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    };
  };

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
        text: `${activeTab} 传感器数据趋势`,
      },
    },
    scales: {
      y: {
        beginAtZero: activeTab !== 'voltage'
      }
    }
  };

  // 传感器数据表格列
  const sensorDataColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (text, record) => (
        <span>
          {text} {record.unit}
        </span>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const status = getSensorValueStatus(record.sensor_type, record.value);
        const statusMap = {
          normal: { color: 'success', text: '正常' },
          warning: { color: 'warning', text: '警告' },
          critical: { color: 'error', text: '危险' }
        };
        
        return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
      }
    },
    {
      title: '设备ID',
      dataIndex: 'device_id',
      key: 'device_id'
    }
  ];

  // 渲染传感器卡片
  const renderSensorCard = (sensorType, title) => {
    const sensorData = latestData[sensorType];
    
    if (!sensorData) {
      return (
        <Card title={title} className="sensor-card">
          <div>暂无数据</div>
        </Card>
      );
    }
    
    const status = getSensorValueStatus(sensorType, sensorData.value);
    
    return (
      <Card title={title} className="sensor-card">
        <Statistic
          value={sensorData.value}
          suffix={sensorData.unit}
          valueStyle={{ color: status === 'critical' ? '#cf1322' : (status === 'warning' ? '#faad14' : '#3f8600') }}
        />
        <div>
          <Tag color={status === 'critical' ? 'error' : (status === 'warning' ? 'warning' : 'success')}>
            {status === 'critical' ? '危险' : (status === 'warning' ? '警告' : '正常')}
          </Tag>
          <span style={{ marginLeft: 8 }}>
            更新时间: {moment(sensorData.timestamp).format('HH:mm:ss')}
          </span>
        </div>
      </Card>
    );
  };

  // 渲染阈值设置
  const renderThresholdSettings = () => {
    const sensorTypes = Object.keys(thresholds);
    
    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h3>阈值设置</h3>
          {editingThresholds ? (
            <div>
              <Button 
                type="primary" 
                onClick={handleSaveThresholds} 
                style={{ marginRight: 8 }}
              >
                保存
              </Button>
              <Button onClick={handleCancelEditThresholds}>
                取消
              </Button>
            </div>
          ) : (
            <Button 
              type="primary" 
              icon={<SettingOutlined />} 
              onClick={handleEditThresholds}
            >
              编辑阈值
            </Button>
          )}
        </div>
        
        <Tabs
          type="card"
          items={sensorTypes.map(sensorType => ({
            key: sensorType,
            label: sensorType.charAt(0).toUpperCase() + sensorType.slice(1),
            children: (
              <div>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8 }}>警告阈值</div>
                      {editingThresholds ? (
                        <Slider
                          min={tempThresholds[sensorType].min}
                          max={tempThresholds[sensorType].max}
                          value={tempThresholds[sensorType].warning}
                          onChange={(value) => handleThresholdChange(sensorType, 'warning', value)}
                        />
                      ) : (
                        <div>{thresholds[sensorType].warning} {latestData[sensorType]?.unit}</div>
                      )}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8 }}>临界阈值</div>
                      {editingThresholds ? (
                        <Slider
                          min={tempThresholds[sensorType].min}
                          max={tempThresholds[sensorType].max}
                          value={tempThresholds[sensorType].critical}
                          onChange={(value) => handleThresholdChange(sensorType, 'critical', value)}
                        />
                      ) : (
                        <div>{thresholds[sensorType].critical} {latestData[sensorType]?.unit}</div>
                      )}
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8 }}>最小值</div>
                      {editingThresholds ? (
                        <Slider
                          min={0}
                          max={tempThresholds[sensorType].max}
                          value={tempThresholds[sensorType].min}
                          onChange={(value) => handleThresholdChange(sensorType, 'min', value)}
                        />
                      ) : (
                        <div>{thresholds[sensorType].min} {latestData[sensorType]?.unit}</div>
                      )}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8 }}>最大值</div>
                      {editingThresholds ? (
                        <Slider
                          min={tempThresholds[sensorType].min}
                          max={tempThresholds[sensorType].max * 2}
                          value={tempThresholds[sensorType].max}
                          onChange={(value) => handleThresholdChange(sensorType, 'max', value)}
                        />
                      ) : (
                        <div>{thresholds[sensorType].max} {latestData[sensorType]?.unit}</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            )
          }))}
        />
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h2>传感器数据</h2>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={fetchSensorData}
          >
            刷新数据
          </Button>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            {renderSensorCard('current', '电流')}
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            {renderSensorCard('voltage', '电压')}
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            {renderSensorCard('temperature', '温度')}
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            {renderSensorCard('smoke', '烟雾')}
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            {renderSensorCard('humidity', '湿度')}
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            {renderSensorCard('power', '功率')}
          </Col>
        </Row>

        <Card style={{ marginBottom: 16 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>时间范围:</span>
                <RangePicker
                  showTime
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                />
              </div>
            }
            items={[
              {
                key: 'current',
                label: '电流',
                children: (
                  <div>
                    <div style={{ height: 300, marginBottom: 16 }}>
                      <Line options={chartOptions} data={prepareChartData('current')} />
                    </div>
                    <Table
                      columns={sensorDataColumns}
                      dataSource={historicalData.current || []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </div>
                )
              },
              {
                key: 'voltage',
                label: '电压',
                children: (
                  <div>
                    <div style={{ height: 300, marginBottom: 16 }}>
                      <Line options={chartOptions} data={prepareChartData('voltage')} />
                    </div>
                    <Table
                      columns={sensorDataColumns}
                      dataSource={historicalData.voltage || []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </div>
                )
              },
              {
                key: 'temperature',
                label: '温度',
                children: (
                  <div>
                    <div style={{ height: 300, marginBottom: 16 }}>
                      <Line options={chartOptions} data={prepareChartData('temperature')} />
                    </div>
                    <Table
                      columns={sensorDataColumns}
                      dataSource={historicalData.temperature || []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </div>
                )
              },
              {
                key: 'smoke',
                label: '烟雾',
                children: (
                  <div>
                    <div style={{ height: 300, marginBottom: 16 }}>
                      <Line options={chartOptions} data={prepareChartData('smoke')} />
                    </div>
                    <Table
                      columns={sensorDataColumns}
                      dataSource={historicalData.smoke || []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </div>
                )
              },
              {
                key: 'humidity',
                label: '湿度',
                children: (
                  <div>
                    <div style={{ height: 300, marginBottom: 16 }}>
                      <Line options={chartOptions} data={prepareChartData('humidity')} />
                    </div>
                    <Table
                      columns={sensorDataColumns}
                      dataSource={historicalData.humidity || []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </div>
                )
              },
              {
                key: 'power',
                label: '功率',
                children: (
                  <div>
                    <div style={{ height: 300, marginBottom: 16 }}>
                      <Line options={chartOptions} data={prepareChartData('power')} />
                    </div>
                    <Table
                      columns={sensorDataColumns}
                      dataSource={historicalData.power || []}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </div>
                )
              }
            ]}
          />
        </Card>

        <Card>
          {renderThresholdSettings()}
        </Card>
      </div>
    </Spin>
  );
};

export default Sensors; 
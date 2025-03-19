import os
import json
import logging
import threading
import time
from datetime import datetime
from app.models.sensor_data import SensorData, SensorType
from app import db
from app.services.alerts.alert_service import AlertService

class SensorManager:
    """传感器管理服务"""
    
    def __init__(self):
        self.logger = logging.getLogger("SensorManager")
        self.alert_service = AlertService()
        
        # 加载传感器阈值配置
        self.thresholds = self._load_thresholds()
        
        # 传感器读取线程
        self.sensor_threads = {}
        self.is_running = False
        
        # 启动传感器监控
        self.start_monitoring()
        
    def _load_thresholds(self):
        """加载传感器阈值配置"""
        # 默认阈值
        default_thresholds = {
            SensorType.CURRENT.value: {
                'min': 0, 
                'max': 20,  # 单位: A
                'warning': 15,
                'critical': 18
            },
            SensorType.VOLTAGE.value: {
                'min': 200, 
                'max': 240,  # 单位: V
                'warning': 230,
                'critical': 235
            },
            SensorType.TEMPERATURE.value: {
                'min': -10, 
                'max': 60,  # 单位: °C
                'warning': 45,
                'critical': 55
            },
            SensorType.SMOKE.value: {
                'min': 0, 
                'max': 1000,  # 相对值
                'warning': 300,
                'critical': 500
            },
            SensorType.HUMIDITY.value: {
                'min': 0, 
                'max': 100,  # 单位: %
                'warning': 85,
                'critical': 95
            },
            SensorType.POWER.value: {
                'min': 0, 
                'max': 5000,  # 单位: W
                'warning': 3000,
                'critical': 4500
            }
        }
        
        # 尝试从配置文件加载
        config_path = os.environ.get("SENSOR_CONFIG_PATH", "config/sensor_thresholds.json")
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    # 合并配置，保留默认值
                    for sensor_type, thresholds in config.items():
                        if sensor_type in default_thresholds:
                            default_thresholds[sensor_type].update(thresholds)
                    
                self.logger.info(f"从配置文件加载了传感器阈值: {config_path}")
        except Exception as e:
            self.logger.error(f"加载传感器阈值配置失败: {e}")
            
        return default_thresholds
        
    def get_thresholds(self):
        """获取当前阈值配置"""
        return self.thresholds
        
    def update_thresholds(self, new_thresholds):
        """更新阈值配置"""
        # 更新内存中的阈值
        for sensor_type, thresholds in new_thresholds.items():
            if sensor_type in self.thresholds:
                self.thresholds[sensor_type].update(thresholds)
            else:
                self.thresholds[sensor_type] = thresholds
                
        # 保存到配置文件
        config_path = os.environ.get("SENSOR_CONFIG_PATH", "config/sensor_thresholds.json")
        try:
            # 确保目录存在
            os.makedirs(os.path.dirname(config_path), exist_ok=True)
            
            with open(config_path, 'w') as f:
                json.dump(self.thresholds, f, indent=4)
                
            self.logger.info(f"已更新传感器阈值配置: {config_path}")
        except Exception as e:
            self.logger.error(f"保存传感器阈值配置失败: {e}")
            
        return self.thresholds
        
    def check_threshold(self, sensor_type, value):
        """检查传感器值是否超出阈值"""
        if sensor_type not in self.thresholds:
            return False, None
            
        thresholds = self.thresholds[sensor_type]
        
        # 检查是否超出临界阈值
        if value >= thresholds.get('critical', float('inf')):
            return True, 'critical'
            
        # 检查是否超出警告阈值
        if value >= thresholds.get('warning', float('inf')):
            return True, 'warning'
            
        # 检查是否低于最小值
        if value < thresholds.get('min', float('-inf')):
            return True, 'below_min'
            
        # 正常范围内
        return False, None
        
    def start_monitoring(self):
        """启动传感器监控"""
        if self.is_running:
            return
            
        self.is_running = True
        self.logger.info("启动传感器监控服务")
        
        # 启动传感器读取线程
        for sensor_type in SensorType:
            self._start_sensor_thread(sensor_type.value)
            
    def stop_monitoring(self):
        """停止传感器监控"""
        self.is_running = False
        self.logger.info("停止传感器监控服务")
        
    def _start_sensor_thread(self, sensor_type):
        """启动特定类型的传感器读取线程"""
        # 检查线程是否已经在运行
        if sensor_type in self.sensor_threads and self.sensor_threads[sensor_type].is_alive():
            return
            
        # 创建并启动新线程
        thread = threading.Thread(
            target=self._sensor_thread_func,
            args=(sensor_type,),
            daemon=True
        )
        self.sensor_threads[sensor_type] = thread
        thread.start()
        
    def _sensor_thread_func(self, sensor_type):
        """传感器读取线程函数"""
        while self.is_running:
            try:
                # 模拟读取传感器数据
                # 实际项目中，这里应该从真实传感器读取数据
                value = self._simulate_sensor_reading(sensor_type)
                
                # 创建传感器数据记录
                sensor_data = SensorData(
                    sensor_type=sensor_type,
                    value=value,
                    device_id=f"sim_{sensor_type}_001",  # 模拟设备ID
                    unit=self._get_sensor_unit(sensor_type),
                    timestamp=datetime.utcnow()
                )
                
                # 保存数据
                db.session.add(sensor_data)
                db.session.commit()
                
                # 检查是否需要触发警报
                self._check_alert(sensor_type, value, sensor_data.id)
                
                # 等待下一次读取
                time.sleep(self._get_sensor_interval(sensor_type))
                
            except Exception as e:
                self.logger.error(f"传感器读取线程出错 ({sensor_type}): {e}")
                time.sleep(5)  # 出错后暂停一段时间
                
    def _simulate_sensor_reading(self, sensor_type):
        """模拟传感器读数（实际项目中应替换为真实传感器读取）"""
        import random
        
        # 根据传感器类型生成合理的模拟值
        if sensor_type == SensorType.CURRENT.value:
            # 电流: 0-20A
            return round(random.uniform(0, 20), 2)
        elif sensor_type == SensorType.VOLTAGE.value:
            # 电压: 200-240V
            return round(random.uniform(200, 240), 1)
        elif sensor_type == SensorType.TEMPERATURE.value:
            # 温度: 10-60°C
            return round(random.uniform(10, 60), 1)
        elif sensor_type == SensorType.SMOKE.value:
            # 烟雾: 0-1000 (相对值)
            return round(random.uniform(0, 1000), 0)
        elif sensor_type == SensorType.HUMIDITY.value:
            # 湿度: 30-100%
            return round(random.uniform(30, 100), 1)
        elif sensor_type == SensorType.POWER.value:
            # 功率: 0-5000W
            return round(random.uniform(0, 5000), 1)
        else:
            return 0
            
    def _get_sensor_unit(self, sensor_type):
        """获取传感器单位"""
        units = {
            SensorType.CURRENT.value: 'A',
            SensorType.VOLTAGE.value: 'V',
            SensorType.TEMPERATURE.value: '°C',
            SensorType.SMOKE.value: 'ppm',
            SensorType.HUMIDITY.value: '%',
            SensorType.POWER.value: 'W',
            SensorType.INFRARED.value: 'IR'
        }
        return units.get(sensor_type, '')
        
    def _get_sensor_interval(self, sensor_type):
        """获取传感器读取间隔（秒）"""
        # 不同类型的传感器可能有不同的读取频率
        intervals = {
            SensorType.CURRENT.value: 1,
            SensorType.VOLTAGE.value: 1,
            SensorType.TEMPERATURE.value: 5,
            SensorType.SMOKE.value: 2,
            SensorType.HUMIDITY.value: 10,
            SensorType.POWER.value: 1,
            SensorType.INFRARED.value: 1
        }
        return intervals.get(sensor_type, 5)
        
    def _check_alert(self, sensor_type, value, sensor_data_id):
        """检查是否需要触发警报"""
        exceeded, level = self.check_threshold(sensor_type, value)
        
        if exceeded:
            # 构建警报信息
            alerts = {
                SensorType.CURRENT.value: {
                    'alert_type': 'OVERCURRENT',
                    'message': f"电流异常: {value}A",
                    'severity': 4 if level == 'critical' else 3
                },
                SensorType.VOLTAGE.value: {
                    'alert_type': 'SYSTEM_ERROR',
                    'message': f"电压异常: {value}V",
                    'severity': 4 if level == 'critical' else 3
                },
                SensorType.TEMPERATURE.value: {
                    'alert_type': 'OVERHEAT',
                    'message': f"温度过高: {value}°C",
                    'severity': 5 if level == 'critical' else 4
                },
                SensorType.SMOKE.value: {
                    'alert_type': 'SMOKE',
                    'message': f"检测到烟雾: {value}ppm",
                    'severity': 5 if level == 'critical' else 4
                }
            }
            
            # 获取当前传感器类型的警报信息
            alert_info = alerts.get(sensor_type)
            
            if alert_info:
                # 触发警报
                self.alert_service.create_alert(
                    alert_type=alert_info['alert_type'],
                    message=alert_info['message'],
                    source_type="sensor",
                    source_id=f"sensor_{sensor_type}",
                    details={
                        'sensor_type': sensor_type,
                        'value': value,
                        'level': level,
                        'threshold': self.thresholds.get(sensor_type),
                        'sensor_data_id': sensor_data_id
                    },
                    severity=alert_info['severity']
                )
                
                self.logger.warning(f"传感器警报 ({sensor_type}): {value} - {level}")
                
    def manual_read_sensor(self, sensor_type, device_id=None):
        """手动读取传感器数据"""
        # 实际项目中，这里应该从真实传感器读取数据
        value = self._simulate_sensor_reading(sensor_type)
        
        # 创建传感器数据记录
        sensor_data = SensorData(
            sensor_type=sensor_type,
            value=value,
            device_id=device_id or f"manual_{sensor_type}_001",
            unit=self._get_sensor_unit(sensor_type),
            timestamp=datetime.utcnow()
        )
        
        # 保存数据
        db.session.add(sensor_data)
        db.session.commit()
        
        # 检查是否需要触发警报
        self._check_alert(sensor_type, value, sensor_data.id)
        
        return value 
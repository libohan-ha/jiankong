from app import db
from datetime import datetime
from enum import Enum

class SensorType(Enum):
    CURRENT = "current"         # 电流
    VOLTAGE = "voltage"         # 电压
    TEMPERATURE = "temperature" # 温度
    SMOKE = "smoke"             # 烟雾
    HUMIDITY = "humidity"       # 湿度
    INFRARED = "infrared"       # 红外
    POWER = "power"             # 功率

class SensorData(db.Model):
    """传感器数据模型"""
    __tablename__ = 'sensor_data'
    
    id = db.Column(db.Integer, primary_key=True)
    sensor_type = db.Column(db.String(20), nullable=False)  # 传感器类型
    value = db.Column(db.Float, nullable=False)  # 数值
    device_id = db.Column(db.String(50), nullable=False)  # 设备ID
    location = db.Column(db.String(100))  # 位置信息
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # 时间戳
    
    # 可选的元数据字段
    unit = db.Column(db.String(10))  # 单位（如摄氏度、安培等）
    status = db.Column(db.String(20))  # 设备状态
    metadata = db.Column(db.JSON)  # 其他元数据
    
    def to_dict(self):
        """转换为字典表示"""
        return {
            'id': self.id,
            'sensor_type': self.sensor_type,
            'value': self.value,
            'device_id': self.device_id,
            'location': self.location,
            'timestamp': self.timestamp.isoformat(),
            'unit': self.unit,
            'status': self.status,
            'metadata': self.metadata
        }
    
    @classmethod
    def get_latest_by_type(cls, sensor_type, device_id=None):
        """获取指定类型的最新传感器数据"""
        query = cls.query.filter_by(sensor_type=sensor_type)
        
        if device_id:
            query = query.filter_by(device_id=device_id)
            
        return query.order_by(cls.timestamp.desc()).first()
    
    @classmethod
    def get_average_by_type(cls, sensor_type, device_id=None, hours=1):
        """获取指定类型的平均传感器数据"""
        from sqlalchemy import func
        import datetime as dt
        
        query = db.session.query(func.avg(cls.value)).filter_by(sensor_type=sensor_type)
        
        if device_id:
            query = query.filter_by(device_id=device_id)
            
        # 限制时间范围
        time_limit = datetime.utcnow() - dt.timedelta(hours=hours)
        query = query.filter(cls.timestamp >= time_limit)
        
        result = query.scalar()
        return result if result is not None else 0 
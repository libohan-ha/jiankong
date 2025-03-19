from app import db
from datetime import datetime

class Camera(db.Model):
    """摄像头模型"""
    __tablename__ = 'cameras'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # 摄像头名称
    url = db.Column(db.String(255), nullable=False)  # 摄像头URL
    location = db.Column(db.String(100))  # 位置信息
    status = db.Column(db.String(20), default='active')  # 状态
    
    # 摄像头配置
    resolution = db.Column(db.String(20), default='640x480')  # 分辨率
    fps = db.Column(db.Integer, default=20)  # 帧率
    detection_enabled = db.Column(db.Boolean, default=True)  # 是否启用检测
    
    # 检测配置
    detection_config = db.Column(db.JSON)  # 检测配置（JSON格式）
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """转换为字典表示"""
        return {
            'id': self.id,
            'name': self.name,
            'url': self.url,
            'location': self.location,
            'status': self.status,
            'resolution': self.resolution,
            'fps': self.fps,
            'detection_enabled': self.detection_enabled,
            'detection_config': self.detection_config,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class DetectionEvent(db.Model):
    """检测事件模型 - 记录检测到的异常情况"""
    __tablename__ = 'detection_events'
    
    id = db.Column(db.Integer, primary_key=True)
    camera_id = db.Column(db.Integer, db.ForeignKey('cameras.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  # 事件类型
    confidence = db.Column(db.Float, nullable=False)  # 置信度
    bbox = db.Column(db.JSON)  # 边界框坐标
    
    # 图像和视频
    image_path = db.Column(db.String(255))  # 事件图像路径
    video_clip_path = db.Column(db.String(255))  # 事件视频片段路径
    
    # 时间相关
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联的报警ID（如果有）
    alert_id = db.Column(db.Integer, db.ForeignKey('alerts.id'))
    
    # 元数据
    metadata = db.Column(db.JSON)  # 其他元数据
    
    def to_dict(self):
        """转换为字典表示"""
        return {
            'id': self.id,
            'camera_id': self.camera_id,
            'event_type': self.event_type,
            'confidence': self.confidence,
            'bbox': self.bbox,
            'image_path': self.image_path,
            'video_clip_path': self.video_clip_path,
            'timestamp': self.timestamp.isoformat(),
            'alert_id': self.alert_id,
            'metadata': self.metadata
        } 
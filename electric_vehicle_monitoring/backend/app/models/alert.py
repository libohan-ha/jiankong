from app import db
from datetime import datetime
from enum import Enum

class AlertType(Enum):
    FIRE = "fire"                     # 火灾
    OVERHEAT = "overheat"             # 过热
    OVERCURRENT = "overcurrent"       # 过流
    SMOKE = "smoke"                   # 烟雾
    UNAUTHORIZED = "unauthorized"     # 未授权充电
    ABNORMAL_BEHAVIOR = "abnormal"    # 异常行为
    CONNECTION_ISSUE = "connection"   # 连接问题
    SYSTEM_ERROR = "system_error"     # 系统错误

class AlertStatus(Enum):
    NEW = "new"                 # 新报警
    ACKNOWLEDGED = "ack"        # 已确认
    IN_PROGRESS = "progress"    # 处理中
    RESOLVED = "resolved"       # 已解决
    FALSE_ALARM = "false"       # 误报

class Alert(db.Model):
    """报警信息模型"""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(50), nullable=False)  # 报警类型
    status = db.Column(db.String(20), default=AlertStatus.NEW.value)  # 报警状态
    message = db.Column(db.String(255), nullable=False)  # 报警消息
    
    # 报警来源信息
    source_type = db.Column(db.String(20), nullable=False)  # 来源类型 (camera, sensor, system)
    source_id = db.Column(db.String(50), nullable=False)  # 来源ID
    location = db.Column(db.String(100))  # 位置信息
    
    # 报警详情
    details = db.Column(db.JSON)  # 详细信息（JSON格式）
    severity = db.Column(db.Integer, default=3)  # 严重程度 (1-5, 5最严重)
    image_url = db.Column(db.String(255))  # 相关图像URL
    
    # 处理信息
    handled_by = db.Column(db.String(50))  # 处理人
    handler_notes = db.Column(db.Text)  # 处理备注
    resolved_at = db.Column(db.DateTime)  # 解决时间
    
    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """转换为字典表示"""
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'status': self.status,
            'message': self.message,
            'source_type': self.source_type,
            'source_id': self.source_id,
            'location': self.location,
            'details': self.details,
            'severity': self.severity,
            'image_url': self.image_url,
            'handled_by': self.handled_by,
            'handler_notes': self.handler_notes,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 
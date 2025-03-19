import logging
import os
import json
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from app.models.alert import Alert, AlertType, AlertStatus
from app import db

class AlertService:
    """警报服务，用于创建和发送警报"""
    
    def __init__(self):
        self.logger = logging.getLogger("AlertService")
        
        # 加载通知配置
        self.notification_config = self._load_notification_config()
        
    def _load_notification_config(self):
        """加载通知配置"""
        # 默认配置
        default_config = {
            'email': {
                'enabled': False,
                'smtp_server': 'smtp.example.com',
                'smtp_port': 587,
                'username': 'alert@example.com',
                'password': '',
                'recipients': []
            },
            'sms': {
                'enabled': False,
                'api_key': '',
                'api_url': 'https://api.sms.example.com/send',
                'recipients': []
            },
            'webhook': {
                'enabled': False,
                'url': 'https://webhook.example.com/alert',
                'headers': {'Content-Type': 'application/json'}
            },
            'push': {
                'enabled': False,
                'api_key': '',
                'app_id': ''
            }
        }
        
        # 尝试从配置文件加载
        config_path = os.environ.get("NOTIFICATION_CONFIG_PATH", "config/notification.json")
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    # 合并配置，保留默认值
                    for key, value in config.items():
                        if key in default_config:
                            default_config[key].update(value)
                
                self.logger.info(f"从配置文件加载了通知配置: {config_path}")
        except Exception as e:
            self.logger.error(f"加载通知配置失败: {e}")
            
        return default_config
        
    def create_alert(self, alert_type, message, source_type, source_id, details=None, location=None, image_url=None, severity=3):
        """创建新警报"""
        try:
            # 检查AlertType
            try:
                if isinstance(alert_type, str):
                    # 尝试将字符串转换为AlertType
                    alert_type = AlertType[alert_type].value
                elif isinstance(alert_type, AlertType):
                    alert_type = alert_type.value
            except (KeyError, ValueError):
                # 如果不是有效的AlertType，直接使用字符串
                pass
                
            # 创建警报记录
            alert = Alert(
                alert_type=alert_type,
                status=AlertStatus.NEW.value,
                message=message,
                source_type=source_type,
                source_id=source_id,
                location=location,
                details=details,
                severity=severity,
                image_url=image_url,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.session.add(alert)
            db.session.commit()
            
            self.logger.info(f"创建警报: {alert_type} - {message} (ID: {alert.id})")
            
            # 发送通知
            self._send_notifications(alert)
            
            return alert.id
            
        except Exception as e:
            self.logger.error(f"创建警报失败: {e}")
            db.session.rollback()
            return None
    
    def update_alert_status(self, alert_id, status, handled_by=None, handler_notes=None):
        """更新警报状态"""
        try:
            alert = Alert.query.get(alert_id)
            if not alert:
                self.logger.warning(f"更新警报状态失败: 警报不存在 (ID: {alert_id})")
                return False
                
            # 检查状态
            try:
                if isinstance(status, str):
                    # 尝试将字符串转换为AlertStatus
                    status = AlertStatus[status].value
                elif isinstance(status, AlertStatus):
                    status = status.value
            except (KeyError, ValueError):
                # 如果不是有效的AlertStatus，直接使用字符串
                pass
                
            # 更新状态
            alert.status = status
            
            # 更新处理信息
            if handled_by:
                alert.handled_by = handled_by
            if handler_notes:
                alert.handler_notes = handler_notes
                
            # 如果状态是已解决，更新解决时间
            if status == AlertStatus.RESOLVED.value:
                alert.resolved_at = datetime.utcnow()
                
            alert.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            self.logger.info(f"更新警报状态: {alert_id} -> {status}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"更新警报状态失败: {e}")
            db.session.rollback()
            return False
    
    def get_active_alerts(self):
        """获取所有活跃警报"""
        return Alert.query.filter(
            Alert.status.in_([
                AlertStatus.NEW.value, 
                AlertStatus.ACKNOWLEDGED.value,
                AlertStatus.IN_PROGRESS.value
            ])
        ).order_by(Alert.created_at.desc()).all()
    
    def get_alerts_by_type(self, alert_type):
        """获取特定类型的警报"""
        return Alert.query.filter_by(alert_type=alert_type).order_by(Alert.created_at.desc()).all()
    
    def get_alerts_by_source(self, source_type, source_id=None):
        """获取特定来源的警报"""
        query = Alert.query.filter_by(source_type=source_type)
        if source_id:
            query = query.filter_by(source_id=source_id)
        return query.order_by(Alert.created_at.desc()).all()
    
    def _send_notifications(self, alert):
        """发送警报通知"""
        # 根据警报严重程度决定通知方式
        severity = alert.severity
        
        # 发送邮件通知
        if severity >= 3 and self.notification_config['email']['enabled']:
            self._send_email_notification(alert)
            
        # 发送短信通知
        if severity >= 4 and self.notification_config['sms']['enabled']:
            self._send_sms_notification(alert)
            
        # 发送Webhook通知
        if self.notification_config['webhook']['enabled']:
            self._send_webhook_notification(alert)
            
        # 发送推送通知
        if severity >= 3 and self.notification_config['push']['enabled']:
            self._send_push_notification(alert)
    
    def _send_email_notification(self, alert):
        """发送邮件通知"""
        try:
            config = self.notification_config['email']
            recipients = config['recipients']
            
            if not recipients:
                self.logger.warning("无法发送邮件通知: 没有收件人")
                return
                
            # 创建邮件
            msg = MIMEMultipart()
            msg['From'] = config['username']
            msg['To'] = ", ".join(recipients)
            msg['Subject'] = f"[警报] {alert.alert_type}: {alert.message}"
            
            # 邮件内容
            body = f"""
            <html>
            <body>
                <h2>电动车充电安全监控系统警报</h2>
                <p><strong>警报类型:</strong> {alert.alert_type}</p>
                <p><strong>警报消息:</strong> {alert.message}</p>
                <p><strong>时间:</strong> {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p><strong>来源:</strong> {alert.source_type} ({alert.source_id})</p>
                <p><strong>位置:</strong> {alert.location or '未知'}</p>
                <p><strong>严重程度:</strong> {alert.severity}/5</p>
                <p><strong>状态:</strong> {alert.status}</p>
                <p>请尽快登录系统查看详情并处理。</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # 连接SMTP服务器并发送
            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            server.starttls()
            server.login(config['username'], config['password'])
            server.send_message(msg)
            server.quit()
            
            self.logger.info(f"已发送邮件通知: {', '.join(recipients)}")
            
        except Exception as e:
            self.logger.error(f"发送邮件通知失败: {e}")
    
    def _send_sms_notification(self, alert):
        """发送短信通知"""
        try:
            config = self.notification_config['sms']
            recipients = config['recipients']
            
            if not recipients:
                self.logger.warning("无法发送短信通知: 没有收件人")
                return
                
            # 短信内容
            message = f"警报: {alert.alert_type} - {alert.message} (严重程度: {alert.severity}/5)"
            
            # 调用SMS API
            for recipient in recipients:
                data = {
                    'api_key': config['api_key'],
                    'to': recipient,
                    'message': message
                }
                
                response = requests.post(config['api_url'], json=data)
                if response.status_code == 200:
                    self.logger.info(f"已发送短信通知: {recipient}")
                else:
                    self.logger.warning(f"发送短信通知失败: {recipient}, 状态码: {response.status_code}")
                    
        except Exception as e:
            self.logger.error(f"发送短信通知失败: {e}")
    
    def _send_webhook_notification(self, alert):
        """发送Webhook通知"""
        try:
            config = self.notification_config['webhook']
            
            # 准备数据
            data = {
                'id': alert.id,
                'alert_type': alert.alert_type,
                'message': alert.message,
                'source_type': alert.source_type,
                'source_id': alert.source_id,
                'location': alert.location,
                'severity': alert.severity,
                'status': alert.status,
                'created_at': alert.created_at.isoformat(),
                'details': alert.details
            }
            
            # 发送请求
            response = requests.post(
                config['url'], 
                json=data,
                headers=config['headers']
            )
            
            if response.status_code in [200, 201, 202]:
                self.logger.info(f"已发送Webhook通知: {config['url']}")
            else:
                self.logger.warning(f"发送Webhook通知失败: 状态码: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"发送Webhook通知失败: {e}")
    
    def _send_push_notification(self, alert):
        """发送推送通知"""
        # 这里可以集成第三方推送服务，如Firebase、极光推送等
        # 具体实现根据选用的推送服务而定
        self.logger.info(f"推送通知功能待实现") 
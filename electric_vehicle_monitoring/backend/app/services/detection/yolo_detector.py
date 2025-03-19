import cv2
import numpy as np
import os
import time
import logging
from pathlib import Path
from ultralytics import YOLO
from app.services.alerts.alert_service import AlertService
from datetime import datetime

class YoloDetector:
    """YOLO目标检测服务"""
    
    def __init__(self):
        # 配置日志
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("YoloDetector")
        
        # 设置模型路径
        model_path = os.environ.get("YOLO_MODEL_PATH", "models/yolov8n.pt")
        self.logger.info(f"Loading YOLO model from {model_path}")
        
        # 初始化用于电动车充电安全检测的YOLO模型
        try:
            self.model = YOLO(model_path)
            self.logger.info("YOLO model loaded successfully")
        except Exception as e:
            self.logger.error(f"Failed to load YOLO model: {e}")
            # 使用默认的YOLO模型，如果自定义模型加载失败
            self.model = YOLO("yolov8n.pt")
        
        # 事件处理服务
        self.alert_service = AlertService()
        
        # 设置检测阈值
        self.conf_threshold = float(os.environ.get("DETECTION_CONF_THRESHOLD", 0.5))
        
        # 设置保存检测结果的路径
        self.save_dir = os.environ.get("DETECTION_SAVE_DIR", "detection_results")
        os.makedirs(self.save_dir, exist_ok=True)
        
        # 监控的类别（根据使用的模型调整）
        self.target_classes = {
            'person': 0,        # 人
            'bicycle': 1,       # 自行车（可能是电动车）
            'motorcycle': 3,    # 摩托车（可能是电动车）
            'fire': 80,         # 火焰（可能需要自定义模型）
            'smoke': 81,        # 烟雾（可能需要自定义模型）
        }
        
        # 上次检测到异常的时间，用于控制触发频率
        self.last_alert_time = {}

    def detect_objects(self, frame):
        """
        对图像帧进行目标检测
        
        Args:
            frame: 输入的图像帧
            
        Returns:
            处理后的图像帧
        """
        if frame is None:
            return None
            
        # 进行检测
        try:
            results = self.model(frame, conf=self.conf_threshold)
            
            # 获取检测结果
            result = results[0]
            
            # 处理检测到的目标
            self._process_detections(frame, result)
            
            # 获取带有检测框的图像
            annotated_frame = result.plot()
            
            return annotated_frame
            
        except Exception as e:
            self.logger.error(f"Error during object detection: {e}")
            return frame
    
    def _process_detections(self, frame, result):
        """处理检测结果，查找异常情况"""
        timestamp = datetime.now()
        
        # 获取检测到的边界框、置信度和类别
        boxes = result.boxes.cpu().numpy()
        
        # 检测异常情况
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = box.conf[0]
            
            # 获取检测到的类别名称
            cls_name = result.names[cls_id]
            
            # 检查是否有异常情况
            if cls_name == 'fire' or cls_name == 'smoke':
                alert_type = 'FIRE' if cls_name == 'fire' else 'SMOKE'
                
                # 控制触发频率，避免同一事件重复触发
                current_time = time.time()
                if cls_name in self.last_alert_time and current_time - self.last_alert_time[cls_name] < 30:
                    continue
                
                self.last_alert_time[cls_name] = current_time
                
                # 保存检测到的图像
                img_filename = f"{cls_name}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
                img_path = os.path.join(self.save_dir, img_filename)
                cv2.imwrite(img_path, frame)
                
                # 触发警报
                bbox = box.xyxy[0].tolist()  # 边界框坐标
                self._trigger_alert(alert_type, conf, cls_name, img_path, bbox)
                
    def _trigger_alert(self, alert_type, confidence, detected_class, image_path, bbox):
        """触发警报"""
        try:
            # 准备警报详情
            details = {
                'detected_class': detected_class,
                'confidence': float(confidence),
                'bbox': bbox,
                'image_path': image_path
            }
            
            # 通过警报服务触发警报
            self.alert_service.create_alert(
                alert_type=alert_type,
                message=f"检测到{detected_class}，置信度：{confidence:.2f}",
                source_type="camera",
                source_id="camera_1",  # 可以改为实际的摄像头ID
                details=details,
                image_url=image_path,
                severity=5 if alert_type == 'FIRE' else 4
            )
            
            self.logger.info(f"Alert triggered: {alert_type} - {detected_class}")
            
        except Exception as e:
            self.logger.error(f"Error triggering alert: {e}")

    def detect_fire(self, frame):
        """专门检测火灾的方法"""
        return self.detect_objects(frame)
        
    def detect_unauthorized_charging(self, frame):
        """检测未授权充电行为"""
        # 这里可以实现更复杂的逻辑来检测未授权充电行为
        # 例如，检测人员在非指定区域的电动车旁充电
        return self.detect_objects(frame) 
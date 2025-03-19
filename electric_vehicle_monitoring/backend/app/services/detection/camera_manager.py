import cv2
import os
import logging
import threading
import uuid
import time
from app.models.camera import Camera
from app import db

class CameraStream:
    """摄像头视频流类"""
    
    def __init__(self, camera_id, url):
        self.camera_id = camera_id
        self.url = url
        self.stream = None
        self.is_running = False
        self.lock = threading.Lock()
        self.last_frame = None
        self.logger = logging.getLogger(f"CameraStream-{camera_id}")
        
    def start(self):
        """启动摄像头流"""
        if self.is_running:
            return True
            
        try:
            self.stream = cv2.VideoCapture(self.url)
            if not self.stream.isOpened():
                self.logger.error(f"无法打开摄像头流: {self.url}")
                return False
                
            self.is_running = True
            # 启动后台线程来捕获帧
            threading.Thread(target=self._update_frame, daemon=True).start()
            self.logger.info(f"成功启动摄像头流: {self.url}")
            return True
            
        except Exception as e:
            self.logger.error(f"启动摄像头流时出错: {e}")
            return False
    
    def stop(self):
        """停止摄像头流"""
        self.is_running = False
        if self.stream:
            self.stream.release()
            self.stream = None
            self.last_frame = None
            self.logger.info(f"已停止摄像头流: {self.url}")
    
    def read(self):
        """读取当前帧"""
        with self.lock:
            if self.last_frame is None:
                return False, None
            return True, self.last_frame.copy()
    
    def _update_frame(self):
        """持续更新帧的后台线程"""
        while self.is_running:
            try:
                if self.stream and self.stream.isOpened():
                    ret, frame = self.stream.read()
                    if ret:
                        with self.lock:
                            self.last_frame = frame
                    else:
                        self.logger.warning(f"无法从摄像头读取帧: {self.url}")
                        # 尝试重新连接
                        self.stream.release()
                        time.sleep(2)
                        self.stream = cv2.VideoCapture(self.url)
                time.sleep(0.01)  # 避免CPU占用过高
            except Exception as e:
                self.logger.error(f"更新帧时出错: {e}")
                time.sleep(1)  # 错误后暂停一段时间再尝试


class CameraManager:
    """摄像头管理服务"""
    
    def __init__(self):
        self.cameras = {}  # 摄像头流缓存: {camera_id: CameraStream}
        self.logger = logging.getLogger("CameraManager")
        # 初始化配置
        self._load_cameras_from_db()
        
    def _load_cameras_from_db(self):
        """从数据库加载摄像头配置"""
        try:
            cameras = Camera.query.filter_by(status='active').all()
            for camera in cameras:
                self._init_camera_stream(camera.id, camera.url)
            self.logger.info(f"已从数据库加载 {len(cameras)} 个摄像头配置")
        except Exception as e:
            self.logger.error(f"从数据库加载摄像头配置时出错: {e}")
            
    def _init_camera_stream(self, camera_id, url):
        """初始化摄像头流"""
        if camera_id not in self.cameras:
            camera_stream = CameraStream(camera_id, url)
            self.cameras[camera_id] = camera_stream
            camera_stream.start()
            
    def get_all_cameras(self):
        """获取所有摄像头信息"""
        try:
            cameras = Camera.query.all()
            return [camera.to_dict() for camera in cameras]
        except Exception as e:
            self.logger.error(f"获取所有摄像头信息时出错: {e}")
            return []
            
    def get_camera(self, camera_id):
        """获取特定摄像头信息"""
        try:
            camera = Camera.query.get(camera_id)
            if camera:
                return camera.to_dict()
            return None
        except Exception as e:
            self.logger.error(f"获取摄像头信息时出错: {e}")
            return None
            
    def get_stream(self, camera_id):
        """获取摄像头视频流对象"""
        # 确保是整数ID
        try:
            camera_id = int(camera_id)
        except ValueError:
            self.logger.error(f"无效的摄像头ID: {camera_id}")
            return None
            
        # 检查是否已有流对象
        if camera_id in self.cameras:
            camera_stream = self.cameras[camera_id]
            if not camera_stream.is_running:
                camera_stream.start()
            return camera_stream
            
        # 没有找到，尝试从数据库加载
        try:
            camera = Camera.query.get(camera_id)
            if camera:
                self._init_camera_stream(camera.id, camera.url)
                return self.cameras.get(camera.id)
        except Exception as e:
            self.logger.error(f"获取摄像头流时出错: {e}")
            
        return None
        
    def get_snapshot(self, camera_id):
        """获取摄像头当前快照"""
        stream = self.get_stream(camera_id)
        if stream:
            ret, frame = stream.read()
            if ret:
                return frame
        return None
        
    def add_camera(self, name, url, location=None):
        """添加新摄像头"""
        try:
            camera = Camera(name=name, url=url, location=location)
            db.session.add(camera)
            db.session.commit()
            
            # 初始化摄像头流
            self._init_camera_stream(camera.id, url)
            
            return camera.id
        except Exception as e:
            self.logger.error(f"添加摄像头时出错: {e}")
            db.session.rollback()
            return None
            
    def update_camera(self, camera_id, data):
        """更新摄像头信息"""
        try:
            camera = Camera.query.get(camera_id)
            if not camera:
                return False
                
            # 更新字段
            if 'name' in data:
                camera.name = data['name']
            if 'url' in data:
                camera.url = data['url']
                # 如果URL变化，更新流
                if camera_id in self.cameras:
                    self.cameras[camera_id].stop()
                    del self.cameras[camera_id]
                self._init_camera_stream(camera_id, data['url'])
            if 'location' in data:
                camera.location = data['location']
            if 'status' in data:
                camera.status = data['status']
                if data['status'] != 'active' and camera_id in self.cameras:
                    self.cameras[camera_id].stop()
            if 'detection_enabled' in data:
                camera.detection_enabled = data['detection_enabled']
            if 'detection_config' in data:
                camera.detection_config = data['detection_config']
                
            db.session.commit()
            return True
        except Exception as e:
            self.logger.error(f"更新摄像头信息时出错: {e}")
            db.session.rollback()
            return False
            
    def delete_camera(self, camera_id):
        """删除摄像头"""
        try:
            camera = Camera.query.get(camera_id)
            if not camera:
                return False
                
            # 停止并移除流
            if camera_id in self.cameras:
                self.cameras[camera_id].stop()
                del self.cameras[camera_id]
                
            db.session.delete(camera)
            db.session.commit()
            return True
        except Exception as e:
            self.logger.error(f"删除摄像头时出错: {e}")
            db.session.rollback()
            return False 
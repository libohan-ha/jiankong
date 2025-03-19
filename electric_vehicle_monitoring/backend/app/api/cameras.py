from flask import jsonify, request, Response, stream_with_context
from app.api import api_bp
from app.services.detection.camera_manager import CameraManager
from app.services.detection.yolo_detector import YoloDetector
import cv2
import numpy as np
import time

camera_manager = CameraManager()
yolo_detector = YoloDetector()

@api_bp.route('/cameras', methods=['GET'])
def get_cameras():
    """获取所有摄像头列表"""
    cameras = camera_manager.get_all_cameras()
    return jsonify(cameras)

@api_bp.route('/cameras/<camera_id>', methods=['GET'])
def get_camera(camera_id):
    """获取特定摄像头的信息"""
    camera = camera_manager.get_camera(camera_id)
    if not camera:
        return jsonify({'error': '摄像头不存在'}), 404
    return jsonify(camera)

@api_bp.route('/cameras/<camera_id>/stream', methods=['GET'])
def stream_camera(camera_id):
    """获取摄像头视频流"""
    def generate():
        camera = camera_manager.get_stream(camera_id)
        if not camera:
            yield b'--frame\r\nContent-Type: text/plain\r\n\r\n' + '摄像头不可用'.encode('utf-8') + b'\r\n'
            return
        
        while True:
            success, frame = camera.read()
            if not success:
                break
                
            # 进行目标检测（可选，根据查询参数决定）
            detect = request.args.get('detect', 'false').lower() == 'true'
            if detect:
                frame = yolo_detector.detect_objects(frame)
                
            # 编码为JPEG
            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
            frame_bytes = buffer.tobytes()
            
            # 发送帧
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # 控制帧率
            time.sleep(0.05)  # 大约20fps
    
    return Response(
        stream_with_context(generate()),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@api_bp.route('/cameras/<camera_id>/snapshot', methods=['GET'])
def get_camera_snapshot(camera_id):
    """获取摄像头的当前快照"""
    frame = camera_manager.get_snapshot(camera_id)
    if frame is None:
        return jsonify({'error': '无法获取摄像头快照'}), 404
    
    # 进行目标检测（可选，根据查询参数决定）
    detect = request.args.get('detect', 'false').lower() == 'true'
    if detect:
        frame = yolo_detector.detect_objects(frame)
    
    # 编码为JPEG
    ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    snapshot_bytes = buffer.tobytes()
    
    return Response(snapshot_bytes, mimetype='image/jpeg')

@api_bp.route('/cameras', methods=['POST'])
def add_camera():
    """添加新摄像头"""
    data = request.get_json()
    
    name = data.get('name')
    url = data.get('url')
    location = data.get('location')
    
    if not all([name, url]):
        return jsonify({'error': '缺少必要参数'}), 400
    
    camera_id = camera_manager.add_camera(name, url, location)
    
    return jsonify({
        'id': camera_id,
        'name': name,
        'url': url,
        'location': location
    }), 201

@api_bp.route('/cameras/<camera_id>', methods=['PUT'])
def update_camera(camera_id):
    """更新摄像头信息"""
    data = request.get_json()
    
    success = camera_manager.update_camera(camera_id, data)
    if not success:
        return jsonify({'error': '摄像头不存在'}), 404
    
    return jsonify({'message': '摄像头信息已更新'})

@api_bp.route('/cameras/<camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    """删除摄像头"""
    success = camera_manager.delete_camera(camera_id)
    if not success:
        return jsonify({'error': '摄像头不存在'}), 404
    
    return jsonify({'message': '摄像头已删除'}) 
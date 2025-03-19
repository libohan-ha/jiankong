from flask import jsonify, request
from app.api import api_bp
from app.models.sensor_data import SensorData, SensorType
from app.services.sensors.sensor_manager import SensorManager
from app.services.alerts.alert_service import AlertService
from app import db
from datetime import datetime, timedelta

sensor_manager = SensorManager()
alert_service = AlertService()

@api_bp.route('/sensors/data', methods=['GET'])
def get_sensor_data():
    """获取传感器数据，支持时间范围和传感器类型过滤"""
    sensor_type = request.args.get('type')
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    limit = request.args.get('limit', 100, type=int)
    
    query = SensorData.query
    
    if sensor_type:
        query = query.filter_by(sensor_type=sensor_type)
    
    if start_time:
        start_time = datetime.fromisoformat(start_time)
        query = query.filter(SensorData.timestamp >= start_time)
    else:
        # 默认获取最近24小时的数据
        start_time = datetime.utcnow() - timedelta(hours=24)
        query = query.filter(SensorData.timestamp >= start_time)
        
    if end_time:
        end_time = datetime.fromisoformat(end_time)
        query = query.filter(SensorData.timestamp <= end_time)
    
    records = query.order_by(SensorData.timestamp.desc()).limit(limit).all()
    result = [record.to_dict() for record in records]
    
    return jsonify(result)

@api_bp.route('/sensors/latest', methods=['GET'])
def get_latest_sensor_data():
    """获取最新的传感器数据"""
    latest_data = {}
    
    for sensor_type in SensorType:
        latest = SensorData.query.filter_by(
            sensor_type=sensor_type.value
        ).order_by(SensorData.timestamp.desc()).first()
        
        if latest:
            latest_data[sensor_type.value] = latest.to_dict()
    
    return jsonify(latest_data)

@api_bp.route('/sensors/readings', methods=['POST'])
def record_sensor_reading():
    """记录传感器读数"""
    data = request.get_json()
    
    sensor_type = data.get('sensor_type')
    value = data.get('value')
    device_id = data.get('device_id')
    location = data.get('location')
    
    if not all([sensor_type, value is not None, device_id]):
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 检查传感器类型是否有效
    try:
        sensor_type_enum = SensorType(sensor_type)
    except ValueError:
        return jsonify({'error': '无效的传感器类型'}), 400
    
    # 创建传感器数据记录
    sensor_data = SensorData(
        sensor_type=sensor_type,
        value=value,
        device_id=device_id,
        location=location,
        timestamp=datetime.utcnow()
    )
    
    db.session.add(sensor_data)
    db.session.commit()
    
    # 检查是否需要触发警报
    alert_service.check_sensor_alert(sensor_data)
    
    return jsonify(sensor_data.to_dict()), 201

@api_bp.route('/sensors/thresholds', methods=['GET'])
def get_sensor_thresholds():
    """获取传感器阈值设置"""
    thresholds = sensor_manager.get_thresholds()
    return jsonify(thresholds)

@api_bp.route('/sensors/thresholds', methods=['PUT'])
def update_sensor_thresholds():
    """更新传感器阈值设置"""
    data = request.get_json()
    sensor_manager.update_thresholds(data)
    return jsonify({'message': '阈值设置已更新'}) 
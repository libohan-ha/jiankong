from flask import jsonify, request
from app.api import api_bp
from app.models.alert import Alert
from app import db
from datetime import datetime

@api_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """获取所有报警信息"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # 支持过滤条件
    status = request.args.get('status')
    alert_type = request.args.get('type')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Alert.query
    
    if status:
        query = query.filter_by(status=status)
    if alert_type:
        query = query.filter_by(alert_type=alert_type)
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        query = query.filter(Alert.created_at >= start_date)
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
        query = query.filter(Alert.created_at <= end_date)
    
    pagination = query.order_by(Alert.created_at.desc()).paginate(
        page=page, per_page=per_page
    )
    
    alerts = []
    for alert in pagination.items:
        alerts.append(alert.to_dict())
    
    return jsonify({
        'items': alerts,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    })

@api_bp.route('/alerts/<int:alert_id>', methods=['GET'])
def get_alert(alert_id):
    """获取单个报警详情"""
    alert = Alert.query.get_or_404(alert_id)
    return jsonify(alert.to_dict())

@api_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
def update_alert(alert_id):
    """更新报警状态"""
    alert = Alert.query.get_or_404(alert_id)
    data = request.get_json()
    
    if 'status' in data:
        alert.status = data['status']
    if 'handled_by' in data:
        alert.handled_by = data['handled_by']
    if 'handler_notes' in data:
        alert.handler_notes = data['handler_notes']
    
    alert.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(alert.to_dict())

@api_bp.route('/alerts/stats', methods=['GET'])
def get_alert_stats():
    """获取报警统计信息"""
    # 按类型统计
    type_stats = db.session.query(
        Alert.alert_type, db.func.count(Alert.id)
    ).group_by(Alert.alert_type).all()
    
    # 按状态统计
    status_stats = db.session.query(
        Alert.status, db.func.count(Alert.id)
    ).group_by(Alert.status).all()
    
    # 按日期统计近7天
    date_stats = db.session.query(
        db.func.date(Alert.created_at), db.func.count(Alert.id)
    ).group_by(db.func.date(Alert.created_at))\
        .order_by(db.func.date(Alert.created_at).desc())\
        .limit(7).all()
    
    return jsonify({
        'by_type': {t[0]: t[1] for t in type_stats},
        'by_status': {s[0]: s[1] for s in status_stats},
        'by_date': {str(d[0]): d[1] for d in date_stats}
    }) 
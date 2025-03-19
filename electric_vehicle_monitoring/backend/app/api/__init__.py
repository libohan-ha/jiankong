from flask import Blueprint

api_bp = Blueprint('api', __name__)

# 导入各个API路由
from app.api import alerts, sensors, cameras, dashboard, auth 
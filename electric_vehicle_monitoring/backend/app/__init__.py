from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 初始化数据库
db = SQLAlchemy()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # 允许跨域请求
    CORS(app)
    
    # 配置数据库
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URI', 'sqlite:///ev_monitoring.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化数据库
    db.init_app(app)
    
    # 注册蓝图
    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
        
    return app 
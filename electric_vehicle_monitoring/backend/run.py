from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # 获取端口，默认为5000
    port = int(os.environ.get('PORT', 5000))
    
    # 启动应用
    app.run(host='0.0.0.0', port=port, debug=True) 
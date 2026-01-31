"""
VisiSec Backend - Multimodal Meeting Analysis API
使用 Flask + Silicon Flow DeepSeek LLM
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from typing import Dict, Any, List
import logging
import os
import httpx
import json
import asyncio
from functools import wraps
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid
import jwt
import bcrypt as bcrypt_lib

# Load environment variables
load_dotenv()

# Configure comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('visisec_backend.log')
    ]
)
logger = logging.getLogger(__name__)

# Log configuration loading
logger.info("="*80)
logger.info("VisiSec Backend Starting...")
logger.info("="*80)

# Get configuration from environment
SILICON_FLOW_API_KEY = os.getenv('SILICON_FLOW_API_KEY', '')
SILICON_FLOW_MODEL = os.getenv('SILICON_FLOW_MODEL', 'deepseek-ai/DeepSeek-V3')
SILICON_FLOW_API_URL = os.getenv('SILICON_FLOW_API_URL', 'https://api.siliconflow.cn/v1/chat/completions')
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('FLASK_PORT', '5124'))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
JWT_SECRET = os.getenv('JWT_SECRET', 'visisec-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Log critical configuration
logger.info(f"Silicon Flow API URL: {SILICON_FLOW_API_URL}")
logger.info(f"Silicon Flow Model: {SILICON_FLOW_MODEL}")
logger.info(f"API Key configured: {'Yes' if SILICON_FLOW_API_KEY else 'No'}")
logger.info(f"Flask Host: {FLASK_HOST}")
logger.info(f"Flask Port: {FLASK_PORT}")
logger.info(f"Flask Debug Mode: {FLASK_DEBUG}")
logger.info(f"Allowed CORS Origins: {os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:8080')}")
logger.info("="*80)

if not SILICON_FLOW_API_KEY:
    logger.warning("⚠️  WARNING: SILICON_FLOW_API_KEY is not set! LLM功能将不可用!")
    logger.warning("⚠️  Please set it in .env file")

if JWT_SECRET == 'visisec-secret-key-change-in-production':
    logger.warning("⚠️  WARNING: Using default JWT_SECRET! This is insecure in production!")
    logger.warning("⚠️  Please set JWT_SECRET in .env file for production use")

app = Flask(__name__)
# CORS middleware for frontend communication
# In production, restrict to specific origins
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:8080').split(',')
CORS(app, origins=allowed_origins)

# Initialize SocketIO for WebSocket support
socketio = SocketIO(
    app,
    cors_allowed_origins=allowed_origins,
    async_mode='threading',
    logger=True,
    engineio_logger=True
)

# Store for meeting data (in production, use a database)
meetings_db = {}
active_sessions = {}  # Track active WebSocket sessions

# User database (in production, use a real database)
# TODO: Replace with persistent database (e.g., PostgreSQL, MongoDB) for production
# In-memory storage will lose all data on restart and doesn't support multi-instance deployments
users_db = {}

# Configuration constants
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 100 * 1024 * 1024))  # 100MB default
MAX_PROMPT_LENGTH = int(os.getenv('MAX_PROMPT_LENGTH', 2000))  # 2000 chars default


def async_route(f):
    """Decorator to handle async routes in Flask"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapper


def create_jwt_token(username: str) -> str:
    """Create JWT token for user"""
    payload = {
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No authorization token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = verify_jwt_token(token)
            request.user = payload
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({"error": str(e)}), 401
    return wrapper


async def call_llm(messages: List[Dict[str, str]], temperature: float = 0.7) -> str:
    """
    调用 Silicon Flow DeepSeek LLM API
    """
    logger.info(f"🤖 Calling LLM API: {SILICON_FLOW_API_URL}")
    logger.debug(f"Messages: {json.dumps(messages, ensure_ascii=False, indent=2)}")
    
    if not SILICON_FLOW_API_KEY:
        logger.error("❌ SILICON_FLOW_API_KEY is not configured!")
        raise ValueError("LLM API Key未配置")
    
    headers = {
        "Authorization": f"Bearer {SILICON_FLOW_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": SILICON_FLOW_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 2000
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            logger.info(f"📤 Sending request to {SILICON_FLOW_API_URL}")
            response = await client.post(
                SILICON_FLOW_API_URL,
                headers=headers,
                json=payload
            )
            
            logger.info(f"📥 Response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"❌ LLM API error: {response.status_code}")
                logger.error(f"Response: {response.text}")
                raise Exception(f"LLM API returned {response.status_code}: {response.text}")
            
            result = response.json()
            logger.debug(f"LLM Response: {json.dumps(result, ensure_ascii=False, indent=2)}")
            
            content = result['choices'][0]['message']['content']
            logger.info(f"✅ LLM response received: {len(content)} characters")
            
            return content
    
    except httpx.TimeoutException:
        logger.error("❌ LLM API request timeout")
        raise Exception("LLM API请求超时")
    except Exception as e:
        logger.error(f"❌ LLM API call failed: {str(e)}")
        raise


@app.route('/')
def root():
    """健康检查端点"""
    logger.info("Health check requested")
    return jsonify({
        "status": "healthy",
        "service": "VisiSec Backend",
        "version": "0.2.0",
        "llm_configured": bool(SILICON_FLOW_API_KEY),
        "timestamp": datetime.now().isoformat()
    })


# ============================================================================
# Authentication Endpoints
# ============================================================================

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        logger.info("="*60)
        logger.info("📝 Registration request received")
        
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not username or not password:
            logger.warning("❌ Missing username or password")
            return jsonify({"error": "Username and password are required"}), 400
        
        if len(username) < 3:
            logger.warning("❌ Username too short")
            return jsonify({"error": "Username must be at least 3 characters"}), 400
        
        if len(password) < 6:
            logger.warning("❌ Password too short")
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        # Check if user exists
        if username in users_db:
            logger.warning(f"❌ Username already exists: {username}")
            return jsonify({"error": "Username already exists"}), 409
        
        # Hash password and create user
        hashed_password = bcrypt_lib.hashpw(password.encode('utf-8'), bcrypt_lib.gensalt()).decode('utf-8')
        users_db[username] = {
            'username': username,
            'password': hashed_password,
            'created_at': datetime.now().isoformat()
        }
        
        # Create JWT token
        token = create_jwt_token(username)
        
        logger.info(f"✅ User registered successfully: {username}")
        logger.info("="*60)
        
        return jsonify({
            "status": "success",
            "message": "User registered successfully",
            "token": token,
            "user": {
                "username": username
            }
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error during registration: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        logger.info("="*60)
        logger.info("🔐 Login request received")
        
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        # Validation
        if not username or not password:
            logger.warning("❌ Missing username or password")
            return jsonify({"error": "Username and password are required"}), 400
        
        # Check if user exists
        if username not in users_db:
            logger.warning(f"❌ User not found: {username}")
            return jsonify({"error": "Invalid username or password"}), 401
        
        user = users_db[username]
        
        # Verify password
        if not bcrypt_lib.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            logger.warning(f"❌ Invalid password for user: {username}")
            return jsonify({"error": "Invalid username or password"}), 401
        
        # Create JWT token
        token = create_jwt_token(username)
        
        logger.info(f"✅ User logged in successfully: {username}")
        logger.info("="*60)
        
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "token": token,
            "user": {
                "username": username
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Error during login: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/v1/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """获取当前用户信息"""
    username = request.user['username']
    
    if username not in users_db:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "username": username,
        "created_at": users_db[username].get('created_at')
    })


@app.route('/api/v1/auth/change-password', methods=['POST'])
@require_auth
def change_password():
    """修改密码"""
    try:
        logger.info("="*60)
        logger.info("🔑 Password change request received")
        
        username = request.user['username']
        data = request.get_json()
        current_password = data.get('currentPassword', '')
        new_password = data.get('newPassword', '')
        
        # Validation
        if not current_password or not new_password:
            logger.warning("❌ Missing current or new password")
            return jsonify({"error": "Current password and new password are required"}), 400
        
        if len(new_password) < 6:
            logger.warning("❌ New password too short")
            return jsonify({"error": "New password must be at least 6 characters"}), 400
        
        # Check if user exists
        if username not in users_db:
            logger.warning(f"❌ User not found: {username}")
            return jsonify({"error": "User not found"}), 404
        
        user = users_db[username]
        
        # Verify current password
        if not bcrypt_lib.checkpw(current_password.encode('utf-8'), user['password'].encode('utf-8')):
            logger.warning(f"❌ Invalid current password for user: {username}")
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Hash and update new password
        hashed_password = bcrypt_lib.hashpw(new_password.encode('utf-8'), bcrypt_lib.gensalt()).decode('utf-8')
        users_db[username]['password'] = hashed_password
        
        logger.info(f"✅ Password changed successfully for user: {username}")
        logger.info("="*60)
        
        return jsonify({
            "status": "success",
            "message": "Password changed successfully"
        })
        
    except Exception as e:
        logger.error(f"❌ Error changing password: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/v1/upload/audio', methods=['POST'])
def upload_audio():
    """
    上传音频文件进行转录和分析
    """
    try:
        logger.info("="*60)
        logger.info("📤 Audio upload request received")
        
        if 'file' not in request.files:
            logger.warning("❌ No file in request")
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            logger.warning("❌ Empty filename")
            return jsonify({"error": "Empty filename"}), 400
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            logger.warning(f"❌ Invalid file type: {file.content_type}")
            return jsonify({"error": "Invalid file type. Must be audio."}), 400
        
        # Check file size using content_length
        if request.content_length and request.content_length > MAX_FILE_SIZE:
            logger.warning(f"❌ File too large: {request.content_length} bytes")
            return jsonify({"error": f"File too large. Maximum size is {MAX_FILE_SIZE} bytes"}), 400
        
        logger.info(f"✅ Received audio file: {file.filename}")
        logger.info(f"   Content-Type: {file.content_type}")
        if request.content_length:
            logger.info(f"   Size: {request.content_length} bytes")
        
        # In production: save file, process with Whisper, etc.
        
        return jsonify({
            "status": "success",
            "filename": file.filename,
            "message": "音频文件已接收并排队处理"
        })
    
    except Exception as e:
        logger.error(f"❌ Error uploading audio: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/v1/upload/video', methods=['POST'])
def upload_video():
    """
    上传视频文件进行帧提取和分析
    """
    try:
        logger.info("="*60)
        logger.info("📹 Video upload request received")
        
        if 'file' not in request.files:
            logger.warning("❌ No file in request")
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            logger.warning("❌ Empty filename")
            return jsonify({"error": "Empty filename"}), 400
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('video/'):
            logger.warning(f"❌ Invalid file type: {file.content_type}")
            return jsonify({"error": "Invalid file type. Must be video."}), 400
        
        # Check file size using content_length
        if request.content_length and request.content_length > MAX_FILE_SIZE:
            logger.warning(f"❌ File too large: {request.content_length} bytes")
            return jsonify({"error": f"File too large. Maximum size is {MAX_FILE_SIZE} bytes"}), 400
        
        logger.info(f"✅ Received video file: {file.filename}")
        logger.info(f"   Content-Type: {file.content_type}")
        if request.content_length:
            logger.info(f"   Size: {request.content_length} bytes")
        
        # In production: save file, extract keyframes with OpenCV, etc.
        
        return jsonify({
            "status": "success",
            "filename": file.filename,
            "message": "视频文件已接收并排队处理"
        })
    
    except Exception as e:
        logger.error(f"❌ Error uploading video: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/v1/analyze/attention', methods=['POST'])
def analyze_attention():
    """
    分析传感器数据中的注意力模式
    
    Expected data format:
    {
        "imu_data": [...],
        "app_state": [...],
        "gaze_data": [...]
    }
    """
    try:
        logger.info("="*60)
        logger.info("🧠 Attention analysis request received")
        
        data = request.get_json()
        
        if not data:
            logger.warning("❌ No JSON data in request")
            return jsonify({"error": "No data provided"}), 400
        
        logger.debug(f"Request data keys: {list(data.keys())}")
        
        # Placeholder for attention analysis
        # In production: use ML models to analyze IMU, app state, gaze data
        
        result = {
            "status": "success",
            "attention_score": 0.85,
            "low_attention_periods": [
                {"start": 300, "end": 450, "reason": "设备切换"},
                {"start": 1200, "end": 1380, "reason": "手机移动"}
            ]
        }
        
        logger.info(f"✅ Attention analysis complete: score={result['attention_score']}")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"❌ Error analyzing attention: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/api/v1/analyze/keyframes', methods=['POST'])
def extract_keyframes():
    """
    从视频中提取关键帧（PPT变化、白板更新）
    """
    try:
        logger.info("="*60)
        logger.info("🖼️  Keyframe extraction request received")
        
        data = request.get_json()
        
        if not data or 'video_id' not in data:
            logger.warning("❌ No video_id in request")
            return jsonify({"error": "video_id is required"}), 400
        
        video_id = data['video_id']
        logger.info(f"Extracting keyframes for video: {video_id}")
        
        # Placeholder for keyframe extraction
        # In production: use OpenCV for scene detection
        
        result = {
            "status": "success",
            "video_id": video_id,
            "keyframes": [
                {"timestamp": 5.3, "frame_id": "frame_001", "change_type": "幻灯片变化"},
                {"timestamp": 12.7, "frame_id": "frame_002", "change_type": "幻灯片变化"},
                {"timestamp": 25.1, "frame_id": "frame_003", "change_type": "幻灯片变化"},
            ]
        }
        
        logger.info(f"✅ Extracted {len(result['keyframes'])} keyframes")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"❌ Error extracting keyframes: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/api/v1/meetings/<meeting_id>/summary', methods=['GET'])
@async_route
async def get_meeting_summary(meeting_id: str):
    """
    获取会议的AI生成摘要
    使用 Silicon Flow DeepSeek LLM
    """
    try:
        logger.info("="*60)
        logger.info(f"📝 Summary request for meeting: {meeting_id}")
        
        # In production: retrieve transcript and context from database
        # For now, use mock data
        
        mock_transcript = """
        会议开始时间: 14:00
        
        张三: 大家好，今天我们讨论Q4的产品路线图。
        李四: 我认为我们应该优先考虑用户反馈最多的功能。
        王五: 同意。我们的数据显示，用户最关心的是性能优化。
        张三: 好的，那我们先把性能优化列为首要任务。
        李四: 我会在下周五前完成功能规格说明。
        王五: 预算方面，我们已经获得批准。
        """
        
        logger.info("🤖 Calling LLM for summary generation...")
        
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的会议助手。请分析会议记录，生成结构化的摘要，包括：1) 执行摘要 2) 关键要点 3) 行动项（带负责人和截止日期）。请用中文回复，格式清晰。"
            },
            {
                "role": "user",
                "content": f"请为以下会议记录生成摘要：\n\n{mock_transcript}"
            }
        ]
        
        try:
            summary_text = await call_llm(messages)
            
            logger.info("✅ LLM summary generated successfully")
            logger.debug(f"Summary: {summary_text}")
            
            # Parse the summary (in production, use more sophisticated parsing)
            result = {
                "meeting_id": meeting_id,
                "summary": {
                    "title": "产品策略会议",
                    "generated_summary": summary_text,
                    "executive_summary": "团队审查了Q4路线图并最终确定了营销策略",
                    "key_points": [
                        "完成Q4功能优先级排序",
                        "预算分配已批准",
                        "调整了营销时间表"
                    ],
                    "action_items": [
                        {
                            "task": "完成功能规格说明",
                            "assignee": "李四",
                            "due_date": "下周五",
                            "timestamp": 754
                        }
                    ],
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as llm_error:
            logger.error(f"❌ LLM call failed: {str(llm_error)}")
            # Fallback to static summary if LLM fails
            result = {
                "meeting_id": meeting_id,
                "summary": {
                    "title": "产品策略会议",
                    "executive_summary": "团队审查了Q4路线图并最终确定了营销策略",
                    "key_points": [
                        "完成Q4功能优先级排序",
                        "预算分配已批准",
                        "调整了营销时间表"
                    ],
                    "action_items": [
                        {
                            "task": "完成功能规格说明",
                            "assignee": "李四",
                            "due_date": "2026-02-05",
                            "timestamp": 754
                        }
                    ],
                    "note": "LLM服务暂时不可用，显示静态摘要",
                    "generated_at": datetime.now().isoformat()
                }
            }
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"❌ Error generating summary: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/api/v1/test-llm', methods=['POST'])
@async_route
async def test_llm():
    """
    测试 LLM API 连接
    """
    try:
        logger.info("="*60)
        logger.info("🧪 Testing LLM API connection...")
        
        data = request.get_json()
        prompt = data.get('prompt', '你好，请用一句话介绍你自己。')
        
        # Validate prompt length
        if len(prompt) > MAX_PROMPT_LENGTH:
            logger.warning(f"❌ Prompt too long: {len(prompt)} characters")
            return jsonify({
                "status": "error",
                "error": f"Prompt too long. Maximum length is {MAX_PROMPT_LENGTH} characters.",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        logger.info(f"Test prompt length: {len(prompt)} characters")
        
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        response = await call_llm(messages)
        
        logger.info("✅ LLM test successful!")
        
        return jsonify({
            "status": "success",
            "response": response,
            "model": SILICON_FLOW_MODEL,
            "timestamp": datetime.now().isoformat()
        })
    
    except ValueError as e:
        # LLM configuration error
        logger.error(f"❌ LLM configuration error: {str(e)}")
        return jsonify({
            "status": "error",
            "error": "LLM service not configured",
            "timestamp": datetime.now().isoformat()
        }), 503
    except Exception as e:
        logger.error(f"❌ LLM test failed: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }), 500


# ============================================================================
# WebSocket Event Handlers
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """处理WebSocket连接"""
    logger.info("="*60)
    logger.info("🔌 WebSocket client connected")
    logger.info(f"   Session ID: {request.sid}")
    logger.info("="*60)
    
    emit('connected', {
        'status': 'connected',
        'session_id': request.sid,
        'timestamp': datetime.now().isoformat()
    })


@socketio.on('disconnect')
def handle_disconnect():
    """处理WebSocket断开"""
    logger.info("="*60)
    logger.info("🔌 WebSocket client disconnected")
    logger.info(f"   Session ID: {request.sid}")
    
    # 清理活动会话
    if request.sid in active_sessions:
        session_data = active_sessions.pop(request.sid)
        logger.info(f"   Cleaned up session: {session_data.get('recording_id')}")
    
    logger.info("="*60)


@socketio.on('session_start')
def handle_session_start(data):
    """处理会话开始"""
    try:
        logger.info("="*60)
        logger.info("🚀 Session start request received")
        logger.info(f"   Client SID: {request.sid}")
        logger.info(f"   Meeting Title: {data.get('meetingTitle', 'Untitled')}")
        
        # 生成会话和录制ID
        session_id = request.sid
        recording_id = str(uuid.uuid4())
        
        # 保存会话数据
        active_sessions[session_id] = {
            'recording_id': recording_id,
            'meeting_title': data.get('meetingTitle', 'Untitled Meeting'),
            'start_time': datetime.now().isoformat(),
            'sensor_data': [],
            'keyframes': []
        }
        
        # 将客户端加入房间
        join_room(recording_id)
        
        logger.info(f"✅ Session started successfully")
        logger.info(f"   Recording ID: {recording_id}")
        logger.info("="*60)
        
        # 发送会话开始确认
        emit('session_started', {
            'sessionId': session_id,
            'recordingId': recording_id,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Error starting session: {str(e)}", exc_info=True)
        emit('error', {
            'message': 'Failed to start session',
            'error': str(e)
        })


@socketio.on('sensor_data')
def handle_sensor_data(data):
    """处理传感器数据"""
    try:
        session_id = data.get('sessionId')
        
        if session_id not in active_sessions:
            logger.warning(f"⚠️ Sensor data received for inactive session: {session_id}")
            emit('error', {'message': 'Invalid session'})
            return
        
        # 限制内存使用：最多保存1000个数据点
        MAX_DATA_POINTS = 1000
        session_data = active_sessions[session_id]['sensor_data']
        
        # 保存传感器数据
        session_data.append({
            'timestamp': datetime.now().isoformat(),
            'data': data
        })
        
        # 如果超过限制，删除最旧的数据
        if len(session_data) > MAX_DATA_POINTS:
            removed = session_data.pop(0)
            logger.debug(f"📦 Removed oldest sensor data point to maintain memory limit")
        
        logger.debug(f"📊 Sensor data received for session {session_id} (total: {len(session_data)})")
        
        # 发送处理确认
        emit('sensor_data_received', {
            'status': 'received',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Error handling sensor data: {str(e)}", exc_info=True)
        emit('error', {
            'message': 'Failed to process sensor data',
            'error': str(e)
        })


@socketio.on('keyframe')
def handle_keyframe(data):
    """处理关键帧"""
    try:
        session_id = data.get('sessionId')
        recording_id = data.get('recordingId')
        
        if session_id not in active_sessions:
            logger.warning(f"⚠️ Keyframe received for inactive session: {session_id}")
            emit('error', {'message': 'Invalid session'})
            return
        
        logger.info("="*60)
        logger.info("🖼️ Keyframe received")
        logger.info(f"   Session: {session_id}")
        logger.info(f"   Recording: {recording_id}")
        
        # 限制内存使用：最多保存100个关键帧
        MAX_KEYFRAMES = 100
        keyframes = active_sessions[session_id]['keyframes']
        
        # 保存关键帧
        keyframe_data = {
            'timestamp': datetime.now().isoformat(),
            'source': data.get('source', 'REAR'),
            'change_detected': data.get('sceneChange', {}).get('changed', False),
            'attention_score': data.get('attention', {}).get('score', 0)
        }
        
        keyframes.append(keyframe_data)
        
        # 如果超过限制，删除最旧的关键帧
        if len(keyframes) > MAX_KEYFRAMES:
            removed = keyframes.pop(0)
            logger.debug(f"📦 Removed oldest keyframe to maintain memory limit")
        
        logger.info(f"✅ Keyframe saved (total: {len(keyframes)})")
        logger.info("="*60)
        
        # 发送处理确认
        emit('keyframe_received', {
            'status': 'received',
            'keyframe_count': len(keyframes),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Error handling keyframe: {str(e)}", exc_info=True)
        emit('error', {
            'message': 'Failed to process keyframe',
            'error': str(e)
        })


@socketio.on('session_end')
def handle_session_end(data):
    """处理会话结束"""
    try:
        session_id = data.get('sessionId')
        recording_id = data.get('recordingId')
        
        if session_id not in active_sessions:
            logger.warning(f"⚠️ Session end for inactive session: {session_id}")
            emit('error', {'message': 'Invalid session'})
            return
        
        logger.info("="*60)
        logger.info("🛑 Session end request received")
        logger.info(f"   Session: {session_id}")
        logger.info(f"   Recording: {recording_id}")
        
        # 获取会话数据
        session_data = active_sessions[session_id]
        
        # 保存到数据库（这里保存到内存中的meetings_db）
        meetings_db[recording_id] = {
            'recording_id': recording_id,
            'meeting_title': session_data['meeting_title'],
            'start_time': session_data['start_time'],
            'end_time': datetime.now().isoformat(),
            'sensor_data_count': len(session_data['sensor_data']),
            'keyframe_count': len(session_data['keyframes']),
            'status': 'completed'
        }
        
        logger.info(f"✅ Session data saved to database")
        logger.info(f"   Sensor data points: {len(session_data['sensor_data'])}")
        logger.info(f"   Keyframes: {len(session_data['keyframes'])}")
        
        # 离开房间
        leave_room(recording_id)
        
        # 清理活动会话
        active_sessions.pop(session_id)
        
        logger.info("="*60)
        
        # 发送会话结束确认
        emit('session_ended', {
            'status': 'completed',
            'recordingId': recording_id,
            'summary': {
                'sensor_data_count': meetings_db[recording_id]['sensor_data_count'],
                'keyframe_count': meetings_db[recording_id]['keyframe_count'],
                'duration': 'calculated_duration'
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Error ending session: {str(e)}", exc_info=True)
        emit('error', {
            'message': 'Failed to end session',
            'error': str(e)
        })


if __name__ == "__main__":
    logger.info("="*80)
    logger.info("🚀 Starting Flask server with WebSocket support...")
    logger.info(f"   Host: {FLASK_HOST}")
    logger.info(f"   Port: {FLASK_PORT}")
    logger.info(f"   Debug: {FLASK_DEBUG}")
    logger.info("="*80)
    
    # Use socketio.run instead of app.run for WebSocket support
    socketio.run(
        app,
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=FLASK_DEBUG,
        allow_unsafe_werkzeug=True  # For development only
    )

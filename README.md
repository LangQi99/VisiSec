<div align="center">

# 🎯 VisiSec

### Visual Intelligence Secretary - 视界秘书

*A multimodal intelligent meeting assistant that never misses a moment*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Latest-119EFF?logo=capacitor)](https://capacitorjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)](https://www.python.org/)

<img src="https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white" alt="Android">
<img src="https://img.shields.io/badge/Status-Alpha-orange" alt="Status">

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Contributing](#-contributing)

<img width="800" alt="VisiSec Hero" src="https://via.placeholder.com/800x400/FBF9F6/1A1A1A?text=VisiSec+Meeting+Assistant">

</div>

---

## 📖 Overview

**VisiSec** revolutionizes meeting documentation by combining **multimodal sensing** (audio + video + behavior) to create intelligent, context-aware meeting summaries. Say goodbye to information overload and hello to actionable insights.

### The Problem

Traditional recording tools capture *everything* but miss *what matters*:
- 📝 Information overload with hours of undifferentiated content
- 🤷 No context about what you actually focused on
- ⏱️ Time-consuming manual review to find key moments
- 🎯 Missed action items buried in lengthy transcripts

### Our Solution

VisiSec uses **sensor fusion** to understand not just *what was said*, but *what mattered to you*:

```
Visual (Dual Camera) + Audio + Context (IMU/App State) 
                    ↓
        Edge + Cloud Processing
                    ↓
    Smart Timeline + Action Items + OCR
```

---

## ✨ Features

### 🎥 **Multimodal Capture**

<table>
<tr>
<td width="33%">

#### Visual Stream
- 📹 **Rear Camera**: Captures presentations, whiteboards
- 👁️ **Front Camera**: Tracks attention & engagement
- 🖼️ **Smart Keyframes**: Auto-extracts slide changes

</td>
<td width="33%">

#### Audio Processing
- 🎤 **Hi-Fi Recording**: Crystal clear audio
- 📝 **Transcription**: Automatic speech-to-text
- 🗣️ **Speaker Detection**: Who said what

</td>
<td width="33%">

#### Context Awareness
- 📱 **IMU Sensors**: Device orientation tracking
- 📲 **App Monitoring**: Detects context switches
- ⚡ **Real-time Analysis**: Edge computing

</td>
</tr>
</table>

### 🎨 **Intelligent Analysis**

- **📊 Attention Heatmap**: Visual timeline showing focus levels
  - 🟢 Green: High attention periods
  - 🟡 Yellow: Medium engagement
  - 🔴 Red: Low focus (context switches, phone checks)

- **🎯 Auto Action Items**: NLP-powered extraction
  - ✅ Task identification
  - 👤 Assignee detection
  - 📅 Calendar integration with evidence

- **🖼️ OCR & Visual Analysis**: 
  - Extracts text from slides/whiteboards
  - Links visuals to audio segments
  - LLM-powered summaries

### 🎭 **Beautiful Design**

Inspired by high-end editorial magazines with a warm, humanist aesthetic:
- 📰 Serif headings for elegance
- 🎨 Paper-like backgrounds (#FBF9F6)
- 🧡 Terracotta accents for warmth
- 💊 Pill-shaped, minimalist UI elements

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (Vue 3 + Capacitor)         │
├─────────────────────────────────────────────────────────────┤
│  Frontend Components:                                        │
│  • Recording Interface  • Timeline Visualization             │
│  • Summary Dashboard    • Action Items Manager              │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Edge Processing Layer                     │
├─────────────────────────────────────────────────────────────┤
│  • Frame Change Detection  • Attention Scoring               │
│  • Gaze Tracking          • IMU Analysis                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (FastAPI + UV Python)               │
├─────────────────────────────────────────────────────────────┤
│  • Audio/Video Upload     • Keyframe Extraction              │
│  • Transcription Service  • LLM Summary Generation           │
│  • OCR Processing         • Action Item Extraction           │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- ⚡ **Vue 3**: Reactive UI framework
- 🎨 **Tailwind CSS**: Utility-first styling with custom design system
- 🚀 **Vite**: Lightning-fast build tool
- 📱 **Capacitor**: Native mobile capabilities

**Backend**
- 🐍 **Python 3.9+**: Core language
- ⚡ **FastAPI**: Modern async API framework
- 📦 **UV**: Fast Python package manager
- 🔍 **OpenCV**: Computer vision processing
- 🤖 **LLM Integration**: For summarization (planned)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- [UV](https://github.com/astral-sh/uv) package manager
- Android Studio (for mobile development)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build for Android
npm run build:android
```

The app will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install with UV
uv pip install -e .

# Run development server
uv run uvicorn src.visisec_backend.main:app --reload
```

API will be available at `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Android Development

```bash
cd frontend

# Build and sync
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

Or use the convenience script:
```bash
npm run build:android
```

### ⚠️ 权限配置重要提示 / Permission Configuration

VisiSec 需要访问多种设备传感器和硬件。**请仔细阅读** [权限配置指南](frontend/PERMISSIONS_GUIDE.md) 了解：

- 📱 运动传感器权限配置 (Android/iOS)
- 📷 相机权限配置
- 🎤 麦克风权限配置
- 💾 存储权限配置
- 🐛 常见权限问题解决方案

**重要**: 如果您遇到 "Motion.requestPermission() is not implemented on android" 错误，这个问题已经修复！新版本使用正确的平台特定权限处理方式：
- **iOS**: 使用 `DeviceMotionEvent.requestPermission()` 
- **Android**: 基础传感器默认可用，无需显式请求

详见[权限配置指南](frontend/PERMISSIONS_GUIDE.md)。

---

## 📂 Project Structure

```
VisiSec/
├── frontend/                # Vue 3 application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── views/          # Page components
│   │   ├── router/         # Vue Router configuration
│   │   └── assets/         # Static assets
│   ├── android/            # Capacitor Android project
│   ├── tailwind.config.js  # Tailwind customization
│   └── package.json
│
├── backend/                 # FastAPI backend
│   ├── src/
│   │   └── visisec_backend/
│   │       ├── main.py     # API endpoints
│   │       └── __init__.py
│   ├── pyproject.toml      # UV/Python config
│   └── README.md
│
├── .gitignore
└── README.md               # You are here!
```

---

## 🎨 Design System

Our **Modern Editorial** aesthetic creates a calm, trustworthy experience:

### Color Palette
```css
Paper Background: #FBF9F6    /* Warm off-white */
Ink Text:         #1A1A1A    /* Deep black */
Terracotta:       #C85A3E    /* Warm accent */
```

### Typography
- **Headings**: Merriweather (Serif) - Elegant and authoritative
- **Body**: Inter (Sans-serif) - Clean and readable

### Components
- **Buttons**: Pill-shaped with high border radius
- **Cards**: Soft shadows, rounded corners (3xl)
- **Icons**: Thin outline style, geometric

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Core project structure
- [x] Frontend UI components (Vue 3 + Capacitor)
- [x] Backend API implementation (Flask + WebSocket)
- [x] Capacitor Android integration
- [x] IMU sensor data collection with platform-specific permission handling
- [x] Camera integration (dual camera support)
- [x] Audio recording implementation
- [x] Edge computing with TensorFlow.js
- [x] Scene change detection
- [x] Attention scoring
- [x] WebSocket real-time communication
- [x] LLM integration (DeepSeek V3)
- [x] Meeting summary generation
- [x] Comprehensive permission configuration

### 🚧 In Progress
- [ ] Real OCR implementation (currently placeholder)
- [ ] Whisper API integration for accurate transcription
- [ ] Calendar API integration for action items

### 🔮 Future Enhancements
- [ ] iOS support
- [ ] Real-time collaboration features
- [ ] Multi-language support
- [ ] Offline mode with local LLM

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Inspired by the need for better meeting documentation
- Built with modern web and mobile technologies
- Designed with accessibility and user experience in mind

---

<div align="center">

**Made with ❤️ by the VisiSec Team**

[Report Bug](https://github.com/LangQi99/VisiSec/issues) • [Request Feature](https://github.com/LangQi99/VisiSec/issues)

⭐ Star us on GitHub if you find this project helpful!

</div>

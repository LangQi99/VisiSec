# VisiSec Backend

Python backend for VisiSec multimodal meeting assistant.

## Features

- Audio upload and transcription endpoints
- Video processing and keyframe extraction
- Attention analysis from sensor data
- Meeting summary generation

## Setup

```bash
# Install dependencies with uv
uv pip install -e .

# Run development server
uv run uvicorn src.visisec_backend.main:app --reload
```

## API Endpoints

- `GET /` - Health check
- `POST /api/v1/upload/audio` - Upload audio file
- `POST /api/v1/upload/video` - Upload video file
- `POST /api/v1/analyze/attention` - Analyze attention patterns
- `POST /api/v1/analyze/keyframes` - Extract keyframes
- `GET /api/v1/meetings/{meeting_id}/summary` - Get meeting summary

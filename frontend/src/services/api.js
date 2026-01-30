/**
 * VisiSec API 服务
 * 与后端通信的接口层
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5124'

// 日志辅助函数
const logAPI = (method, endpoint, data = null) => {
  console.log('='.repeat(60))
  console.log(`🌐 API ${method}: ${endpoint}`)
  console.log(`📍 Full URL: ${API_BASE_URL}${endpoint}`)
  if (data) {
    console.log('📦 Request data:', data)
  }
  console.log(`⏰ Time: ${new Date().toISOString()}`)
}

const logAPIResponse = (method, endpoint, response, error = null) => {
  if (error) {
    console.error(`❌ API ${method} ${endpoint} 失败:`, error)
  } else {
    console.log(`✅ API ${method} ${endpoint} 成功`)
    console.log('📥 Response:', response)
  }
  console.log('='.repeat(60))
}

/**
 * 健康检查
 */
export async function checkHealth() {
  const endpoint = '/'
  logAPI('GET', endpoint)
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    const data = await response.json()
    logAPIResponse('GET', endpoint, data)
    return data
  } catch (error) {
    logAPIResponse('GET', endpoint, null, error)
    throw error
  }
}

/**
 * 上传音频文件
 */
export async function uploadAudio(file) {
  const endpoint = '/api/v1/upload/audio'
  logAPI('POST', endpoint, { filename: file.name, size: file.size })
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    logAPIResponse('POST', endpoint, data)
    return data
  } catch (error) {
    logAPIResponse('POST', endpoint, null, error)
    throw error
  }
}

/**
 * 上传视频文件
 */
export async function uploadVideo(file) {
  const endpoint = '/api/v1/upload/video'
  logAPI('POST', endpoint, { filename: file.name, size: file.size })
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    logAPIResponse('POST', endpoint, data)
    return data
  } catch (error) {
    logAPIResponse('POST', endpoint, null, error)
    throw error
  }
}

/**
 * 分析注意力数据
 */
export async function analyzeAttention(data) {
  const endpoint = '/api/v1/analyze/attention'
  logAPI('POST', endpoint, data)
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    logAPIResponse('POST', endpoint, result)
    return result
  } catch (error) {
    logAPIResponse('POST', endpoint, null, error)
    throw error
  }
}

/**
 * 提取关键帧
 */
export async function extractKeyframes(videoId) {
  const endpoint = '/api/v1/analyze/keyframes'
  logAPI('POST', endpoint, { video_id: videoId })
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ video_id: videoId })
    })
    
    const data = await response.json()
    logAPIResponse('POST', endpoint, data)
    return data
  } catch (error) {
    logAPIResponse('POST', endpoint, null, error)
    throw error
  }
}

/**
 * 获取会议摘要
 */
export async function getMeetingSummary(meetingId) {
  const endpoint = `/api/v1/meetings/${meetingId}/summary`
  logAPI('GET', endpoint)
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    const data = await response.json()
    logAPIResponse('GET', endpoint, data)
    return data
  } catch (error) {
    logAPIResponse('GET', endpoint, null, error)
    throw error
  }
}

/**
 * 测试LLM连接
 */
export async function testLLM(prompt = '你好，请用一句话介绍你自己。') {
  const endpoint = '/api/v1/test-llm'
  logAPI('POST', endpoint, { prompt })
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })
    
    const data = await response.json()
    logAPIResponse('POST', endpoint, data)
    return data
  } catch (error) {
    logAPIResponse('POST', endpoint, null, error)
    throw error
  }
}

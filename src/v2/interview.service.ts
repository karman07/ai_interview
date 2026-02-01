import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { Response } from 'express';
import { StartInterviewDto } from './dto/interview.dto';

const AI_BACKEND_URL = process.env.AI_INTERVIEW_V2_BASE_URL || 'http://127.0.0.1:8000';

@Injectable()
export class InterviewService {
  /**
   * Start interview with direct CV/JD text (JSON request)
   */
  async startInterview(dto: StartInterviewDto) {
    console.log('\n🚀 [V2 Interview API] POST /interview/v2/start called');
    console.log('📥 Request Body:', JSON.stringify(dto, null, 2));
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/start`);
    
    try {
      const response = await axios.post(`${AI_BACKEND_URL}/interview/v2/start`, dto, {
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
        timeout: 0, // No timeout - wait for AI processing
      });
      
      console.log('✅ [V2 Interview API] AI Backend Response:', JSON.stringify(response.data, null, 2));
      console.log('💾 Session ID:', response.data.session_id);
      console.log('📊 Status:', response.data.status);
      console.log('❓ Question #:', response.data.question_number);
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }

  /**
   * Start interview with MongoDB IDs (Form Data - recommended for caching)
   */
  async startInterviewWithIds(req: any) {
    console.log('\n🚀 [V2 Interview API] POST /interview/v2/start-with-ids called');
    console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('📎 Files uploaded:', req.files?.map(f => ({ fieldname: f.fieldname, filename: f.originalname, size: f.size })));
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/start-with-ids`);
    
    try {
      const formData = new FormData();
      
      // Add required form fields
      if (req.body.user_id) formData.append('user_id', req.body.user_id);
      if (req.body.session_id) formData.append('session_id', req.body.session_id);
      if (req.body.role) formData.append('role', req.body.role);
      if (req.body.company) formData.append('company', req.body.company);
      
      // Add optional MongoDB IDs
      if (req.body.cv_id) formData.append('cv_id', req.body.cv_id);
      if (req.body.jd_id) formData.append('jd_id', req.body.jd_id);
      
      // Add optional text fallbacks
      if (req.body.cv_text) formData.append('cv_text', req.body.cv_text);
      if (req.body.jd_text) formData.append('jd_text', req.body.jd_text);
      
      // Add files if present
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          console.log(`📄 Processing file: ${file.fieldname} - ${file.originalname} (${file.size} bytes)`);
          
          if (file.buffer && file.buffer.length > 0) {
            formData.append(file.fieldname, file.buffer, {
              filename: file.originalname,
              contentType: file.mimetype || 'application/octet-stream',
              knownLength: file.size,
            });
            console.log(`✅ File attached: ${file.fieldname}`);
          }
        });
      }
      
      const headers = formData.getHeaders();
      console.log('📋 Request Headers:', headers);
      
      const response = await axios.post(`${AI_BACKEND_URL}/interview/v2/start-with-ids`, formData, {
        headers: {
          ...headers,
          'Connection': 'keep-alive',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0,
      });
      
      console.log('✅ [V2 Interview API] AI Backend Response:', JSON.stringify(response.data, null, 2));
      console.log('💾 Session ID:', response.data.session_id);
      console.log('📊 Status:', response.data.status);
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }

  /**
   * Submit answer with audio/video files
   */
  async submitAnswer(req: any) {
    const sessionId = req.body.session_id || req.params?.session_id;
    
    console.log('\n🚀 [V2 Interview API] POST /interview/v2/answer called');
    console.log('🆔 Session ID:', sessionId);
    console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('📎 Files uploaded:', req.files?.map(f => ({ fieldname: f.fieldname, filename: f.originalname, size: f.size, mimetype: f.mimetype })));
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/answer`);
    
    try {
      const formData = new FormData();
      
      // Add session_id
      if (sessionId) formData.append('session_id', sessionId);
      
      // Add files (audio_file and/or video_file)
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          console.log(`🎵 Processing file: ${file.fieldname} - ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
          
          if (file.buffer && file.buffer.length > 0) {
            formData.append(file.fieldname, file.buffer, {
              filename: file.originalname,
              contentType: file.mimetype || 'application/octet-stream',
              knownLength: file.size,
            });
            console.log(`✅ File attached: ${file.fieldname}`);
          }
        });
      }
      
      const headers = formData.getHeaders();
      
      const response = await axios.post(`${AI_BACKEND_URL}/interview/v2/answer`, formData, {
        headers: {
          ...headers,
          'Connection': 'keep-alive',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0, // Wait for transcription + evaluation + next question
      });
      
      console.log('✅ [V2 Interview API] AI Backend Response:', JSON.stringify(response.data, null, 2));
      console.log('📊 Status:', response.data.status);
      if (response.data.evaluation) {
        console.log('📊 Evaluation:', response.data.evaluation);
      }
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw { 
          status: 408, 
          message: 'AI processing timeout. Please try again with a shorter answer.' 
        };
      }
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }

  /**
   * Stream question generation in real-time (Server-Sent Events)
   */
  async streamQuestion(sessionId: string, res: Response) {
    console.log('\n🚀 [V2 Interview API] GET /interview/v2/stream/:session_id called');
    console.log('🆔 Session ID:', sessionId);
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/stream/${sessionId}`);
    
    try {
      const response = await axios.get(`${AI_BACKEND_URL}/interview/v2/stream/${sessionId}`, {
        responseType: 'stream',
        headers: {
          'Accept': 'text/event-stream',
        },
        timeout: 0,
      });
      
      console.log('✅ [V2 Interview API] Streaming started');
      
      // Pipe the stream from AI backend to client
      response.data.pipe(res);
      
      response.data.on('end', () => {
        console.log('✅ [V2 Interview API] Streaming completed');
      });
      
      response.data.on('error', (error) => {
        console.log('❌ [V2 Interview API] Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Streaming error' })}\n\n`);
        res.end();
      });
      
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      res.write(`data: ${JSON.stringify({ error: error.response?.data?.detail || 'Stream error' })}\n\n`);
      res.end();
    }
  }

  /**
   * Get session state and conversation history
   */
  async getSessionState(sessionId: string) {
    console.log('\n🚀 [V2 Interview API] GET /interview/v2/state/:session_id called');
    console.log('🆔 Session ID:', sessionId);
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/state/${sessionId}`);
    
    try {
      const response = await axios.get(`${AI_BACKEND_URL}/interview/v2/state/${sessionId}`, {
        headers: {
          'Connection': 'keep-alive',
        },
        timeout: 0,
      });
      
      console.log('✅ [V2 Interview API] State retrieved');
      console.log('📊 Question count:', response.data.question_count);
      console.log('📊 Stage:', response.data.stage);
      console.log('📊 Completed:', response.data.completed);
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        return null;
      }
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }

  /**
   * Get performance metrics for a session
   */
  async getPerformanceMetrics(sessionId: string) {
    console.log('\n🚀 [V2 Interview API] GET /interview/v2/performance/:session_id called');
    console.log('🆔 Session ID:', sessionId);
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/performance/${sessionId}`);
    
    try {
      const response = await axios.get(`${AI_BACKEND_URL}/interview/v2/performance/${sessionId}`, {
        headers: {
          'Connection': 'keep-alive',
        },
        timeout: 0,
      });
      
      console.log('✅ [V2 Interview API] Performance metrics retrieved');
      console.log('📊 Total questions:', response.data.total_questions);
      console.log('📊 Avg response time:', response.data.response_times?.avg);
      console.log('📊 Cache status:', response.data.cache_status);
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        return null;
      }
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }

  /**
   * Complete interview and generate evaluation
   */
  async completeInterview(sessionId: string, body: any) {
    console.log('\n🚀 [V2 Interview API] POST /interview/v2/complete/:session_id called');
    console.log('🆔 Session ID:', sessionId);
    console.log('📥 Request Body:', JSON.stringify(body, null, 2));
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/complete/${sessionId}`);
    
    try {
      const response = await axios.post(`${AI_BACKEND_URL}/interview/v2/complete/${sessionId}`, body, {
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
        timeout: 0,
      });
      
      console.log('✅ [V2 Interview API] Interview completed');
      console.log('📊 Status:', response.data.status);
      console.log('📊 Total questions:', response.data.total_questions);
      console.log('📊 Overall score:', response.data.evaluation?.overall_score);
      console.log('📊 Recommendation:', response.data.evaluation?.recommendation);
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }

  /**
   * Get global performance metrics
   */
  async getGlobalMetrics() {
    console.log('\n🚀 [V2 Interview API] GET /interview/v2/metrics/global called');
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/metrics/global`);
    
    try {
      const response = await axios.get(`${AI_BACKEND_URL}/interview/v2/metrics/global`, {
        headers: {
          'Connection': 'keep-alive',
        },
        timeout: 0,
      });
      
      console.log('✅ [V2 Interview API] Global metrics retrieved');
      console.log('📊 LLM calls:', response.data.metrics?.llm_calls?.total);
      console.log('📊 Cache hit rate:', response.data.metrics?.cache?.hit_rate_percentage);
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }

  /**
   * Reset performance metrics (admin only)
   */
  async resetMetrics() {
    console.log('\n🚀 [V2 Interview API] POST /interview/v2/metrics/reset called');
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/interview/v2/metrics/reset`);
    
    try {
      const response = await axios.post(`${AI_BACKEND_URL}/interview/v2/metrics/reset`, {}, {
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
        timeout: 0,
      });
      
      console.log('✅ [V2 Interview API] Metrics reset successfully');
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response) {
        throw { 
          status: error.response.status, 
          message: error.response.data?.detail || error.response.data || 'AI Backend error' 
        };
      }
      throw { status: 500, message: `Failed to connect to AI backend: ${error.message}` };
    }
  }
}

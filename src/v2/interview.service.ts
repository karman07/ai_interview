import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

const AI_BACKEND_URL = process.env.AI_INTERVIEW_V2_BASE_URL || 'http://127.0.0.1:8000';

@Injectable()
export class InterviewService {
  async startInterview(req: any) {
    console.log('\n🚀 [V2 Interview API] POST /v2/interview/start called');
    console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('📎 Files uploaded:', req.files?.map(f => ({ fieldname: f.fieldname, filename: f.originalname, size: f.size })));
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/v2/interview/start`);
    
    try {
      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add form fields
      if (req.body.role) formData.append('role', req.body.role);
      if (req.body.company) formData.append('company', req.body.company);
      if (req.body.resume_text) formData.append('resume_text', req.body.resume_text);
      if (req.body.jd_text) formData.append('jd_text', req.body.jd_text);
      
      // Add files with proper handling for PDFs
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          console.log(`📄 Processing file: ${file.fieldname} - ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
          
          // Validate file
          if (!file.buffer || file.buffer.length === 0) {
            console.log(`⚠️  Warning: Empty file buffer for ${file.originalname}`);
            return;
          }
          
          // Append file with proper options for form-data
          formData.append(file.fieldname, file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype || 'application/octet-stream',
            knownLength: file.size,
          });
          
          console.log(`✅ File attached: ${file.fieldname} = ${file.originalname}`);
        });
      }
      
      // Get headers and log them
      const headers = formData.getHeaders();
      console.log('📋 Request Headers:', headers);
      
      // Forward to AI backend with no timeout - wait as long as needed
      const response = await axios.post(`${AI_BACKEND_URL}/v2/interview/start`, formData, {
        headers: {
          ...headers,
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=0',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0, // No timeout - wait indefinitely for AI processing
      });
      
      console.log('✅ [V2 Interview API] AI Backend Response:', JSON.stringify(response.data, null, 2));
      console.log('💾 Session ID from AI:', response.data.session_id);
      
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

  async submitAnswer(session_id: string, req: any) {
    console.log('\n🚀 [V2 Interview API] POST /v2/interview/:session_id/answer called');
    console.log('🆔 Session ID:', session_id);
    console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('📎 Files uploaded:', req.files?.map(f => ({ fieldname: f.fieldname, filename: f.originalname, size: f.size })));
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/v2/interview/${session_id}/answer`);
    
    try {
      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add form fields
      if (req.body.answer) formData.append('answer', req.body.answer);
      
      // Add files with proper handling for audio
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          console.log(`🎵 Processing file: ${file.fieldname} - ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
          
          // Validate file
          if (!file.buffer || file.buffer.length === 0) {
            console.log(`⚠️  Warning: Empty file buffer for ${file.originalname}`);
            return;
          }
          
          // Append file with proper options for form-data
          formData.append(file.fieldname, file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype || 'application/octet-stream',
            knownLength: file.size,
          });
          
          console.log(`✅ File attached: ${file.fieldname} = ${file.originalname}`);
        });
      }
      
      // Get headers and log them
      const headers = formData.getHeaders();
      console.log('📋 Request Headers:', headers);
      
      // Forward to AI backend with no timeout - wait as long as needed
      const response = await axios.post(`${AI_BACKEND_URL}/v2/interview/${session_id}/answer`, formData, {
        headers: {
          ...headers,
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=0',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0, // No timeout - wait indefinitely for Gemini AI processing, transcription, and voice analysis
      });
      
      console.log('✅ [V2 Interview API] AI Backend Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      console.log('❌ Error Code:', error.code);
      console.log('❌ Error Stack:', error.stack);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw { 
          status: 408, 
          message: 'AI processing timeout. The request is taking longer than expected. Please try again or use a shorter answer.' 
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

  async getStatus(session_id: string) {
    console.log('\n🚀 [V2 Interview API] GET /v2/interview/:session_id/status called');
    console.log('🆔 Session ID:', session_id);
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/v2/interview/${session_id}/status`);
    
    try {
      const response = await axios.get(`${AI_BACKEND_URL}/v2/interview/${session_id}/status`, {
        headers: {
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=0',
        },
        timeout: 0, // No timeout
      });
      
      console.log('✅ [V2 Interview API] AI Backend Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.log('❌ [V2 Interview API] Error from AI Backend:', error.response?.data || error.message);
      
      if (error.response?.status === 404 || error.response?.data?.status === 'not_found') {
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

  async completeInterview(session_id: string, body: any) {
    console.log('\n🚀 [V2 Interview API] POST /v2/interview/:session_id/complete called');
    console.log('🆔 Session ID:', session_id);
    console.log('📥 Request Body:', JSON.stringify(body, null, 2));
    console.log('🔄 Forwarding to AI Backend:', `${AI_BACKEND_URL}/v2/interview/${session_id}/complete`);
    
    try {
      const response = await axios.post(`${AI_BACKEND_URL}/v2/interview/${session_id}/complete`, body, {
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=0',
        },
        timeout: 0, // No timeout - wait indefinitely for comprehensive evaluation report
      });
      
      console.log('✅ [V2 Interview API] Complete Response received');
      console.log('📊 Interview completed - Duration:', response.data.interview_duration_minutes, 'minutes');
      console.log('📊 Total Questions:', response.data.total_questions);
      console.log('📊 Overall Score:', response.data.evaluation?.overall_score);
      console.log('📊 Recommendation:', response.data.evaluation?.recommendation);
      console.log('📊 Full Response:', JSON.stringify(response.data, null, 2));
      
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

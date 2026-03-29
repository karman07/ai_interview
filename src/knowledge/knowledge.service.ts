import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KnowledgeTopic } from './schemas/topic.schema';
import { KnowledgeDocument } from './schemas/document.schema';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData = require('form-data');

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly aiBaseUrl: string;

  constructor(
    @InjectModel(KnowledgeTopic.name) private topicModel: Model<KnowledgeTopic>,
    @InjectModel(KnowledgeDocument.name) private documentModel: Model<KnowledgeDocument>,
    private configService: ConfigService,
  ) {
    this.aiBaseUrl = this.configService.get<string>('AI_INTERVIEW_API_BASE_URL', 'http://localhost:8001');
    this.axiosInstance = axios.create({
      baseURL: this.aiBaseUrl,
      timeout: 600000, // 10 minutes for large PDFs
    });
  }

  // --- Topic Management ---

  async createTopic(name: string, description?: string, category?: string, tags: string[] = []) {
    const topic = new this.topicModel({ name, description, category, tags });
    return topic.save();
  }

  async updateLogo(id: string, logoUrl: string) {
    return this.topicModel.findByIdAndUpdate(id, { logoUrl }, { new: true });
  }

  async updateTopic(id: string, data: Partial<KnowledgeTopic>) {
    return this.topicModel.findByIdAndUpdate(id, data, { new: true });
  }

  async getTopics() {
    return this.topicModel.find().exec();
  }

  async findByName(name: string) {
    return this.topicModel.findOne({ name: new RegExp(`^${name}$`, 'i') }).exec();
  }

  async deleteTopic(id: string) {
    // 1. Delete from AI service
    try {
      await this.axiosInstance.delete(`/api/v1/rag/topic/${id}`);
    } catch (error) {
      this.logger.warn(`Failed to delete topic ${id} from AI service, it might not exist there yet.`);
    }

    // 2. Delete documents from DB
    await this.documentModel.deleteMany({ topicId: id });

    // 3. Delete topic from DB
    return this.topicModel.findByIdAndDelete(id);
  }

  // --- Document Management ---

  async addDocument(topicId: string, file: Express.Multer.File) {
    // 1. Create DB record
    const doc = new this.documentModel({
      topicId,
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      status: 'indexing',
    });
    await doc.save();

    // 2. Start indexing in background
    this.indexDocument(doc._id.toString());

    return doc;
  }

  async addJdDocument(topicId: string, file: Express.Multer.File) {
    const doc = await this.addDocument(topicId, file);
    await this.topicModel.findByIdAndUpdate(topicId, {
      jdFileId: doc._id.toString(),
      jdFileName: doc.originalName,
    });
    return doc;
  }

  private async indexDocument(docId: string) {
    const doc = await this.documentModel.findById(docId);
    if (!doc) return;

    try {
      const formData = new FormData();
      formData.append('topic_id', doc.topicId.toString());
      
      // Read file into memory buffer to avoid stream serialization issues in Axios
      const fileBuffer = fs.readFileSync(doc.filePath);
      formData.append('file', fileBuffer, {
        filename: doc.originalName,
        contentType: 'application/pdf',
      });

      const response = await this.axiosInstance.post('/api/v1/rag/index-file', formData, {
        headers: { ...formData.getHeaders() },
      });

      doc.status = 'indexed';
      doc.chunkCount = response.data.chunks || 0;
      await doc.save();
      
      this.logger.log(`Successfully indexed document ${doc.originalName} for topic ${doc.topicId}`);
    } catch (error) {
      this.logger.error(`Failed to index document ${doc.originalName}: ${error.message}`);
      doc.status = 'error';
      doc.errorDetails = error.response?.data?.detail || error.message;
      await doc.save();
    }
  }

  async getTopicDocuments(topicId: string) {
    return this.documentModel.find({ topicId }).exec();
  }

  async deleteDocument(id: string) {
    const doc = await this.documentModel.findById(id);
    if (!doc) return;

    // We don't have a single-doc delete in AI service yet (Chroma deletes are usually collection-level in basic setups)
    // For now, we'll mark it as deleted in DB or just delete the DB record.
    // Recommended: recreate the collection if a document is deleted? 
    // Or just leave the chunks in Chroma (dirty, but easier for MVP).
    
    // Cleanup local file
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    return this.documentModel.findByIdAndDelete(id);
  }

  async queryKnowledge(topicId: string, query: string) {
    const response = await this.axiosInstance.get('/api/v1/rag/query', {
      params: { topic_id: topicId, query }
    });
    return response.data;
  }

  async getDocument(id: string) {
    const doc = await this.documentModel.findById(id);
    if (!doc) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    return doc;
  }
}

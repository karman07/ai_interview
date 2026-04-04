import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCompanyRoundDto } from './dto/create-company-round.dto';
import { UpdateCompanyRoundDto } from './dto/update-company-round.dto';
import { CompanyRound, normalizeRoundType } from './schemas/company-round.schema';
import { LEGACY_KNOWLEDGE_TOPIC_MODEL } from './company-rounds.constants';

@Injectable()
export class CompanyRoundsService {
  constructor(
    @InjectModel(CompanyRound.name)
    private readonly companyRoundModel: Model<CompanyRound>,
    @InjectModel(LEGACY_KNOWLEDGE_TOPIC_MODEL)
    private readonly knowledgeTopicModel: Model<any>,
  ) {}

  private normalizeCompany(company?: string) {
    return (company || '').trim();
  }

  private normalizeTags(tags?: string[]) {
    if (!Array.isArray(tags)) return [];
    return Array.from(new Set(tags.map((tag) => String(tag || '').trim()).filter(Boolean)));
  }

  private inferRoundType(topic: any): string {
    const hints = `${topic.category || ''} ${topic.name || ''} ${(topic.tags || []).join(' ')}`.toLowerCase();
    if (hints.includes('behav')) return 'behavioral';
    if (hints.includes('hr') || hints.includes('human resource')) return 'hr';
    if (hints.includes('system')) return 'system-design';
    if (hints.includes('problem') || hints.includes('dsa') || hints.includes('coding')) return 'problem-solving';
    return 'technical';
  }

  async create(dto: CreateCompanyRoundDto) {
    const company = this.normalizeCompany(dto.company);
    const roundType = normalizeRoundType(dto.roundType) as string;
    const computedName = dto.name?.trim() || `${company} ${roundType} round`;

    const payload = {
      ...dto,
      company,
      roundType,
      name: computedName,
      tags: this.normalizeTags(dto.tags),
    };

    try {
      return await this.companyRoundModel.findOneAndUpdate(
        { company, roundType },
        payload,
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).exec();
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Company round already exists for this company and round type');
      }
      throw error;
    }
  }

  async findAllPublic() {
    return this.companyRoundModel
      .find({ isPublished: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllAdmin() {
    return this.companyRoundModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateLogo(id: string, logoUrl: string) {
    const updated = await this.companyRoundModel
      .findByIdAndUpdate(id, { logoUrl }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Company round not found');
    return updated;
  }

  async migrateFromKnowledge() {
    const topics = await this.knowledgeTopicModel.find().exec();
    let migrated = 0;

    for (const topic of topics) {
      const company = this.normalizeCompany(topic.name);
      if (!company) continue;

      const roundType = normalizeRoundType(this.inferRoundType(topic)) as string;
      const payload = {
        company,
        roundType,
        name: `${company} ${roundType} round`,
        description: topic.description || `Specialized interview round for ${company}.`,
        logoUrl: topic.logoUrl || undefined,
        tags: this.normalizeTags(topic.tags),
        isPublished: topic.isPublished ?? true,
      };

      await this.companyRoundModel.findOneAndUpdate(
        { company, roundType },
        payload,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).exec();
      migrated += 1;
    }

    return {
      migrated,
      sourceTopics: topics.length,
      message: 'Knowledge topics migrated to company rounds',
    };
  }

  async update(id: string, dto: UpdateCompanyRoundDto) {
    const patch: any = { ...dto };
    if (dto.company || dto.roundType || dto.name) {
      const existing = await this.companyRoundModel.findById(id).exec();
      if (!existing) throw new NotFoundException('Company round not found');

      const company = this.normalizeCompany(dto.company ?? existing.company);
      const roundType = normalizeRoundType((dto.roundType ?? existing.roundType) as string) as string;
      const name = (dto.name ?? `${company} ${roundType} round`).trim();
      patch.company = company;
      patch.roundType = roundType;
      patch.name = name;
    }

    if (dto.tags) {
      patch.tags = this.normalizeTags(dto.tags);
    }

    let updated: CompanyRound | null = null;
    try {
      updated = await this.companyRoundModel
        .findByIdAndUpdate(id, patch, { new: true })
        .exec();
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Company round already exists for this company and round type');
      }
      throw error;
    }

    if (!updated) throw new NotFoundException('Company round not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.companyRoundModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Company round not found');
    return { deleted: true };
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export const ROUND_TYPES = [
  'coding',
  'system-design',
  'technical',
  'behavioral',
  'problem-solving',
  'hr',
] as const;

export type RoundType = (typeof ROUND_TYPES)[number];

const ROUND_TYPE_ALIASES: Record<string, RoundType> = {
  coding: 'coding',
  code: 'coding',
  technical: 'technical',
  tech: 'technical',
  behavioral: 'behavioral',
  behaviour: 'behavioral',
  hr: 'hr',
  'human-resources': 'hr',
  'problem-solving': 'problem-solving',
  problemsolving: 'problem-solving',
  problem_solving: 'problem-solving',
  problemsolvinground: 'problem-solving',
  problem: 'problem-solving',
  'system-design': 'system-design',
  systemdesign: 'system-design',
  system_design: 'system-design',
};

export function normalizeRoundType(input: string): RoundType | string {
  const raw = (input || '').trim().toLowerCase();
  if (!raw) return raw;

  // Normalize camelCase/PascalCase and whitespace into a stable key.
  const normalizedKey = raw
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/-+/g, '-');

  const compactKey = normalizedKey.replace(/-/g, '');
  return ROUND_TYPE_ALIASES[normalizedKey] || ROUND_TYPE_ALIASES[compactKey] || normalizedKey;
}

@Schema({ timestamps: true })
export class CompanyRound extends MongooseDocument {
  @Prop({ required: true })
  company: string;

  @Prop({ required: true, enum: ROUND_TYPES })
  roundType: RoundType;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  logoUrl: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isPublished: boolean;
}

export const CompanyRoundSchema = SchemaFactory.createForClass(CompanyRound);
CompanyRoundSchema.index({ company: 1, roundType: 1 }, { unique: true });

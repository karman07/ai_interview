import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import { ModelConfig, ModelConfigDocument } from './schemas/model-config.schema';

// ── Static model catalogue (pricing from Google / Groq public docs) ─────────
export const MODEL_CATALOG = {
  gemini: [
    { id: 'gemini-2.5-flash',    label: 'Gemini 2.5 Flash',    tier: 'recommended', inputPer1M: 0.075, outputPer1M: 0.30,  note: 'Best price/performance — recommended default' },
    { id: 'gemini-2.5-pro',      label: 'Gemini 2.5 Pro',      tier: 'premium',     inputPer1M: 1.25,  outputPer1M: 10.00, note: 'Highest quality, complex reasoning' },
    { id: 'gemini-1.5-flash',    label: 'Gemini 1.5 Flash',    tier: 'budget',      inputPer1M: 0.075, outputPer1M: 0.30,  note: 'Stable legacy model' },
    { id: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B', tier: 'budget',      inputPer1M: 0.0375,outputPer1M: 0.15,  note: 'Most affordable Gemini' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B',   tier: 'recommended', inputPer1M: 0.59,  outputPer1M: 0.79,  note: 'Best quality on Groq' },
    { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B',    tier: 'budget',      inputPer1M: 0.05,  outputPer1M: 0.08,  note: 'Fastest & cheapest' },
    { id: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B',    tier: 'balanced',    inputPer1M: 0.24,  outputPer1M: 0.24,  note: '32 K context window' },
  ],
} as const;

const DEFAULT_MODELS: Record<'gemini' | 'groq', string> = {
  gemini: 'gemini-2.5-flash',
  groq:   'llama-3.1-8b-instant',
};

@Injectable()
export class AiConfigService implements OnModuleInit {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(
    @InjectModel(ApiKey.name)     private apiKeyModel:     Model<ApiKeyDocument>,
    @InjectModel(ModelConfig.name) private modelConfigModel: Model<ModelConfigDocument>,
  ) {}

  /** On startup: seed default keys from env if not already present */
  async onModuleInit() {
    await this.seedDefaultKey('gemini', process.env.GEMINI_API_KEY);
    await this.seedDefaultKey('groq', process.env.GROQ_API_KEY);
  }

  private async seedDefaultKey(provider: 'gemini' | 'groq', envValue?: string) {
    if (!envValue) return;
    const exists = await this.apiKeyModel.findOne({ provider, isDefault: true });
    if (!exists) {
      await this.apiKeyModel.create({
        provider,
        label: `Default (env)`,
        value: envValue,
        isActive: true,
        isDefault: true,
      });
      this.logger.log(`Seeded default ${provider} key from env`);
    } else {
      // Keep the stored default value in sync with env
      if (exists.value !== envValue) {
        exists.value = envValue;
        await exists.save();
      }
    }
  }

  /** Mask all but first 6 and last 4 chars */
  private mask(value: string): string {
    if (!value || value.length <= 10) return '••••••••••••';
    return value.slice(0, 6) + '•'.repeat(Math.max(4, value.length - 10)) + value.slice(-4);
  }

  /** Returns all keys for all providers — values are masked */
  async getAllKeys() {
    const keys = await this.apiKeyModel.find().sort({ provider: 1, createdAt: 1 }).lean();
    return keys.map(k => ({
      id: String(k._id),
      provider: k.provider,
      label: k.label,
      maskedValue: this.mask(k.value),
      isActive: k.isActive,
      isDefault: k.isDefault,
      createdAt: (k as any).createdAt,
    }));
  }

  /** Add a new key (custom) — does NOT auto-activate */
  async addKey(provider: 'gemini' | 'groq', label: string, value: string) {
    const created = await this.apiKeyModel.create({
      provider,
      label,
      value,
      isActive: false,
      isDefault: false,
    });
    return {
      id: String(created._id),
      provider: created.provider,
      label: created.label,
      maskedValue: this.mask(created.value),
      isActive: created.isActive,
      isDefault: created.isDefault,
    };
  }

  /** Set a key as the active one for its provider — deactivates all others */
  async setActive(id: string) {
    const key = await this.apiKeyModel.findById(id);
    if (!key) throw new Error('Key not found');
    await this.apiKeyModel.updateMany({ provider: key.provider }, { isActive: false });
    key.isActive = true;
    await key.save();
    return { success: true };
  }

  /** Delete a key — default env key cannot be deleted */
  async deleteKey(id: string) {
    const key = await this.apiKeyModel.findById(id);
    if (!key) throw new Error('Key not found');
    if (key.isDefault) throw new Error('Cannot delete the default env key');
    if (key.isActive) {
      // Re-activate the default key for this provider before deleting
      const def = await this.apiKeyModel.findOne({ provider: key.provider, isDefault: true });
      if (def) { def.isActive = true; await def.save(); }
    }
    await this.apiKeyModel.findByIdAndDelete(id);
    return { success: true };
  }

  /** Returns the raw (unmasked) active key for a provider — for internal backend use only */
  async getActiveKey(provider: 'gemini' | 'groq'): Promise<string> {
    const key = await this.apiKeyModel.findOne({ provider, isActive: true });
    if (key?.value) return key.value;
    // Ultimate fallback to env
    return provider === 'gemini'
      ? (process.env.GEMINI_API_KEY ?? '')
      : (process.env.GROQ_API_KEY ?? '');
  }

  // ── Model management ──────────────────────────────────────────────────────

  /** Returns the static catalogue enriched with which model is currently active */
  async getModels() {
    const configs = await this.modelConfigModel.find().lean();
    const activeMap: Record<string, string> = {};
    for (const c of configs) activeMap[c.provider] = c.modelId;

    return {
      gemini: MODEL_CATALOG.gemini.map(m => ({
        ...m,
        isActive: (activeMap['gemini'] ?? DEFAULT_MODELS.gemini) === m.id,
      })),
      groq: MODEL_CATALOG.groq.map(m => ({
        ...m,
        isActive: (activeMap['groq'] ?? DEFAULT_MODELS.groq) === m.id,
      })),
      activeGemini: activeMap['gemini'] ?? DEFAULT_MODELS.gemini,
      activeGroq:   activeMap['groq']   ?? DEFAULT_MODELS.groq,
    };
  }

  /** Persist the chosen model for a provider */
  async setActiveModel(provider: 'gemini' | 'groq', modelId: string) {
    const catalog = MODEL_CATALOG[provider] as readonly { id: string }[];
    if (!catalog.find(m => m.id === modelId)) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    await this.modelConfigModel.findOneAndUpdate(
      { provider },
      { modelId },
      { upsert: true, new: true },
    );
    return { success: true, provider, modelId };
  }

  /** Returns the active model ID for a provider — for internal use */
  async getActiveModel(provider: 'gemini' | 'groq'): Promise<string> {
    const config = await this.modelConfigModel.findOne({ provider }).lean();
    return config?.modelId ?? DEFAULT_MODELS[provider];
  }
}

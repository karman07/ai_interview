export interface RedisState {
  enabled: boolean;
  connected: boolean;
  error?: string | null;
}

export interface MongoState {
  readyState: number;
  error?: string | null;
  lastEvent?: string;
}

export const redisState: RedisState = {
  enabled: false,
  connected: false,
  error: 'disabled',
};

export const mongoState: MongoState = {
  readyState: 0,
  error: null,
  lastEvent: 'initial',
};

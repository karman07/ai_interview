export interface MongoState {
  readyState: number;
  error?: string | null;
  lastEvent?: string;
}

export const mongoState: MongoState = {
  readyState: 0,
  error: null,
  lastEvent: 'initial',
};

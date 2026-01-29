
export enum ConversionMode {
  STRING_TO_HEX = 'STRING_TO_HEX',
  HEX_TO_STRING = 'HEX_TO_STRING'
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'zh';

export interface ConverterSettings {
  delimiter: string;
  prefix: string;
  uppercase: boolean;
  liveMode: boolean;
  encoding: 'UTF-8' | 'ASCII';
}

export interface ConversionHistory {
  id: string;
  input: string;
  output: string;
  mode: ConversionMode;
  timestamp: number;
}

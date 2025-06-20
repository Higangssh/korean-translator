import axios from "axios";
import { BaseOnlineTranslationStrategy } from './BaseOnlineTranslationStrategy';

export class GoogleTranslationStrategy extends BaseOnlineTranslationStrategy {
  public readonly name = 'Google Translate';
  public readonly priority = 3;

  constructor() {
    super();
    this.maxRequestsPerDay = 50; // Google은 더 엄격한 제한
  }

  public async translate(text: string): Promise<string> {
    try {
      await this.handleRateLimit();

      const encodedText = encodeURIComponent(text);
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodedText}`,
        {
          timeout: 3000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (response.data && response.data[0] && response.data[0][0]) {
        const translatedText = response.data[0][0][0];
        
        if (this.isValidTranslation(text, translatedText)) {
          console.log(`Google translation success: "${text}" → "${translatedText}"`);
          return translatedText;
        }
      }

      console.log(`Google translation failed for: "${text}"`);
      return text;
    } catch (error: any) {
      console.log(`Google translation error for "${text}":`, error.message);
      return text;
    }
  }

  public canHandle(text: string): boolean {
    if (this.requestCount >= this.maxRequestsPerDay) {
      console.log("Daily Google request limit reached");
      return false;
    }
    return super.canHandle(text) && text.length <= 1000;
  }
} 
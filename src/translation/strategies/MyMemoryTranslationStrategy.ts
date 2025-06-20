import axios from "axios";
import { BaseOnlineTranslationStrategy } from './BaseOnlineTranslationStrategy';

export class MyMemoryTranslationStrategy extends BaseOnlineTranslationStrategy {
  public readonly name = 'MyMemory';
  public readonly priority = 2;

  public async translate(text: string): Promise<string> {
    try {
      await this.handleRateLimit();

      const encodedText = encodeURIComponent(text);
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ko`,
        { timeout: 5000 }
      );

      if (response.data.responseStatus === 200) {
        const translatedText = response.data.responseData.translatedText;
        
        if (this.isValidTranslation(text, translatedText)) {
          console.log(`MyMemory translation success: "${text}" → "${translatedText}"`);
          return translatedText;
        }
      }

      console.log(`MyMemory translation failed for: "${text}"`);
      return text;
    } catch (error: any) {
      console.log(`MyMemory error for "${text}":`, error.message);
      return text;
    }
  }

  public canHandle(text: string): boolean {
    return super.canHandle(text) && text.length <= 500; // MyMemory 길이 제한
  }
} 
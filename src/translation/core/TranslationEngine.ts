import { ITranslationStrategy, TranslationResult } from '../strategies/ITranslationStrategy';
import { TranslationStrategyFactory } from '../factory/TranslationStrategyFactory';
import { TranslationCache } from './TranslationCache';
import { TextValidator } from './TextValidator';
import { TextProcessor } from './TextProcessor';

export class TranslationEngine {
  private readonly factory: TranslationStrategyFactory;
  private readonly cache: TranslationCache;
  private readonly validator: TextValidator;
  private readonly processor: TextProcessor;

  constructor() {
    this.factory = TranslationStrategyFactory.getInstance();
    this.cache = TranslationCache.getInstance();
    this.validator = new TextValidator();
    this.processor = new TextProcessor();
  }

  /**
   * 메인 번역 메서드 - Chain of Responsibility 패턴 구현
   */
  public async translate(text: string): Promise<TranslationResult> {
    const originalText = text;

    // 1. 캐시 확인
    if (this.cache.has(text)) {
      const cachedResult = this.cache.get(text)!;
      console.log(`Cache hit: "${text}" → "${cachedResult}"`);
      return {
        originalText,
        translatedText: cachedResult,
        strategy: 'Cache',
        success: true,
      };
    }

    // 2. 번역 가능성 검증
    if (!this.validator.isTranslatable(text)) {
      console.log(`Skipping translation for: "${text}" (not translatable)`);
      return {
        originalText,
        translatedText: text,
        strategy: 'Validator',
        success: false,
        error: 'Text is not translatable',
      };
    }

    // 3. 텍스트 전처리
    const processedText = this.processor.preprocess(text);
    const textToTranslate = processedText !== text ? processedText : text;

    if (processedText !== text) {
      console.log(`Text preprocessing: "${text}" → "${processedText}"`);
    }

    // 4. 사용 가능한 전략들 가져오기 (우선순위순)
    const availableStrategies = this.factory.getAvailableStrategies(textToTranslate);

    if (availableStrategies.length === 0) {
      return {
        originalText,
        translatedText: text,
        strategy: 'None',
        success: false,
        error: 'No available translation strategies',
      };
    }

    // 5. Chain of Responsibility - 각 전략을 순서대로 시도
    for (const strategy of availableStrategies) {
      try {
        console.log(`Trying ${strategy.name} for: "${textToTranslate}"`);
        const result = await strategy.translate(textToTranslate);

        // 번역이 성공했다면 (원본과 다르다면)
        if (result !== textToTranslate) {
          console.log(`${strategy.name} success: "${textToTranslate}" → "${result}"`);
          
          // 캐시에 저장 (원본 텍스트를 키로 사용)
          this.cache.set(text, result);
          
          return {
            originalText,
            translatedText: result,
            strategy: strategy.name,
            success: true,
          };
        } else {
          console.log(`${strategy.name} returned original text, trying next strategy...`);
        }
      } catch (error: any) {
        console.log(`${strategy.name} failed with error:`, error.message);
        continue;
      }
    }

    // 6. 모든 전략이 실패한 경우
    console.log(`All translation strategies failed for: "${text}"`);
    return {
      originalText,
      translatedText: text,
      strategy: 'All Failed',
      success: false,
      error: 'All translation strategies failed',
    };
  }

  /**
   * 특정 전략만 사용하여 번역
   */
  public async translateWithStrategy(text: string, strategyType: string): Promise<TranslationResult> {
    const strategies = this.factory.getAllStrategies();
    const strategy = strategies.find(s => s.name.toLowerCase() === strategyType.toLowerCase());

    if (!strategy) {
      return {
        originalText: text,
        translatedText: text,
        strategy: 'Unknown',
        success: false,
        error: `Strategy "${strategyType}" not found`,
      };
    }

    if (!strategy.canHandle(text)) {
      return {
        originalText: text,
        translatedText: text,
        strategy: strategy.name,
        success: false,
        error: `Strategy "${strategy.name}" cannot handle this text`,
      };
    }

    try {
      const result = await strategy.translate(text);
      return {
        originalText: text,
        translatedText: result,
        strategy: strategy.name,
        success: result !== text,
      };
    } catch (error: any) {
      return {
        originalText: text,
        translatedText: text,
        strategy: strategy.name,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 사용 가능한 전략 목록 반환
   */
  public getAvailableStrategies(text: string): string[] {
    return this.factory.getAvailableStrategies(text).map(s => s.name);
  }

  /**
   * 캐시 관련 메서드들
   */
  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStatus(): { size: number; requestCount: number } {
    return {
      size: this.cache.size(),
      requestCount: this.cache.getRequestCount(),
    };
  }

  public logCacheStatus(): void {
    this.cache.logStatus();
  }

  /**
   * 주석에서 영어 텍스트 추출 후 번역
   */
  public async translateComment(comment: string): Promise<TranslationResult> {
    const englishText = this.validator.extractEnglishFromComment(comment);
    
    if (!englishText) {
      return {
        originalText: comment,
        translatedText: comment,
        strategy: 'Comment Parser',
        success: false,
        error: 'No English text found in comment',
      };
    }

    return this.translate(englishText);
  }
} 
import { TranslationEngine } from './core/TranslationEngine';
import { TranslationResult } from './strategies/ITranslationStrategy';

/**
 * 번역 서비스 - Facade 패턴
 * 기존 인터페이스와 호환성을 유지하면서 새로운 아키텍처를 사용
 */
export class TranslationService {
  private engine: TranslationEngine;

  constructor() {
    this.engine = new TranslationEngine();
  }

  /**
   * 영어 텍스트를 한국어로 번역 (기존 호환 메서드)
   */
  async translate(text: string): Promise<string> {
    const result = await this.engine.translate(text);
    return result.translatedText;
  }

  /**
   * 상세한 번역 결과 반환
   */
  async translateDetailed(text: string): Promise<TranslationResult> {
    return await this.engine.translate(text);
  }

  /**
   * 특정 전략을 사용하여 번역
   */
  async translateWithStrategy(text: string, strategy: string): Promise<TranslationResult> {
    return await this.engine.translateWithStrategy(text, strategy);
  }

  /**
   * 주석 번역
   */
  async translateComment(comment: string): Promise<TranslationResult> {
    return await this.engine.translateComment(comment);
  }

  /**
   * 사용 가능한 번역 전략 목록
   */
  getAvailableStrategies(text: string): string[] {
    return this.engine.getAvailableStrategies(text);
  }

  /**
   * 캐시 초기화
   */
  public clearCache(): void {
    this.engine.clearCache();
  }

  /**
   * 캐시 상태 확인 (개발용)
   */
  public logCacheStatus(): void {
    this.engine.logCacheStatus();
  }

  /**
   * 캐시 상태 반환
   */
  public getCacheStatus(): { size: number; requestCount: number } {
    return this.engine.getCacheStatus();
  }

  /**
   * 주석에서 영어 텍스트 추출 (기존 호환 메서드)
   */
  extractEnglishFromComment(comment: string): string {
    // TextValidator를 직접 사용하지 않고 translateComment의 결과로 판단
    return comment
      .replace(/^\/\/\s*/, "")
      .replace(/^\/\*\*?\s*/, "")
      .replace(/\*\/\s*$/, "")
      .replace(/^\*\s*/, "")
      .trim();
  }
} 
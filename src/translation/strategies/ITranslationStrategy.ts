export interface ITranslationStrategy {
  /**
   * 번역 전략의 이름
   */
  readonly name: string;

  /**
   * 번역 실행
   * @param text 번역할 텍스트
   * @returns 번역된 텍스트 또는 원본 텍스트
   */
  translate(text: string): Promise<string>;

  /**
   * 이 전략이 주어진 텍스트를 처리할 수 있는지 확인
   * @param text 확인할 텍스트
   * @returns 처리 가능 여부
   */
  canHandle(text: string): boolean;

  /**
   * 전략의 우선순위 (낮을수록 우선)
   */
  readonly priority: number;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  strategy: string;
  success: boolean;
  error?: string;
} 
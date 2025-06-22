import { TranslationService } from '../translation/TranslationService';
import { TranslationCache } from '../translation/core/TranslationCache';

// Mock 번역 전략을 위한 유틸리티
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
}));

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    // 각 테스트 전에 캐시를 리셋합니다
    TranslationCache.resetInstance();
    service = new TranslationService();
  });

  afterEach(() => {
    TranslationCache.resetInstance();
  });

  describe('기본 번역 기능', () => {
    it('번역 서비스 인스턴스를 생성할 수 있다', () => {
      expect(service).toBeDefined();
      expect(service.translate).toBeDefined();
      expect(service.clearCache).toBeDefined();
    });

    it('번역 불가능한 텍스트는 원본을 반환한다', async () => {
      const result = await service.translate('123');
      expect(result).toBe('123');
    });

    it('빈 문자열은 원본을 반환한다', async () => {
      const result = await service.translate('');
      expect(result).toBe('');
    });

    it('한글이 포함된 텍스트는 원본을 반환한다', async () => {
      const koreanText = '안녕하세요';
      const result = await service.translate(koreanText);
      expect(result).toBe(koreanText);
    });
  });

  describe('캐시 기능', () => {
    it('캐시를 초기화할 수 있다', () => {
      expect(() => service.clearCache()).not.toThrow();
    });

    it('캐시 상태를 확인할 수 있다', () => {
      const status = service.getCacheStatus();
      expect(status).toHaveProperty('size');
      expect(status).toHaveProperty('requestCount');
      expect(typeof status.size).toBe('number');
      expect(typeof status.requestCount).toBe('number');
    });

    it('캐시 상태를 로그로 출력할 수 있다', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      service.logCacheStatus();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('상세 번역 기능', () => {
    it('상세한 번역 결과를 반환한다', async () => {
      const result = await service.translateDetailed('123');
      
      expect(result).toHaveProperty('originalText');
      expect(result).toHaveProperty('translatedText');
      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('success');
      
      expect(result.originalText).toBe('123');
      expect(result.translatedText).toBe('123');
      expect(result.success).toBe(false);
    });

    it('번역 가능한 텍스트에 대해 전략 정보를 포함한다', async () => {
      const result = await service.translateDetailed('hello');
      
      expect(result).toHaveProperty('strategy');
      expect(typeof result.strategy).toBe('string');
      expect(result.strategy.length).toBeGreaterThan(0);
    });
  });

  describe('주석 번역 기능', () => {
    it('영어 주석을 번역한다', async () => {
      const result = await service.translateComment('// This is a comment');
      
      expect(result).toHaveProperty('originalText');
      expect(result).toHaveProperty('translatedText');
      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('success');
    });

    it('한글 주석은 번역하지 않는다', async () => {
      const result = await service.translateComment('// 한글 주석입니다');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No English text found');
    });

    it('빈 주석은 번역하지 않는다', async () => {
      const result = await service.translateComment('//');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No English text found');
    });
  });

  describe('전략 관리', () => {
    it('사용 가능한 번역 전략 목록을 반환한다', () => {
      const strategies = service.getAvailableStrategies('hello');
      
      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBeGreaterThan(0);
      
      strategies.forEach(strategy => {
        expect(typeof strategy).toBe('string');
        expect(strategy.length).toBeGreaterThan(0);
      });
    });

    it('번역 불가능한 텍스트는 사용 가능한 전략이 적다', () => {
      const validStrategies = service.getAvailableStrategies('hello');
      const invalidStrategies = service.getAvailableStrategies('123');
      
      expect(validStrategies.length).toBeGreaterThanOrEqual(invalidStrategies.length);
    });

    it('특정 전략으로 번역을 시도할 수 있다', async () => {
      const strategies = service.getAvailableStrategies('hello');
      
      if (strategies.length > 0) {
        const result = await service.translateWithStrategy('hello', strategies[0]);
        
        expect(result).toHaveProperty('originalText');
        expect(result).toHaveProperty('translatedText');
        expect(result).toHaveProperty('strategy');
        expect(result).toHaveProperty('success');
        expect(result.strategy).toBe(strategies[0]);
      }
    });

    it('존재하지 않는 전략으로 번역을 시도하면 오류를 반환한다', async () => {
      const result = await service.translateWithStrategy('hello', 'NonExistentStrategy');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('주석 텍스트 추출', () => {
    it('한 줄 주석에서 영어 텍스트를 추출한다', () => {
      const extracted = service.extractEnglishFromComment('// This is a comment');
      expect(extracted).toBe('This is a comment');
    });

    it('블록 주석에서 영어 텍스트를 추출한다', () => {
      const extracted = service.extractEnglishFromComment('/* Block comment */');
      expect(extracted).toBe('Block comment');
    });

    it('JSDoc 주석에서 영어 텍스트를 추출한다', () => {
      const extracted = service.extractEnglishFromComment('/** JSDoc comment */');
      expect(extracted).toBe('JSDoc comment');
    });

    it('앞뒤 공백을 제거한다', () => {
      const extracted = service.extractEnglishFromComment('//   Spaced comment   ');
      expect(extracted).toBe('Spaced comment');
    });
  });

  describe('에러 처리', () => {
    it('null이나 undefined 입력에 대해 안전하게 처리한다', async () => {
      const nullResult = await service.translate(null as any);
      expect(nullResult).toBe(null);

      const undefinedResult = await service.translate(undefined as any);
      expect(undefinedResult).toBe(undefined);
    });

    it('비정상적인 입력에 대해 적절히 처리한다', async () => {
      // 숫자 입력
      await expect(service.translate(123 as any)).rejects.toThrow();
      
      // boolean 입력
      await expect(service.translate(true as any)).rejects.toThrow();
      
      // 객체 입력
      await expect(service.translate({} as any)).rejects.toThrow();
      
      // 배열 입력
      await expect(service.translate([] as any)).rejects.toThrow();
    });
  });
}); 
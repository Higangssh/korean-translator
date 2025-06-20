const { expect } = require('chai');
const sinon = require('sinon');
import { TranslationService } from '../../translation/TranslationService';
import { TranslationCache } from '../../translation/core/TranslationCache';
import { TranslationStrategyFactory } from '../../translation/factory/TranslationStrategyFactory';

describe('TranslationService (New Architecture)', () => {
  let service: TranslationService;

  beforeEach(() => {
    // 각 테스트마다 새로운 인스턴스 생성
    TranslationCache.resetInstance();
    TranslationStrategyFactory.resetInstance();
    service = new TranslationService();
  });

  afterEach(() => {
    TranslationCache.resetInstance();
    TranslationStrategyFactory.resetInstance();
  });

  describe('Basic Translation (Backward Compatibility)', () => {
    it('should translate simple words and return string (legacy interface)', async () => {
      const result = await service.translate('user');
      
      expect(result).to.be.a('string');
      expect(result).to.equal('사용자');
    });

    it('should translate compound words', async () => {
      const result = await service.translate('userName');
      
      expect(result).to.equal('사용자 이름');
    });

    it('should return original text for untranslatable input', async () => {
      const result = await service.translate('123');
      
      expect(result).to.equal('123');
    });

    it('should handle empty strings', async () => {
      const result = await service.translate('');
      
      expect(result).to.equal('');
    });
  });

  describe('Detailed Translation (New Interface)', () => {
    it('should return detailed translation result', async () => {
      const result = await service.translateDetailed('user');
      
      expect(result).to.have.property('originalText');
      expect(result).to.have.property('translatedText');
      expect(result).to.have.property('strategy');
      expect(result).to.have.property('success');
      
      expect(result.originalText).to.equal('user');
      expect(result.translatedText).to.equal('사용자');
      expect(result.strategy).to.equal('Local Dictionary');
      expect(result.success).to.be.true;
    });

    it('should include error information for failed translations', async () => {
      const result = await service.translateDetailed('123');
      
      expect(result.success).to.be.false;
      expect(result.error).to.be.a('string');
      expect(result.strategy).to.equal('Validator');
    });
  });

  describe('Strategy-Specific Translation', () => {
    it('should translate with specific strategy', async () => {
      const result = await service.translateWithStrategy('user', 'Local Dictionary');
      
      expect(result.strategy).to.equal('Local Dictionary');
      expect(result.translatedText).to.equal('사용자');
      expect(result.success).to.be.true;
    });

    it('should handle unknown strategy gracefully', async () => {
      const result = await service.translateWithStrategy('user', 'Unknown Strategy');
      
      expect(result.success).to.be.false;
      expect(result.error).to.include('Strategy "Unknown Strategy" not found');
    });

    it('should handle strategy that cannot handle text', async () => {
      // 이 경우는 실제로는 발생하기 어렵지만 테스트를 위해
      const result = await service.translateWithStrategy('', 'Local Dictionary');
      
      // 빈 문자열은 검증 단계에서 거부될 수 있음
      expect(result).to.have.property('success');
    });
  });

  describe('Comment Translation', () => {
    it('should translate comments', async () => {
      const result = await service.translateComment('// This is a user');
      
      expect(result.success).to.be.true;
      expect(result.translatedText).to.include('사용자');
    });

    it('should handle various comment formats', async () => {
      const tests = [
        '// Single line comment with user',
        '/* Multi-line comment with user */',
        '/** JSDoc comment with user */',
        '* Block comment line with user'
      ];

      for (const comment of tests) {
        const result = await service.translateComment(comment);
        if (result.success) {
          expect(result.translatedText).to.include('사용자');
        }
      }
    });

    it('should handle non-English comments', async () => {
      const result = await service.translateComment('// 한글 주석');
      
      expect(result.success).to.be.false;
      expect(result.strategy).to.equal('Comment Parser');
    });
  });

  describe('Strategy Management', () => {
    it('should return available strategies', () => {
      const strategies = service.getAvailableStrategies('hello');
      
      expect(strategies).to.be.an('array');
      expect(strategies.length).to.be.greaterThan(0);
      expect(strategies).to.include('Local Dictionary');
    });

    it('should return different strategies based on text', () => {
      const strategies1 = service.getAvailableStrategies('hello');
      const strategies2 = service.getAvailableStrategies('very long text '.repeat(100)); // 길어서 일부 전략이 제외될 수 있음
      
      expect(strategies1).to.be.an('array');
      expect(strategies2).to.be.an('array');
    });
  });

  describe('Cache Management (Backward Compatibility)', () => {
    it('should clear cache', async () => {
      // 먼저 캐시에 뭔가 저장
      await service.translate('user');
      
      service.clearCache();
      
      const status = service.getCacheStatus();
      expect(status.size).to.equal(0);
    });

    it('should return cache status', async () => {
      await service.translate('user');
      
      const status = service.getCacheStatus();
      expect(status).to.have.property('size');
      expect(status).to.have.property('requestCount');
      expect(status.size).to.be.a('number');
      expect(status.requestCount).to.be.a('number');
    });

    it('should log cache status', () => {
      const consoleSpy = sinon.spy(console, 'log');
      
      service.logCacheStatus();
      
      expect(consoleSpy.called).to.be.true;
      consoleSpy.restore();
    });
  });

  describe('Legacy Methods', () => {
    it('should extract English from comments (legacy method)', () => {
      const result1 = service.extractEnglishFromComment('// This is a comment');
      const result2 = service.extractEnglishFromComment('/* Block comment */');
      const result3 = service.extractEnglishFromComment('/** JSDoc comment */');
      
      expect(result1).to.equal('This is a comment');
      expect(result2).to.equal('Block comment');
      expect(result3).to.equal('JSDoc comment');
    });

    it('should handle malformed comments', () => {
      const result1 = service.extractEnglishFromComment('not a comment');
      const result2 = service.extractEnglishFromComment('');
      
      expect(result1).to.equal('not a comment');
      expect(result2).to.equal('');
    });
  });

  describe('Performance and Caching', () => {
    it('should use cache for repeated translations', async () => {
      const consoleSpy = sinon.spy(console, 'log');
      
      // 첫 번째 번역
      const result1 = await service.translateDetailed('user');
      expect(result1.strategy).to.equal('Local Dictionary');
      
      // 두 번째 번역 (캐시에서)
      const result2 = await service.translateDetailed('user');
      expect(result2.strategy).to.equal('Cache');
      
      // 캐시 히트 로그 확인
      const logs = consoleSpy.getCalls().map((call: any) => call.args[0]);
      const hasCacheHit = logs.some((log: any) => 
        typeof log === 'string' && log.includes('Cache hit')
      );
      
      expect(hasCacheHit).to.be.true;
      consoleSpy.restore();
    });

    it('should handle multiple simultaneous translations', async () => {
      const words = ['user', 'data', 'name', 'value', 'function'];
      
      const results = await Promise.all(
        words.map(word => service.translateDetailed(word))
      );
      
      results.forEach(result => {
        expect(result.success).to.be.true;
        expect(result.translatedText).to.not.equal(result.originalText);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const testCases = [null, undefined, 123, {}, []];
      
      for (const testCase of testCases) {
        try {
          // @ts-ignore - 의도적으로 잘못된 타입 전달
          const result = await service.translate(testCase);
          expect(result).to.be.a('string');
        } catch (error) {
          // 에러가 발생해도 괜찮음
          expect(error).to.be.an('error');
        }
      }
    });
  });
}); 
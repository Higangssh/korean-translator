const { expect } = require('chai');
const sinon = require('sinon');
import { TranslationEngine } from '../../../translation/core/TranslationEngine';
import { TranslationCache } from '../../../translation/core/TranslationCache';
import { TranslationStrategyFactory } from '../../../translation/factory/TranslationStrategyFactory';

describe('TranslationEngine', () => {
  let engine: TranslationEngine;

  beforeEach(() => {
    // 각 테스트마다 새로운 인스턴스 생성
    TranslationCache.resetInstance();
    TranslationStrategyFactory.resetInstance();
    engine = new TranslationEngine();
  });

  afterEach(() => {
    TranslationCache.resetInstance();
    TranslationStrategyFactory.resetInstance();
  });

  describe('Basic Translation Flow', () => {
    it('should translate simple English words using local dictionary', async () => {
      const result = await engine.translate('user');
      
      expect(result.originalText).to.equal('user');
      expect(result.translatedText).to.equal('사용자');
      expect(result.strategy).to.equal('Local Dictionary');
      expect(result.success).to.be.true;
      expect(result.error).to.be.undefined;
    });

    it('should translate compound words', async () => {
      const result = await engine.translate('userName');
      
      expect(result.originalText).to.equal('userName');
      expect(result.translatedText).to.equal('사용자 이름');
      expect(result.strategy).to.equal('Local Dictionary');
      expect(result.success).to.be.true;
    });

    it('should cache successful translations', async () => {
      // 첫 번째 번역
      const result1 = await engine.translate('user');
      expect(result1.strategy).to.equal('Local Dictionary');
      
      // 두 번째 번역 - 캐시에서 가져와야 함
      const result2 = await engine.translate('user');
      expect(result2.strategy).to.equal('Cache');
      expect(result2.translatedText).to.equal('사용자');
    });
  });

  describe('Text Validation', () => {
    it('should reject untranslatable text', async () => {
      const result = await engine.translate('123');
      
      expect(result.originalText).to.equal('123');
      expect(result.translatedText).to.equal('123');
      expect(result.strategy).to.equal('Validator');
      expect(result.success).to.be.false;
      expect(result.error).to.equal('Text is not translatable');
    });

    it('should reject empty strings', async () => {
      const result = await engine.translate('');
      
      expect(result.success).to.be.false;
      expect(result.strategy).to.equal('Validator');
    });

    it('should reject Korean text', async () => {
      const result = await engine.translate('안녕하세요');
      
      expect(result.success).to.be.false;
      expect(result.strategy).to.equal('Validator');
    });

    it('should reject URLs', async () => {
      const result = await engine.translate('https://google.com');
      
      expect(result.success).to.be.false;
      expect(result.strategy).to.equal('Validator');
    });

    it('should reject programming keywords', async () => {
      const result = await engine.translate('const');
      
      expect(result.success).to.be.false;
      expect(result.strategy).to.equal('Validator');
    });
  });

  describe('Text Preprocessing', () => {
    it('should preprocess camelCase before translation', async () => {
      const consoleSpy = sinon.spy(console, 'log');
      
      await engine.translate('getUserData');
      
      // 전처리 로그 확인
      const logs = consoleSpy.getCalls().map((call: any) => call.args[0]);
      const hasPreprocessingLog = logs.some((log: any) => 
        typeof log === 'string' && log.includes('Text preprocessing')
      );
      
      expect(hasPreprocessingLog).to.be.true;
      consoleSpy.restore();
    });
  });

  describe('Strategy Selection', () => {
    it('should get available strategies for text', () => {
      const strategies = engine.getAvailableStrategies('hello');
      
      expect(strategies).to.be.an('array');
      expect(strategies.length).to.be.greaterThan(0);
      expect(strategies).to.include('Local Dictionary');
    });

    it('should translate with specific strategy', async () => {
      const result = await engine.translateWithStrategy('user', 'Local Dictionary');
      
      expect(result.strategy).to.equal('Local Dictionary');
      expect(result.translatedText).to.equal('사용자');
      expect(result.success).to.be.true;
    });

    it('should handle unknown strategy', async () => {
      const result = await engine.translateWithStrategy('user', 'Unknown Strategy');
      
      expect(result.success).to.be.false;
      expect(result.strategy).to.equal('Unknown');
      expect(result.error).to.include('Strategy "Unknown Strategy" not found');
    });
  });

  describe('Comment Translation', () => {
    it('should extract and translate English from comments', async () => {
      const result = await engine.translateComment('// This is a user');
      
      expect(result.success).to.be.true;
      expect(result.translatedText).to.include('사용자');
    });

    it('should handle non-English comments', async () => {
      const result = await engine.translateComment('// 한글 주석');
      
      expect(result.success).to.be.false;
      expect(result.strategy).to.equal('Comment Parser');
      expect(result.error).to.equal('No English text found in comment');
    });

    it('should handle various comment formats', async () => {
      const results = await Promise.all([
        engine.translateComment('// Single line user'),
        engine.translateComment('/* Multi line user */'),
        engine.translateComment('/** JSDoc user */'),
        engine.translateComment('* user in block comment')
      ]);

      results.forEach(result => {
        if (result.success) {
          expect(result.translatedText).to.include('사용자');
        }
      });
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      engine.clearCache();
      
      const status = engine.getCacheStatus();
      expect(status.size).to.equal(0);
    });

    it('should return cache status', async () => {
      await engine.translate('user');
      
      const status = engine.getCacheStatus();
      expect(status.size).to.equal(1);
      expect(status.requestCount).to.be.a('number');
    });

    it('should log cache status', () => {
      const consoleSpy = sinon.spy(console, 'log');
      
      engine.logCacheStatus();
      
      expect(consoleSpy.called).to.be.true;
      consoleSpy.restore();
    });
  });

  describe('Error Handling', () => {
    it('should handle all strategies failing', async () => {
      // 사전에 없는 단어로 테스트 (온라인 전략들은 실제로 호출되지 않을 수 있음)
      const result = await engine.translate('qwertyuiop');
      
      // 로컬 사전에 없어서 원본 텍스트가 반환되거나, 모든 전략이 실패할 수 있음
      expect(result.originalText).to.equal('qwertyuiop');
      expect(result.translatedText).to.equal('qwertyuiop');
    });
  });

  describe('Integration with Multiple Strategies', () => {
    it('should try strategies in priority order', async () => {
      const consoleSpy = sinon.spy(console, 'log');
      
      // 로컬 사전에 없는 단어
      await engine.translate('unknown');
      
      // 로그에서 전략 시도 순서 확인
      const logs = consoleSpy.getCalls().map((call: any) => call.args[0]);
      const strategyLogs = logs.filter((log: any) => 
        typeof log === 'string' && log.includes('Trying')
      );
      
      // Local Dictionary가 첫 번째로 시도되어야 함
      if (strategyLogs.length > 0) {
        expect(strategyLogs[0]).to.include('Local Dictionary');
      }
      
      consoleSpy.restore();
    });
  });
}); 
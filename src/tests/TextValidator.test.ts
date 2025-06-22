import { TextValidator } from '../translation/core/TextValidator';

describe('TextValidator', () => {
  let validator: TextValidator;

  beforeEach(() => {
    validator = new TextValidator();
  });

  describe('isTranslatable', () => {
    it('빈 문자열이나 공백은 번역하지 않는다', () => {
      expect(validator.isTranslatable('')).toBe(false);
      expect(validator.isTranslatable('   ')).toBe(false);
      expect(validator.isTranslatable('\n\t')).toBe(false);
    });

    it('숫자만 포함된 텍스트는 번역하지 않는다', () => {
      expect(validator.isTranslatable('123')).toBe(false);
      expect(validator.isTranslatable('12.34')).toBe(false);
      expect(validator.isTranslatable('-45')).toBe(false);
      expect(validator.isTranslatable('0')).toBe(false);
    });

    it('기호나 특수문자만 있는 텍스트는 번역하지 않는다', () => {
      expect(validator.isTranslatable('!@#$%')).toBe(false);
      expect(validator.isTranslatable('+++')).toBe(false);
      expect(validator.isTranslatable('[]{}()')).toBe(false);
    });

    it('3글자 미만의 텍스트는 번역하지 않는다', () => {
      expect(validator.isTranslatable('ab')).toBe(false);
      expect(validator.isTranslatable('x')).toBe(false);
      expect(validator.isTranslatable('hi')).toBe(false);
    });

    it('한글이 포함된 텍스트는 번역하지 않는다', () => {
      expect(validator.isTranslatable('hello 안녕')).toBe(false);
      expect(validator.isTranslatable('안녕하세요')).toBe(false);
      expect(validator.isTranslatable('test테스트')).toBe(false);
    });

    it('URL이나 도메인은 번역하지 않는다', () => {
      expect(validator.isTranslatable('https://google.com')).toBe(false);
      expect(validator.isTranslatable('www.example.com')).toBe(false);
      expect(validator.isTranslatable('example.com')).toBe(false);
      expect(validator.isTranslatable('localhost:3000')).toBe(false);
      expect(validator.isTranslatable('192.168.1.1')).toBe(false);
    });

    it('파일 확장자는 번역하지 않는다', () => {
      expect(validator.isTranslatable('.js')).toBe(false);
      expect(validator.isTranslatable('.tsx')).toBe(false);
      expect(validator.isTranslatable('.json')).toBe(false);
    });

    it('색상 코드는 번역하지 않는다', () => {
      expect(validator.isTranslatable('#ffffff')).toBe(false);
      expect(validator.isTranslatable('#123')).toBe(false);
      expect(validator.isTranslatable('rgb(255, 0, 0)')).toBe(false);
      expect(validator.isTranslatable('rgba(0, 0, 0, 0.5)')).toBe(false);
    });

    it('스킵 단어들은 번역하지 않는다', () => {
      expect(validator.isTranslatable('var')).toBe(false);
      expect(validator.isTranslatable('const')).toBe(false);
      expect(validator.isTranslatable('div')).toBe(false);
      expect(validator.isTranslatable('true')).toBe(false);
      expect(validator.isTranslatable('null')).toBe(false);
    });

    it('번역할 수 없는 약어는 번역하지 않는다', () => {
      expect(validator.isTranslatable('HTML')).toBe(false);
      expect(validator.isTranslatable('CSS')).toBe(false);
      expect(validator.isTranslatable('JS')).toBe(false);
    });

    it('번역 가능한 약어는 번역한다', () => {
      expect(validator.isTranslatable('API')).toBe(true);
      expect(validator.isTranslatable('URL')).toBe(true);
      expect(validator.isTranslatable('AWS')).toBe(true);
      expect(validator.isTranslatable('SQL')).toBe(true);
    });

    it('100자 이상의 텍스트는 번역하지 않는다', () => {
      const longText = 'a'.repeat(101);
      expect(validator.isTranslatable(longText)).toBe(false);
    });

    it('유효한 영어 단어나 구문은 번역한다', () => {
      expect(validator.isTranslatable('hello')).toBe(true);
      expect(validator.isTranslatable('getUserData')).toBe(true);
      expect(validator.isTranslatable('user_name')).toBe(true);
      expect(validator.isTranslatable('MAX_COUNT')).toBe(true);
      expect(validator.isTranslatable('hello world')).toBe(true);
      expect(validator.isTranslatable('create new user')).toBe(true);
    });

    it('camelCase 명명은 번역한다', () => {
      expect(validator.isTranslatable('userName')).toBe(true);
      expect(validator.isTranslatable('getUserInfo')).toBe(true);
      expect(validator.isTranslatable('handleSubmitButton')).toBe(true);
    });

    it('snake_case 명명은 번역한다', () => {
      expect(validator.isTranslatable('user_name')).toBe(true);
      expect(validator.isTranslatable('get_user_data')).toBe(true);
      expect(validator.isTranslatable('calculate_total_price')).toBe(true);
    });

    it('CONSTANT_CASE 명명은 번역한다', () => {
      expect(validator.isTranslatable('MAX_COUNT')).toBe(true);
      expect(validator.isTranslatable('API_BASE_URL')).toBe(true);
      expect(validator.isTranslatable('USER_PERMISSIONS')).toBe(true);
    });
  });

  describe('extractEnglishFromComment', () => {
    it('한 줄 주석에서 영어 텍스트를 추출한다', () => {
      expect(validator.extractEnglishFromComment('// This is a comment')).toBe('This is a comment');
      expect(validator.extractEnglishFromComment('//   Get user data')).toBe('Get user data');
    });

    it('블록 주석에서 영어 텍스트를 추출한다', () => {
      expect(validator.extractEnglishFromComment('/* This is a block comment */')).toBe('This is a block comment');
      expect(validator.extractEnglishFromComment('/** JSDoc comment */')).toBe('JSDoc comment');
    });

    it('영어가 아닌 주석은 빈 문자열을 반환한다', () => {
      expect(validator.extractEnglishFromComment('// 한글 주석입니다')).toBe('');
      expect(validator.extractEnglishFromComment('// 123456')).toBe('');
      expect(validator.extractEnglishFromComment('// mixed 한글 text')).toBe('');
    });

    it('빈 주석은 빈 문자열을 반환한다', () => {
      expect(validator.extractEnglishFromComment('//')).toBe('');
      expect(validator.extractEnglishFromComment('/* */')).toBe('');
      expect(validator.extractEnglishFromComment('/**/')).toBe('');
    });
  });
}); 
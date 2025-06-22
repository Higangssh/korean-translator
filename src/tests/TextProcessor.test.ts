import { TextProcessor } from '../translation/core/TextProcessor';

describe('TextProcessor', () => {
  let processor: TextProcessor;

  beforeEach(() => {
    processor = new TextProcessor();
  });

  describe('convertToSpaces', () => {
    it('CONSTANT_CASE를 소문자 공백 구분으로 변환한다', () => {
      expect(processor.convertToSpaces('MAX_COUNT')).toBe('max count');
      expect(processor.convertToSpaces('API_BASE_URL')).toBe('api base url');
      expect(processor.convertToSpaces('USER_PERMISSIONS')).toBe('user permissions');
      expect(processor.convertToSpaces('S3_UPLOAD_BUCKET_URL')).toBe('s3 upload bucket url');
    });

    it('snake_case를 공백 구분으로 변환한다', () => {
      expect(processor.convertToSpaces('user_name')).toBe('user name');
      expect(processor.convertToSpaces('get_user_data')).toBe('get user data');
      expect(processor.convertToSpaces('calculate_total_price')).toBe('calculate total price');
    });

    it('kebab-case를 공백 구분으로 변환한다', () => {
      expect(processor.convertToSpaces('user-name')).toBe('user name');
      expect(processor.convertToSpaces('get-user-data')).toBe('get user data');
      expect(processor.convertToSpaces('calculate-total-price')).toBe('calculate total price');
    });

    it('camelCase를 소문자 공백 구분으로 변환한다', () => {
      expect(processor.convertToSpaces('userName')).toBe('user name');
      expect(processor.convertToSpaces('getUserData')).toBe('get user data');
      expect(processor.convertToSpaces('calculateTotalPrice')).toBe('calculate total price');
      expect(processor.convertToSpaces('handleSubmitButton')).toBe('handle submit button');
    });

    it('PascalCase를 소문자 공백 구분으로 변환한다', () => {
      expect(processor.convertToSpaces('UserName')).toBe('user name');
      expect(processor.convertToSpaces('GetUserData')).toBe('get user data');
      expect(processor.convertToSpaces('CalculateTotalPrice')).toBe('calculate total price');
    });

    it('연속된 대문자를 올바르게 처리한다', () => {
      expect(processor.convertToSpaces('XMLHttpRequest')).toBe('xml http request');
      expect(processor.convertToSpaces('HTTPSConnection')).toBe('https connection');
      expect(processor.convertToSpaces('URLPattern')).toBe('url pattern');
    });

    it('숫자가 포함된 케이스를 처리한다', () => {
      expect(processor.convertToSpaces('user2Name')).toBe('user2name');
      expect(processor.convertToSpaces('version1Alpha')).toBe('version1alpha');
    });

    it('일반 텍스트는 그대로 반환한다', () => {
      expect(processor.convertToSpaces('hello world')).toBe('hello world');
      expect(processor.convertToSpaces('simple text')).toBe('simple text');
    });
  });

  describe('splitWords', () => {
    it('CONSTANT_CASE를 단어별로 분리한다', () => {
      expect(processor.splitWords('MAX_COUNT')).toEqual(['MAX', 'COUNT']);
      expect(processor.splitWords('API_BASE_URL')).toEqual(['API', 'BASE', 'URL']);
      expect(processor.splitWords('USER_PERMISSIONS')).toEqual(['USER', 'PERMISSIONS']);
    });

    it('snake_case를 단어별로 분리한다', () => {
      expect(processor.splitWords('user_name')).toEqual(['user', 'name']);
      expect(processor.splitWords('get_user_data')).toEqual(['get', 'user', 'data']);
      expect(processor.splitWords('calculate_total_price')).toEqual(['calculate', 'total', 'price']);
    });

    it('kebab-case를 단어별로 분리한다', () => {
      expect(processor.splitWords('user-name')).toEqual(['user', 'name']);
      expect(processor.splitWords('get-user-data')).toEqual(['get', 'user', 'data']);
      expect(processor.splitWords('calculate-total-price')).toEqual(['calculate', 'total', 'price']);
    });

    it('camelCase를 단어별로 분리한다', () => {
      expect(processor.splitWords('userName')).toEqual(['user', 'Name']);
      expect(processor.splitWords('getUserData')).toEqual(['get', 'User', 'Data']);
      expect(processor.splitWords('calculateTotalPrice')).toEqual(['calculate', 'Total', 'Price']);
    });

    it('PascalCase를 단어별로 분리한다', () => {
      expect(processor.splitWords('UserName')).toEqual(['User', 'Name']);
      expect(processor.splitWords('GetUserData')).toEqual(['Get', 'User', 'Data']);
      expect(processor.splitWords('CalculateTotalPrice')).toEqual(['Calculate', 'Total', 'Price']);
    });

    it('빈 요소를 필터링한다', () => {
      expect(processor.splitWords('user__name')).toEqual(['user__name']);
      expect(processor.splitWords('USER__COUNT')).toEqual(['USER', 'COUNT']);
    });
  });

  describe('isConvertibleCase', () => {
    it('CONSTANT_CASE를 감지한다', () => {
      expect(processor.isConvertibleCase('MAX_COUNT')).toBe(true);
      expect(processor.isConvertibleCase('API_BASE_URL')).toBe(true);
      expect(processor.isConvertibleCase('USER_PERMISSIONS')).toBe(true);
    });

    it('snake_case를 감지한다', () => {
      expect(processor.isConvertibleCase('user_name')).toBe(true);
      expect(processor.isConvertibleCase('get_user_data')).toBe(true);
      expect(processor.isConvertibleCase('calculate_total_price')).toBe(true);
    });

    it('kebab-case를 감지한다', () => {
      expect(processor.isConvertibleCase('user-name')).toBe(true);
      expect(processor.isConvertibleCase('get-user-data')).toBe(true);
      expect(processor.isConvertibleCase('calculate-total-price')).toBe(true);
    });

    it('camelCase를 감지한다', () => {
      expect(processor.isConvertibleCase('userName')).toBe(true);
      expect(processor.isConvertibleCase('getUserData')).toBe(true);
      expect(processor.isConvertibleCase('calculateTotalPrice')).toBe(true);
    });

    it('PascalCase를 감지한다', () => {
      expect(processor.isConvertibleCase('UserName')).toBe(true);
      expect(processor.isConvertibleCase('GetUserData')).toBe(true);
      expect(processor.isConvertibleCase('CalculateTotalPrice')).toBe(true);
    });

    it('변환할 수 없는 케이스를 구분한다', () => {
      expect(processor.isConvertibleCase('hello world')).toBe(false);
      expect(processor.isConvertibleCase('123')).toBe(false);
      expect(processor.isConvertibleCase('mixed_Case-text')).toBe(false);
      expect(processor.isConvertibleCase('special!@#')).toBe(false);
    });
  });

  describe('detectCaseType', () => {
    it('CONSTANT_CASE를 올바르게 감지한다', () => {
      expect(processor.detectCaseType('MAX_COUNT')).toBe('CONSTANT_CASE');
      expect(processor.detectCaseType('API_BASE_URL')).toBe('CONSTANT_CASE');
      expect(processor.detectCaseType('USER_PERMISSIONS')).toBe('CONSTANT_CASE');
    });

    it('snake_case를 올바르게 감지한다', () => {
      expect(processor.detectCaseType('user_name')).toBe('snake_case');
      expect(processor.detectCaseType('get_user_data')).toBe('snake_case');
      expect(processor.detectCaseType('calculate_total_price')).toBe('snake_case');
    });

    it('kebab-case를 올바르게 감지한다', () => {
      expect(processor.detectCaseType('user-name')).toBe('kebab-case');
      expect(processor.detectCaseType('get-user-data')).toBe('kebab-case');
      expect(processor.detectCaseType('calculate-total-price')).toBe('kebab-case');
    });

    it('camelCase를 올바르게 감지한다', () => {
      expect(processor.detectCaseType('userName')).toBe('camelCase');
      expect(processor.detectCaseType('getUserData')).toBe('camelCase');
      expect(processor.detectCaseType('calculateTotalPrice')).toBe('camelCase');
    });

    it('PascalCase를 올바르게 감지한다', () => {
      expect(processor.detectCaseType('UserName')).toBe('PascalCase');
      expect(processor.detectCaseType('GetUserData')).toBe('PascalCase');
      expect(processor.detectCaseType('CalculateTotalPrice')).toBe('PascalCase');
    });

    it('알 수 없는 케이스는 unknown을 반환한다', () => {
      expect(processor.detectCaseType('hello world')).toBe('unknown');
      expect(processor.detectCaseType('123')).toBe('unknown');
      expect(processor.detectCaseType('mixed_Case-text')).toBe('unknown');
      expect(processor.detectCaseType('special!@#')).toBe('unknown');
    });
  });

  describe('preprocess', () => {
    it('변환 가능한 케이스는 전처리한다', () => {
      expect(processor.preprocess('userName')).toBe('user name');
      expect(processor.preprocess('MAX_COUNT')).toBe('max count');
      expect(processor.preprocess('user_name')).toBe('user name');
      expect(processor.preprocess('user-name')).toBe('user name');
    });

    it('변환할 수 없는 케이스는 그대로 반환한다', () => {
      expect(processor.preprocess('hello world')).toBe('hello world');
      expect(processor.preprocess('123')).toBe('123');
      expect(processor.preprocess('special!@#')).toBe('special!@#');
    });

    it('빈 문자열도 처리한다', () => {
      expect(processor.preprocess('')).toBe('');
    });

    it('단일 문자도 처리한다', () => {
      expect(processor.preprocess('a')).toBe('a');
      expect(processor.preprocess('A')).toBe('a');
    });
  });

  describe('엣지 케이스', () => {
    it('숫자가 포함된 변수명을 처리한다', () => {
      expect(processor.convertToSpaces('user2Name')).toBe('user2name');
      expect(processor.convertToSpaces('version1Alpha')).toBe('version1alpha');
      expect(processor.detectCaseType('user2Name')).toBe('camelCase');
    });

    it('연속된 언더스코어나 하이픈을 처리한다', () => {
      expect(processor.splitWords('user__name')).toEqual(['user__name']);
      expect(processor.splitWords('user--name')).toEqual(['user--name']);
    });

    it('시작이나 끝에 구분자가 있는 경우를 처리한다', () => {
      // 이런 케이스들은 일반적으로 유효한 케이스가 아니므로 unknown으로 분류됩니다
      expect(processor.detectCaseType('_userName')).toBe('unknown');
      expect(processor.detectCaseType('userName_')).toBe('unknown');
      expect(processor.detectCaseType('-userName')).toBe('unknown');
      expect(processor.detectCaseType('userName-')).toBe('unknown');
    });

    it('매우 긴 변수명도 처리한다', () => {
      const longCamelCase = 'veryLongCamelCaseVariableNameWithManyWords';
      expect(processor.isConvertibleCase(longCamelCase)).toBe(true);
      expect(processor.detectCaseType(longCamelCase)).toBe('camelCase');
      expect(processor.convertToSpaces(longCamelCase)).toBe('very long camel case variable name with many words');
    });
  });
}); 
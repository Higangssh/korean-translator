export class TextProcessor {
  /**
   * 다양한 케이스를 띄어쓰기로 변환
   */
  public convertToSpaces(text: string): string {
    // CONSTANT_CASE (S3_UPLOAD_BUCKET_URL)
    if (/^[A-Z][A-Z0-9_]*$/.test(text)) {
      return text.split('_').join(' ').toLowerCase();
    }
    
    // snake_case (user_auth_token)
    if (/^[a-z]+(_[a-z]+)*$/.test(text)) {
      return text.split('_').join(' ');
    }
    
    // kebab-case (user-auth-token)
    if (/^[a-z]+(-[a-z]+)*$/.test(text)) {
      return text.split('-').join(' ');
    }
    
    // camelCase, PascalCase
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .toLowerCase();
  }

  /**
   * 다양한 케이스의 문자열을 단어별로 분리
   */
  public splitWords(text: string): string[] {
    // CONSTANT_CASE (S3_UPLOAD_BUCKET_URL)
    if (/^[A-Z][A-Z0-9_]*$/.test(text)) {
      return text.split('_').filter(word => word.length > 0);
    }
    
    // snake_case (user_auth_token)
    if (/^[a-z]+(_[a-z]+)*$/.test(text)) {
      return text.split('_').filter(word => word.length > 0);
    }
    
    // kebab-case (user-auth-token)
    if (/^[a-z]+(-[a-z]+)*$/.test(text)) {
      return text.split('-').filter(word => word.length > 0);
    }
    
    // camelCase, PascalCase
    return text.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
  }

  /**
   * 문자열이 변환 가능한 케이스인지 확인
   */
  public isConvertibleCase(text: string): boolean {
    const isConstantCase = /^[A-Z][A-Z0-9_]*$/.test(text);
    const isSnakeCase = /^[a-z]+(_[a-z]+)*$/.test(text);
    const isKebabCase = /^[a-z]+(-[a-z]+)*$/.test(text);
    const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(text);
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(text);

    return isConstantCase || isSnakeCase || isKebabCase || isCamelCase || isPascalCase;
  }

  /**
   * 텍스트를 번역하기 좋은 형태로 전처리
   */
  public preprocess(text: string): string {
    if (!this.isConvertibleCase(text)) {
      return text;
    }

    const spacedText = this.convertToSpaces(text);
    return spacedText !== text ? spacedText : text;
  }

  /**
   * 특정 케이스 타입 감지
   */
  public detectCaseType(text: string): string {
    if (/^[A-Z][A-Z0-9_]*$/.test(text)) {
      return 'CONSTANT_CASE';
    }
    if (/^[a-z]+(_[a-z]+)*$/.test(text)) {
      return 'snake_case';
    }
    if (/^[a-z]+(-[a-z]+)*$/.test(text)) {
      return 'kebab-case';
    }
    if (/^[a-z][a-zA-Z0-9]*$/.test(text)) {
      return 'camelCase';
    }
    if (/^[A-Z][a-zA-Z0-9]*$/.test(text)) {
      return 'PascalCase';
    }
    return 'unknown';
  }
} 
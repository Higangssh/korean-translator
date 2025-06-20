import axios from "axios";

export class TranslationService {
  private cache: Map<string, string> = new Map();
  private failureCache: Set<string> = new Set();
  private requestCount = 0;
  private lastRequestTime = 0;

  /**
   * 캐시 초기화
   */
  public clearCache(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    this.requestCount = 0;
    console.log(`Cache cleared! Removed ${cacheSize} entries.`);
  }

  /**
   * 캐시 상태 확인 (개발용)
   */
  public logCacheStatus(): void {
    console.log(
      `Cache entries: ${this.cache.size}, Requests: ${this.requestCount}`
    );
    if (this.cache.size > 0) {
      this.cache.forEach((value, key) => {
        console.log(`"${key}" → "${value}"`);
      });
    }
  }

  /**
   * 영어 텍스트를 한국어로 번역
   * 1. 로컬 사전 → 2. MyMemory → 3. Google Translate → 4. LibreTranslate 순으로 시도
   */
  async translate(text: string): Promise<string> {
    text = text.toLowerCase();
    // 캐시 확인
    if (this.cache.has(text)) {
      console.log(`Cache hit: "${text}" → "${this.cache.get(text)}"`);
      return this.cache.get(text)!;
    }

    if (this.failureCache.has(text)) {
      console.log(` Previously failed translation: "${text}"`);
      return "번역 실패";
    }

    if (!this.shouldTranslate(text)) {
      console.log(`Skipping translation for: "${text}" (not translatable)`);
      return text;
    }

    // 요청 제한 (1초에 1회)
    const now = Date.now();
    if (now - this.lastRequestTime < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    this.lastRequestTime = Date.now();

    try {
      // 1단계: 로컬 사전 시도
      console.log(`Trying local dictionary for: "${text}"`);
      const localTranslation = this.translateLocally(text);

      if (localTranslation !== text && typeof localTranslation === "string") {
        const hasUntranslatedWords = localTranslation.match(/[a-zA-Z]{4,}/g);

        if (!hasUntranslatedWords) {
          console.log(
            `Local translation success: "${text}" → "${localTranslation}"`
          );
          this.cache.set(text, localTranslation);
          return localTranslation;
        } else {
          console.log(
            `Partial translation: "${text}" → "${localTranslation}", trying online...`
          );
        }
      } else {
        console.log(`Local translation failed for: "${text}"`);
      }

      // 다양한 케이스를 띄어쓰기로 변환
      const spacedText = this.convertToSpaces(text);
      const textToTranslate = spacedText !== text ? spacedText : text;

      if (spacedText !== text) {
        console.log(
          `Converting "${text}" → "${spacedText}" for better online translation`
        );
      }

      // 2단계: MyMemory
      console.log(`Trying MyMemory for: "${textToTranslate}"`);
      const memoryResult = await this.translateWithMyMemory(textToTranslate);
      if (memoryResult !== textToTranslate) {
        console.log(
          `MyMemory success: "${textToTranslate}" → "${memoryResult}"`
        );
        // 한글이 포함된 경우에만 캐시 저장
        if (/[가-힣]/.test(memoryResult)) {
          this.cache.set(text, memoryResult);
        } else {
          console.log(`Not caching result - no Korean characters found`);
        }
        return memoryResult;
      }
      console.log(`MyMemory failed, trying next service...`);

      // 3단계: 구글 번역
      console.log(`Trying Google Translate for: "${textToTranslate}"`);
      const googleResult = await this.translateWithGoogleScraping(
        textToTranslate
      );
      if (googleResult !== textToTranslate) {
        console.log(
          `Google translation success: "${textToTranslate}" → "${googleResult}"`
        );
        // 한글이 포함된 경우에만 캐시 저장
        if (/[가-힣]/.test(googleResult)) {
          this.cache.set(text, googleResult);
        } else {
          console.log(`Not caching Google result - no Korean characters found`);
        }
        return googleResult;
      }
      console.log(`Google translation failed, trying last service...`);
      // 4단계: Lingva Translate
      console.log(`Trying Lingva Translate for: "${textToTranslate}"`);
      const lingvaResult = await this.translateWithLingva(textToTranslate);
      if (lingvaResult !== textToTranslate) {
        if (/[가-힣]/.test(lingvaResult)) {
          this.cache.set(text, lingvaResult);
          return lingvaResult;
        } else {
          console.log(`Not caching Lingva result - no Korean characters found`);
        }
      }

      // 5단계: FreeTranslate
      console.log(`Trying FreeTranslate for: "${textToTranslate}"`);
      const freeResult = await this.translateWithFreeTranslate(textToTranslate);
      if (freeResult !== textToTranslate) {
        if (/[가-힣]/.test(freeResult)) {
          this.cache.set(text, freeResult);
          return freeResult;
        } else {
          console.log(
            `Not caching FreeTranslate result - no Korean characters found`
          );
        }
      }
      // 6단계: LibreTranslate
      console.log(`Trying LibreTranslate for: "${textToTranslate}"`);
      const libreResult = await this.translateWithLibre(textToTranslate);
      console.log(
        `LibreTranslate result: "${textToTranslate}" → "${libreResult}"`
      );
      // 한글이 포함된 경우에만 캐시 저장
      if (/[가-힣]/.test(libreResult)) {
        this.cache.set(text, libreResult);
        return libreResult;
      } else {
        console.log(`Not caching Libre result - no Korean characters found`);

        // 5단계: 복합 단어 직접 번역 시도 (모든 온라인 번역이 실패한 경우)
        const words = this.splitWords(text);
        if (words.length > 1) {
          console.log(`Trying manual compound word translation for: "${text}"`);
          const translatedParts = words.map((word) => {
            const localResult = this.translateLocally(word.toLowerCase());
            return localResult !== word.toLowerCase() ? localResult : word;
          });

          // 적어도 하나의 단어가 번역되었는지 확인
          const hasTranslation = translatedParts.some((part, idx) => {
            return part !== words[idx];
          });

          if (hasTranslation) {
            const manualResult = translatedParts.join(" ");
            console.log(
              `Manual translation success: "${text}" → "${manualResult}"`
            );
            this.cache.set(text, manualResult);
            return manualResult;
          }
        }
      }
      this.failureCache.add(text);
      console.log(`Translation completely failed for "${text}"`);
      return "번역 실패";
    } catch (error) {
      console.error(`Translation completely failed for "${text}":`, error);
      this.failureCache.add(text);
      console.log(`Translation completely failed for "${text}"`);
      return "번역 실패";
    }
  }

  /**
   * 번역이 필요한 텍스트인지 판단
   */
  private shouldTranslate(text: string): boolean {
    // 빈 문자열이나 공백만 있는 경우
    if (!text || text.trim().length === 0) {
      return false;
    }

    // 숫자만 있는 경우 (정수, 소수, 음수 포함)
    if (/^-?\d+(\.\d+)?$/.test(text.trim())) {
      return false;
    }

    // 단순 기호나 특수문자만 있는 경우
    if (/^[^\w\s]+$/.test(text)) {
      return false;
    }

    // 너무 짧은 텍스트 (1-2글자)
    if (text.trim().length < 3) {
      return false;
    }

    // 이미 한글이 포함된 경우
    if (/[가-힣]/.test(text)) {
      return false;
    }

    // URL, 도메인, IP 주소 등을 더 엄격하게 필터링
    if (this.isUrlOrDomain(text)) {
      return false;
    }

    // 파일 확장자인 경우
    if (/^\.[a-z0-9]+$/i.test(text)) {
      return false;
    }

    // 색상 코드인 경우
    if (/^#[0-9a-fA-F]{3,8}$|^rgb\(|^rgba\(|^hsl\(/.test(text)) {
      return false;
    }

    // 번역이 의미없는 프로그래밍 키워드들 (확장)
    const skipWords = [
      // CSS 단위
      "px",
      "em",
      "rem",
      "vh",
      "vw",
      "%",
      "pt",
      "pc",
      "in",
      "cm",
      "mm",
      // 기본 키워드
      "var",
      "let",
      "const",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "true",
      "false",
      "null",
      "undefined",
      "void",
      "typeof",
      "instanceof",
      // HTML 태그
      "div",
      "span",
      "img",
      "src",
      "alt",
      "href",
      "id",
      "class",
      "style",
      "input",
      "button",
      "form",
      "table",
      "tr",
      "td",
      "th",
      "ul",
      "li",
      "ol",
      // 파일 형식
      "css",
      "js",
      "html",
      "xml",
      "json",
      "svg",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "zip",
      "rar",
      // 네트워크/프로토콜
      "http",
      "https",
      "ftp",
      "ssh",
      "tcp",
      "udp",
      "ip",
      "dns",
      "cdn",
      "www",
      "com",
      "org",
      "net",
      "edu",
      "gov",
      "io",
      "dev",
      "app",
      // 시스템/환경
      "localhost",
      "admin",
      "root",
      "user",
      "temp",
      "tmp",
      "bin",
      "lib",
      "src",
      "dist",
      "build",
      "node",
      "npm",
      "yarn",
      "git",
      "svn",
    ];

    if (skipWords.includes(text.toLowerCase())) {
      return false;
    }

    // 다양한 명명 케이스 패턴 확인
    const isConstantCase = /^[A-Z][A-Z0-9_]*$/.test(text); // S3_UPLOAD_BUCKET_URL
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(text); // UserAuthToken
    const isSnakeCase = /^[a-z]+(_[a-z]+)*$/.test(text); // user_auth_token
    const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(text); // userAuthToken
    const isKebabCase = /^[a-z]+(-[a-z]+)*$/.test(text); // user-auth-token
    const isUnderscorePrefix = /^_[a-zA-Z][a-zA-Z0-9]*$/.test(text); // _valuetobuffer

    // 영어로 시작하거나 명명 케이스 패턴 중 하나라면 번역 대상
    if (
      !/^[a-zA-Z_]/.test(text) &&
      !isConstantCase &&
      !isSnakeCase &&
      !isKebabCase &&
      !isUnderscorePrefix
    ) {
      return false;
    }

    // 너무 긴 텍스트 (100자 이상)
    if (text.length > 100) {
      return false;
    }

    // 단순한 약어나 축약어는 번역하지 않음 (모두 대문자이고 짧은 경우)
    if (/^[A-Z]{2,5}$/.test(text) && !this.isTranslatableAcronym(text)) {
      return false;
    }

    return true;
  }

  /**
   * URL, 도메인, IP 주소 등을 판별
   */
  private isUrlOrDomain(text: string): boolean {
    // 기본 URL 패턴
    if (/^https?:\/\/|^ftp:\/\/|^www\./i.test(text)) {
      return true;
    }

    // 도메인명 패턴 (점이 포함되고 도메인 확장자가 있는 경우)
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
      return true;
    }

    // IP 주소 패턴
    if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(text)) {
      return true;
    }

    // 포트 번호가 포함된 도메인
    if (/^[a-zA-Z0-9.-]+:\d+/.test(text)) {
      return true;
    }

    // 경로나 쿼리 파라미터가 포함된 경우
    if (/[\/\?&#=]/.test(text) && text.includes(".")) {
      return true;
    }

    return false;
  }

  /**
   * 번역 가능한 약어인지 판별
   */
  private isTranslatableAcronym(text: string): boolean {
    const translatableAcronyms = [
      "API",
      "URL",
      "AWS",
      "GCP",
      "SQL",
      "JWT",
      "UUID",
    ];
    return translatableAcronyms.includes(text.toUpperCase());
  }

  /**
   * 다양한 케이스를 띄어쓰기로 변환
   */
  private convertToSpaces(text: string): string {
    // 언더스코어로 시작하는 경우 (_valuetobuffer)
    if (/^_[a-zA-Z]/.test(text)) {
      const withoutUnderscore = text.slice(1); // 언더스코어 제거
      return this.convertToSpaces(withoutUnderscore); // 재귀 호출로 처리
    }

    // CONSTANT_CASE (S3_UPLOAD_BUCKET_URL)
    if (/^[A-Z][A-Z0-9_]*$/.test(text)) {
      return text.split("_").join(" ").toLowerCase();
    }

    // snake_case (user_auth_token)
    if (/^[a-z]+(_[a-z]+)*$/.test(text)) {
      return text.split("_").join(" ");
    }

    // kebab-case (user-auth-token)
    if (/^[a-z]+(-[a-z]+)*$/.test(text)) {
      return text.split("-").join(" ");
    }

    // camelCase, PascalCase
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .toLowerCase();
  }

  /**
   * 로컬 사전을 이용한 번역 (핵심 프로그래밍 용어)
   */
  private translateLocally(text: string): string {
    const coreDict: { [key: string]: string } = {
      // 핵심 프로그래밍 용어
      function: "함수",
      method: "메서드",
      class: "클래스",
      constructor: "생성자",
      variable: "변수",
      constant: "상수",
      array: "배열",
      object: "객체",
      string: "문자열",
      number: "숫자",
      boolean: "불린",
      null: "널",
      undefined: "정의되지않음",
      any: "임의",
      type: "타입",
      interface: "인터페이스",
      resource: "리소스",

      // 사용자 관련
      user: "사용자",
      users: "사용자들",
      admin: "관리자",
      guest: "게스트",
      member: "회원",
      account: "계정",
      profile: "프로필",

      // 데이터 관련
      data: "데이터",
      info: "정보",
      information: "정보",
      name: "이름",
      value: "값",
      values: "값들",
      key: "키",
      index: "인덱스",
      length: "길이",
      size: "크기",
      count: "개수",
      total: "총합",
      frame: "프레임",
      rate: "속도",
      base: "기반",
      handler: "처리기",
      builder: "빌더",
      stream: "스트림",

      // 동작 관련
      get: "가져오다",
      set: "설정하다",
      add: "추가하다",
      remove: "제거하다",
      create: "생성하다",
      delete: "삭제하다",
      update: "업데이트하다",
      save: "저장하다",
      load: "로드하다",
      find: "찾다",
      search: "검색하다",
      filter: "필터링하다",
      sort: "정렬하다",

      // 제어문
      if: "만약",
      else: "그렇지않으면",
      for: "반복",
      while: "동안",
      try: "시도",
      catch: "잡기",
      error: "오류",
      return: "반환",
      import: "가져오기",
      export: "내보내기",

      // 상태 관련
      new: "새로운",
      old: "오래된",
      current: "현재",
      previous: "이전",
      next: "다음",
      first: "첫번째",
      last: "마지막",
      start: "시작",
      end: "끝",
      begin: "시작하다",
      finish: "끝내다",

      // 불린 값
      true: "참",
      false: "거짓",
      yes: "예",
      no: "아니오",
      enable: "활성화",
      disable: "비활성화",
      show: "보이기",
      hide: "숨기기",

      // 클라우드/인프라 용어
      s3: "S3",
      aws: "AWS",
      azure: "Azure",
      gcp: "GCP",
      upload: "업로드",
      download: "다운로드",
      bucket: "버킷",
      storage: "저장소",
      database: "데이터베이스",
      db: "DB",
      server: "서버",
      client: "클라이언트",
      host: "호스트",
      port: "포트",

      // API 관련
      api: "API",
      endpoint: "엔드포인트",
      request: "요청",
      response: "응답",
      post: "POST",
      put: "PUT",
      patch: "PATCH",

      // 설정 관련
      config: "설정",
      configuration: "구성",
      env: "환경변수",
      environment: "환경",
      development: "개발",
      production: "운영",
      test: "테스트",
      staging: "스테이징",

      // 보안 관련
      auth: "인증",
      authentication: "인증",
      authorization: "권한부여",
      credentials: "자격증명",
      credential: "자격증명",
      token: "토큰",
      secret: "비밀키",
      password: "비밀번호",
      hash: "해시",
      encrypt: "암호화",
      decrypt: "복호화",

      // 식별자 관련
      id: "아이디",
      uuid: "UUID",
      guid: "GUID",
      timestamp: "타임스탬프",
      date: "날짜",
      time: "시간",

      // 상태 코드
      success: "성공",
      fail: "실패",
      failure: "실패",
      pending: "대기중",
      loading: "로딩중",
      complete: "완료",
      cancel: "취소",

      // 파일 관련
      file: "파일",
      folder: "폴더",
      directory: "디렉토리",
      path: "경로",
      url: "URL",
      uri: "URI",
      link: "링크",
      buffer: "버퍼",
      json: "JSON",
      to: "~로",
      from: "~에서",

      // 메모리 관련
      alloc: "할당",
      allocate: "할당하다",
      malloc: "메모리할당",
      free: "해제",
      unsafe: "비안전",
      safe: "안전",

      // 로그 관련
      log: "로그",
      debug: "디버그",
      warn: "경고",
      warning: "경고",
      fatal: "치명적오류",
    };

    const lowerText = text.toLowerCase();

    // 완전 일치 확인
    if (coreDict[lowerText]) {
      const result = coreDict[lowerText];
      return typeof result === "string" ? result : text;
    }

    // 단어 분리
    const words = this.splitWords(text);
    if (words.length > 1) {
      const translatedWords = words.map((word) => {
        const lowerWord = word.toLowerCase();
        return coreDict[lowerWord] || word;
      });

      // 적어도 하나 번역되면 결과 반환
      const hasTranslation = translatedWords.some((word, index) => {
        return coreDict[words[index].toLowerCase()] !== undefined;
      });

      if (hasTranslation) {
        const result = translatedWords.join(" ");
        console.log(` Compound translation: "${text}" → "${result}"`);
        return result;
      }
    }

    return text;
  }

  /**
   * 다양한 케이스의 문자열을 단어별로 분리
   */
  private splitWords(text: string): string[] {
    // CONSTANT_CASE (S3_UPLOAD_BUCKET_URL)
    if (/^[A-Z][A-Z0-9_]*$/.test(text)) {
      return text.split("_").filter((word) => word.length > 0);
    }

    // snake_case (user_auth_token)
    if (/^[a-z]+(_[a-z]+)*$/.test(text)) {
      return text.split("_").filter((word) => word.length > 0);
    }

    // kebab-case (user-auth-token)
    if (/^[a-z]+(-[a-z]+)*$/.test(text)) {
      return text.split("-").filter((word) => word.length > 0);
    }

    // camelCase, PascalCase
    const words = text.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");

    // 소문자로만 이루어진 긴 단어는 추가로 분리 시도
    const result: string[] = [];
    for (const word of words) {
      if (word.length > 1 && /^[a-z]+$/.test(word)) {
        // 알려진 단어 패턴들로 분리 시도
        const splitResult = this.trySplitCompoundWord(word);
        result.push(...splitResult);
      } else {
        result.push(word);
      }
    }

    return result;
  }

  /**
   * 소문자 조합 단어를 분리 시도
   */
  private trySplitCompoundWord(word: string): string[] {
    // 일반적인 프로그래밍 용어 패턴들
    const commonPatterns = [
      // user 관련
      {
        pattern: /^user(.+)/,
        split: (match: RegExpMatchArray) => ["user", match[1]],
      },
      {
        pattern: /^(.+)user$/,
        split: (match: RegExpMatchArray) => [match[1], "user"],
      },

      // auth 관련
      {
        pattern: /^auth(.+)/,
        split: (match: RegExpMatchArray) => ["auth", match[1]],
      },
      {
        pattern: /^(.+)auth$/,
        split: (match: RegExpMatchArray) => [match[1], "auth"],
      },

      // data 관련
      {
        pattern: /^data(.+)/,
        split: (match: RegExpMatchArray) => ["data", match[1]],
      },
      {
        pattern: /^(.+)data$/,
        split: (match: RegExpMatchArray) => [match[1], "data"],
      },

      // config 관련
      {
        pattern: /^config(.+)/,
        split: (match: RegExpMatchArray) => ["config", match[1]],
      },
      {
        pattern: /^(.+)config$/,
        split: (match: RegExpMatchArray) => [match[1], "config"],
      },

      // file/buffer 관련
      {
        pattern: /^file(.+)/,
        split: (match: RegExpMatchArray) => ["file", match[1]],
      },
      {
        pattern: /^(.+)file$/,
        split: (match: RegExpMatchArray) => [match[1], "file"],
      },
      {
        pattern: /^buffer(.+)/,
        split: (match: RegExpMatchArray) => ["buffer", match[1]],
      },
      {
        pattern: /^(.+)buffer$/,
        split: (match: RegExpMatchArray) => [match[1], "buffer"],
      },

      // to 동작 관련
      {
        pattern: /^to([a-z]+)/,
        split: (match: RegExpMatchArray) => ["to", match[1]],
      },

      // get/set 관련
      {
        pattern: /^get(.+)/,
        split: (match: RegExpMatchArray) => ["get", match[1]],
      },
      {
        pattern: /^set(.+)/,
        split: (match: RegExpMatchArray) => ["set", match[1]],
      },

      // is/has 관련
      {
        pattern: /^is(.+)/,
        split: (match: RegExpMatchArray) => ["is", match[1]],
      },
      {
        pattern: /^has(.+)/,
        split: (match: RegExpMatchArray) => ["has", match[1]],
      },

      // 메모리 관련
      {
        pattern: /^alloc(.+)/,
        split: (match: RegExpMatchArray) => ["alloc", match[1]],
      },
      {
        pattern: /^(.+)alloc$/,
        split: (match: RegExpMatchArray) => [match[1], "alloc"],
      },

      // 리소스 관련
      {
        pattern: /^resource(.+)/,
        split: (match: RegExpMatchArray) => ["resource", match[1]],
      },
      {
        pattern: /^(.+)resource$/,
        split: (match: RegExpMatchArray) => [match[1], "resource"],
      },
    ];

    for (const { pattern, split } of commonPatterns) {
      const match = word.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        const parts = split(match);

        // 분리된 부분들에 대해 재귀적으로 더 분리 시도
        const result: string[] = [];
        for (const part of parts) {
          // 3글자 이상인 경우만 추가 분리 시도
          if (part.length > 3 && /^[a-z]+$/.test(part)) {
            const subParts = this.trySplitCompoundWord(part);
            result.push(...subParts);
          } else {
            result.push(part);
          }
        }
        return result;
      }
    }

    // 알려진 큰 단어들 사전 분리
    const knownCompounds: Record<string, string[]> = {
      resourceconstructor: ["resource", "constructor"],
      arraybuffer: ["array", "buffer"],
      stringbuilder: ["string", "builder"],
      filestream: ["file", "stream"],
      framerate: ["frame", "rate"],
      keyvalue: ["key", "value"],
      errorhandler: ["error", "handler"],
      codebase: ["code", "base"],
    };

    if (knownCompounds[word]) {
      console.log(
        `Using known compound: "${word}" → ${knownCompounds[word].join(", ")}`
      );
      return knownCompounds[word];
    }

    // 패턴이 없으면 원본 반환
    return [word];
  }

  /**
   * MyMemory API를 이용한 번역
   */
  private async translateWithMyMemory(text: string): Promise<string> {
    try {
      const encodedText = encodeURIComponent(text);
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ko`,
        { timeout: 5000 }
      );

      if (response.data.responseStatus === 200) {
        const translatedText =
          response.data.responseData.translatedText || text;

        // MyMemory 결과도 검증
        if (this.isValidTranslation(text, translatedText)) {
          console.log(` MyMemory success: "${text}" → "${translatedText}"`);
          return translatedText;
        } else {
          console.log(
            ` Invalid MyMemory translation: "${text}" → "${translatedText}"`
          );
          return text;
        }
      }
      return text;
    } catch (error: any) {
      console.log(`MyMemory failed:`, error.message);
      return text;
    }
  }

  private async translateWithGoogleScraping(text: string): Promise<string> {
    try {
      if (this.requestCount > 50) {
        console.log("Daily Google request limit reached");
        return text;
      }

      const encodedText = encodeURIComponent(text);
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodedText}`,
        {
          timeout: 5000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      this.requestCount++;

      // 디버깅용 로그 (운영환경에서는 제거 가능)
      console.log(
        "Google API Response:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.data && Array.isArray(response.data) && response.data[0]) {
        const translations = response.data[0];

        if (Array.isArray(translations) && translations.length > 0) {
          // 모든 번역 세그먼트를 합침
          const translatedText = translations
            .map((segment: any[]) => segment[0])
            .filter(Boolean)
            .join("")
            .trim();

          if (translatedText && this.isValidTranslation(text, translatedText)) {
            console.log(` Google translation: "${text}" → "${translatedText}"`);
            this.cache.set(text, translatedText);
            return translatedText;
          } else {
            console.log(
              ` Invalid Google translation: "${text}" → "${translatedText}"`
            );
          }
        }
      }

      console.log(`Google translation failed: "${text}"`);
      return text;
    } catch (error: any) {
      console.log(` Google scraping failed for "${text}":`, error.message);
      return text;
    }
  }

  /**
   * 번역 품질 검증 메서드 (새로 추가)
   */
  private isValidTranslation(original: string, translated: string): boolean {
    if (!translated || translated.trim().length === 0) {
      return false;
    }

    // 원문과 완전히 동일한 경우
    if (original === translated) {
      return false;
    }

    // 대소문자만 다른 경우 (resourceconstructor → ResourceConstructor)
    if (original.toLowerCase() === translated.toLowerCase()) {
      return false;
    }

    // 단순히 케이스 변환만 된 경우 체크
    const originalNormalized = original.toLowerCase().replace(/[^a-z]/g, "");
    const translatedNormalized = translated
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (originalNormalized === translatedNormalized) {
      return false;
    }

    // 의미없는 번역 패턴 (extends → include_once().)
    if (
      translated.includes("()") ||
      translated.includes("<?") ||
      translated.includes("?>") ||
      translated.includes("include_")
    ) {
      return false;
    }

    // 한글이 포함되어야 유효한 번역
    if (!/[가-힣]/.test(translated)) {
      return false;
    }

    // 번역된 텍스트가 너무 짧은 경우 (1-2글자)
    if (translated.replace(/[^\가-힣]/g, "").length < 2) {
      return false;
    }

    return true;
  }

  /**
   * LibreTranslate API를 이용한 번역
   */
  private async translateWithLibre(text: string): Promise<string> {
    try {
      const response = await axios.post(
        "https://libretranslate.de/translate",
        {
          q: text,
          source: "en",
          target: "ko",
          format: "text",
        },
        {
          timeout: 3000,
          headers: { "Content-Type": "application/json" },
        }
      );

      return response.data.translatedText || text;
    } catch (error: any) {
      console.log(`LibreTranslate failed:`, error.message);
      return text;
    }
  }

  private async translateWithLingva(text: string): Promise<string> {
    try {
      // 여러 인스턴스 시도
      const instances = [
        "https://lingva.ml/api/v1/en/ko",
        "https://translate.igna.rocks/api/v1/en/ko",
        "https://translate.plausibility.cloud/api/v1/en/ko",
      ];

      for (const instance of instances) {
        try {
          const response = await axios.get(
            `${instance}/${encodeURIComponent(text)}`,
            {
              timeout: 8000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
            }
          );

          if (response.data && response.data.translation) {
            const translatedText = response.data.translation;
            if (this.isValidTranslation(text, translatedText)) {
              console.log(
                `Lingva (${instance}) translation: "${text}" → "${translatedText}"`
              );
              return translatedText;
            }
          }
        } catch (instanceError) {
          console.log(`Lingva instance ${instance} failed, trying next...`);
          continue;
        }
      }
      return text;
    } catch (error: any) {
      console.log(`All Lingva instances failed:`, error.message);
      return text;
    }
  }

  // Microsoft Translator
  private async translateWithMicrosoft(text: string): Promise<string> {
    try {
      // 무료 엔드포인트 (월 2백만 글자 제한)
      const response = await axios.post(
        "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=ko",
        [{ Text: text }],
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            // API 키 없이도 제한적으로 작동하는 경우가 있음
          },
        }
      );

      if (response.data && response.data[0] && response.data[0].translations) {
        const translatedText = response.data[0].translations[0].text;
        if (this.isValidTranslation(text, translatedText)) {
          console.log(`Microsoft translation: "${text}" → "${translatedText}"`);
          return translatedText;
        }
      }
      return text;
    } catch (error: any) {
      console.log(`Microsoft translation failed:`, error.message);
      return text;
    }
  }

  // 3. FreeTranslate
  private async translateWithFreeTranslate(text: string): Promise<string> {
    try {
      const instances = [
        "https://translate.argosopentech.com/translate",
        "https://libretranslate.com/translate", // 공식 데모 사이트
      ];

      for (const instance of instances) {
        try {
          const response = await axios.post(
            instance,
            {
              q: text,
              source: "en",
              target: "ko",
              format: "text",
            },
            {
              timeout: 8000,
              headers: {
                "Content-Type": "application/json",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
            }
          );

          if (response.data && response.data.translatedText) {
            const translatedText = response.data.translatedText;
            if (this.isValidTranslation(text, translatedText)) {
              console.log(
                `FreeTranslate (${instance}) translation: "${text}" → "${translatedText}"`
              );
              return translatedText;
            }
          }
        } catch (instanceError) {
          console.log(
            `FreeTranslate instance ${instance} failed, trying next...`
          );
          continue;
        }
      }
      return text;
    } catch (error: any) {
      console.log(`All FreeTranslate instances failed:`, error.message);
      return text;
    }
  }

  /**
   * 주석에서 영어 텍스트 추출
   */
  extractEnglishFromComment(comment: string): string {
    const cleanComment = comment
      .replace(/^\/\/\s*/, "") // JavaScript 한줄 주석 제거
      .replace(/^\/\*\*?\s*/, "") // JavaScript 블록 주석 시작 제거
      .replace(/\*\/\s*$/, "") // JavaScript 블록 주석 끝 제거
      .replace(/^\*\s*/, "") // JSDoc 스타일 제거
      .replace(/^#\s*/, "") // 파이썬/쉘 주석 제거
      .trim();

    const englishPattern =
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]+$/;
    return englishPattern.test(cleanComment) ? cleanComment : "";
  }
}

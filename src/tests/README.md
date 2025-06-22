# Korean Translator - 테스트

이 디렉토리에는 Korean Translator VS Code 확장의 테스트 코드가 포함되어 있습니다.

## 테스트 구조

```
src/tests/
├── TextValidator.test.ts      # 텍스트 검증 로직 테스트
├── TextProcessor.test.ts      # 텍스트 전처리 로직 테스트
├── TranslationCache.test.ts   # 번역 캐시 기능 테스트
├── TranslationService.test.ts # 번역 서비스 통합 테스트
└── README.md                  # 이 파일
```

## 테스트 실행 방법

### 1. 모든 Jest 테스트 실행
```bash
npm run test:jest
```

### 2. 테스트 감시 모드 (파일 변경 시 자동 실행)
```bash
npm run test:jest:watch
```

### 3. 코드 커버리지 포함 테스트
```bash
npm run test:jest:coverage
```

### 4. 모든 테스트 실행 (Jest + VS Code 테스트)
```bash
npm run test:all
```

## 테스트 커버리지

현재 테스트 커버리지: **67.12%**

### 상세 커버리지
- **TextValidator**: 94.82% - 텍스트 번역 가능성 검증
- **TextProcessor**: 100% - 다양한 명명 케이스 전처리
- **TranslationCache**: 91.3% - 번역 결과 캐싱
- **TranslationService**: 100% - 번역 서비스 전체 기능
- **TranslationEngine**: 78.18% - 번역 엔진 핵심 로직

## 테스트 케이스 설명

### TextValidator.test.ts
- 번역 가능성 검증 로직
- 다양한 케이스 패턴 인식
- 주석에서 영어 텍스트 추출
- URL, 도메인, 특수문자 등 필터링

### TextProcessor.test.ts
- camelCase, snake_case, kebab-case, CONSTANT_CASE 변환
- 단어 분리 기능
- 케이스 타입 감지
- 전처리 파이프라인

### TranslationCache.test.ts
- 싱글톤 패턴 구현
- 캐시 CRUD 연산
- 요청 횟수 추적
- 메모리 관리

### TranslationService.test.ts
- 번역 서비스 통합 테스트
- 전략 패턴 구현 검증
- 에러 처리 및 예외 상황
- 캐시 기능 통합

## 테스트 환경 설정

### Jest 설정 (`jest.config.js`)
- TypeScript 지원
- 코드 커버리지 수집
- 테스트 타임아웃: 10초
- Node.js 환경

### TypeScript 설정 (`tsconfig.json`)
- CommonJS 모듈 시스템
- ES2022 타겟
- Strict 모드 활성화
- ES 모듈 상호 운용성

## 모킹 (Mocking)

외부 API 호출을 위한 axios 모킹이 적용되어 있습니다:
```typescript
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  get: jest.fn(),
  post: jest.fn(),
}));
```

## 테스트 실행 결과

```
Test Suites: 4 passed, 4 total
Tests:       89 passed, 89 total
Snapshots:   0 total
Time:        2.521 s
```

## 주의 사항

1. **네트워크 의존성**: 실제 번역 API 호출은 모킹되어 있어 오프라인에서도 테스트 가능
2. **VS Code 의존성**: 일부 VS Code 관련 기능은 별도의 VS Code 테스트 환경에서 실행
3. **캐시 격리**: 각 테스트는 독립적인 캐시 인스턴스를 사용하여 상호 간섭 방지

## 기여하기

새로운 테스트를 추가할 때는:
1. 적절한 테스트 파일에 추가하거나 새로운 파일 생성
2. Jest 컨벤션을 따라 `describe`와 `it` 블록 사용
3. 의미 있는 테스트 이름 사용 (한국어 가능)
4. Edge case와 에러 상황도 고려 
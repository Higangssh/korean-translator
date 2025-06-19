# Korean Translator for VS Code

> 영어 주석과 변수명을 실시간으로 한국어 번역해주는 전문적인 IDE 확장 프로그램

[![VS Code Version](https://img.shields.io/badge/VS%20Code-1.101.0+-blue.svg)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178c6.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

## 개요

Korean Translator는 영어로 작성된 프로그래밍 요소들을 한국어로 실시간 번역하여 개발자의 생산성을 향상시키는 정교한 VS Code 확장 프로그램입니다. 성능과 정확도를 고려하여 설계된 지능형 다단계 번역 아키텍처와 스마트 캐싱, 상황 인식 필터링 기능을 제공합니다.

## 시스템 아키텍처

```mermaid
graph TD
    A[사용자 입력] --> B{번역 필터}
    B -->|유효함| C[캐시 확인]
    B -->|무효함| D[번역 건너뛰기]
    C -->|캐시 적중| E[캐시된 결과 반환]
    C -->|캐시 미스| F[로컬 사전]
    F -->|발견됨| G[캐시 저장 후 반환]
    F -->|발견안됨| H[MyMemory API]
    H -->|성공| I[캐시 저장 후 반환]
    H -->|실패| J[Google 번역]
    J -->|성공| K[캐시 저장 후 반환]
    J -->|실패| L[LibreTranslate]
    L --> M[캐시 저장 후 반환]
```

## 핵심 기능

### 주요 기능

- **지능형 호버 번역**: 디바운싱이 적용된 마우스 호버 시 상황 인식 번역
- **키보드 단축키 번역**: 사용자 정의 단축키를 통한 인라인 즉시 번역
- **다단계 번역 엔진**: 최적의 정확도와 성능을 보장하는 계층적 번역 시스템
- **스마트 콘텐츠 필터링**: 불필요한 번역 시도를 방지하는 고도화된 패턴 인식
- **성능 최적화 캐싱**: 자동 정리 기능을 갖춘 메모리 효율적 캐싱 시스템

### 호버 번역 예시

영어 주석이나 변수에 마우스를 올리면 자동으로 번역이 표시됩니다:

![Hover Demo](./images/hover.gif)

---

### 단축키 번역 예시

`Ctrl+Shift+T` 또는 `Cmd+Shift+T`로 현재 커서 위치의 단어를 번역할 수 있습니다:

![Shortcut Key Demo](./images/ctl.gif)

### 번역 파이프라인

1. **로컬 사전**: 즉시 검색을 위한 50개 이상의 사전 정의된 프로그래밍 용어
2. **MyMemory API**: 전문 번역 메모리 데이터베이스 (일일 1,000단어 무료)
3. **Google 번역**: 요청 제한이 적용된 고정확도 번역 서비스
4. **LibreTranslate**: 오픈소스 백업 번역 엔진

## 설치 방법

### VS Code 마켓플레이스에서 설치

```bash
code --install-extension .korean-translator
```

### 개발 버전 설치

```bash
git https://github.com/Higangssh/korean-translator.git
cd korean-translator-vscode
npm i
npm run compile
npm run watch(그냥 F5만 눌러도 됩니다)
```

## 설정 옵션

VS Code 설정에서 포괄적인 구성 옵션을 제공합니다:

```json5
{
  // 핵심 기능 토글
  "korean-translator.enabled": true,
  "korean-translator.autoTranslateComments": true,
  "korean-translator.autoTranslateVariables": true,

  // 성능 튜닝
  "korean-translator.minimumWordLength": 3,
  "korean-translator.debounceDelay": 300,
  "korean-translator.cacheTimeout": 3600000,
}
```

## 사용 방법

### 호버 번역

영어 식별자나 주석에 커서를 올리면 자동 번역이 실행됩니다:

```typescript
// This function handles user authentication processes
async function authenticateUser(credentials: UserCredentials) {
  const validationResult = validateCredentials(credentials);
  return validationResult;
}
```

### 키보드 단축키

| 플랫폼        | 단축키         | 동작                |
| ------------- | -------------- | ------------------- |
| Windows/Linux | `Ctrl+Shift+T` | 커서 위치 단어 번역 |
| macOS         | `Cmd+Shift+T`  | 커서 위치 단어 번역 |

### 명령 팔레트

`Ctrl+Shift+P` (Windows/Linux) 또는 `Cmd+Shift+P` (macOS)를 통해 접근:

- `Korean Translator: 선택 영역 번역`
- `Korean Translator: 번역 기능 토글`
- `Korean Translator: 캐시 초기화`
- `Korean Translator: 통계 보기`

## 번역 필터링

성능과 관련성을 최적화하기 위한 정교한 필터링을 적용합니다:

### 제외 패턴

- **숫자 리터럴**: `123`, `3.14159`, `-42`
- **색상 코드**: `#ffffff`, `rgb(255,0,0)`, `hsl(120,100%,50%)`
- **CSS 단위**: `px`, `em`, `rem`, `vh`, `vw`
- **파일 확장자**: `.js`, `.ts`, `.json`
- **URL**: `https://example.com`, `www.site.org`
- **단일 문자**: `a`, `x`, `i`
- **특수 기호**: `!!`, `&&`, `||`, `++`

### 포함 기준

- 최소 3글자 이상
- 알파벳 문자 포함
- 한글(Hangul)이 아님
- 제외 사전에 없음
- 유효한 영어 단어 패턴

## API 통합

### 외부 서비스

| 서비스         | 우선순위 | 요청 제한    | 품질      | 대체 서비스    |
| -------------- | -------- | ------------ | --------- | -------------- |
| 로컬 사전      | 1차      | 무제한       | 높음      | 해당없음       |
| MyMemory       | 2차      | 1,000단어/일 | 매우 높음 | Google         |
| Google 번역    | 3차      | 50요청/일    | 높음      | LibreTranslate |
| LibreTranslate | 4차      | 무제한       | 보통      | 원본 텍스트    |


## 개발 환경

### 필수 요구사항

- Node.js ≥ 16.14.0
- TypeScript ≥ 5.8.0
- VS Code ≥ 1.70.0

### 빌드 프로세스

```bash
# 의존성 설치
npm install

# 웹팩팩 빌드
npm run compile

# 감시 모드(그냥 F5 만 눌러도 됩니다.)
npm run watch 

# 프로덕션 빌드
npm run package

# 확장 프로그램 패키징
npm run vscode:prepublish
vsce package
```

### 프로젝트 구조

```
src/
├── extension.ts              # 확장 프로그램 진입점 및 활성화
├── translationService.ts     # 핵심 번역 로직 및 API 통합
├── hoverProvider.ts          # 호버 이벤트 처리 및 디바운싱
└── types/                    # TypeScript 타입 정의
    └── translation.d.ts

dist/                         # 컴파일된 JavaScript 출력
package.json                  # 확장 프로그램 매니페스트 및 메타데이터
tsconfig.json                # TypeScript 컴파일러 구성
webpack.config.js            # 번들 최적화
```

## 성능 지표

### 메모리 사용량

- 기본 메모리 사용량: ~2MB
- 캐시 크기: 5-10KB (일반적인 세션)
- 메모리 정리: 창 닫기 시 자동

### 응답 시간

- 로컬 사전: <1ms
- 캐시 히트: <5ms
- API 호출: 100-2000ms (네트워크 의존)
- 호버 디바운싱: 기본 300ms

## 로드맵

- [ ] 사용량 분석 대시보드
- [ ] 고급 컨텍스트 인식
- [ ] AI 기반 번역 제안
- [ ] 팀 공유 번역 메모리
- [ ] 실시간 협업 번역
- [ ] 외부 CAT 도구 통합
- [ ] 다국어 지원 (일본어, 중국어)

## 문제 해결

### 일반적인 문제

**번역이 나타나지 않는 경우**

```bash
# 확장 프로그램 상태 확인
개발자 도구 → 콘솔 → 필터: "Korean Translator"

# 구성 확인
CMD/Ctrl + , → 검색: "korean-translator"
```

**API 요청 제한**

- MyMemory: IP당 1,000단어/일
- Google: 50요청/일 (구성 가능)
- 해결방법: API 키 로테이션 구현 또는 유료 계층 업그레이드

**성능 문제**

- 번역 캐시 초기화: `CMD/Ctrl + Shift + P` → "Korean Translator: 캐시 초기화"
- 설정에서 디바운스 지연 조정
- 네트워크 연결 확인

## 보안 및 개인정보

- **데이터 영구 저장 없음**: 번역은 메모리에만 캐시됨
- **API 통신**: 모든 외부 호출은 HTTPS 사용
- **사용자 추적 없음**: 분석 없이 로컬에서만 작동
- **소스 코드 투명성**: 보안 감사를 위한 완전 오픈소스

## 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 문의

- **이메일**: sonsanghee3@gmail.com
- **issue**: 자유 형식으로 이슈 올려주시면 처리하겠습니디.

## 감사의 말

- 전문 번역 메모리 API를 제공해주신 [MyMemory](https://mymemory.translated.net/)
- 오픈소스 번역 인프라를 제공해주신 [LibreTranslate](https://libretranslate.com/)
- VS Code Extension API 문서와 커뮤니티 기여자들

---

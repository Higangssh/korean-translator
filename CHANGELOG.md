# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-19

### Added

- Initial release of Korean Translator extension
- **Hover translation**: Translate English text on mouse hover
- **Keyboard shortcut**: `Ctrl+Shift+T` for quick translation
- **Multi-engine translation system**:
  - Local dictionary (instant response)
  - MyMemory API (translation memory)
  - Google Translate (high quality)
  - LibreTranslate (open source fallback)
- **Smart text filtering**: Skip numbers, URLs, color codes, and programming keywords
- **Intelligent caching**: Prevent duplicate API calls and improve performance
- **CamelCase support**: `userCredentials` → `user credentials` → `사용자 로그인 정보`
- **Language support**: JavaScript, TypeScript, Python, Java, Go, Rust, C/C++, C#, PHP, Ruby, Swift, Kotlin

### Features

- Inline translation display (shows result for 3 seconds)
- Status bar notifications
- Configurable settings:
  - Enable/disable hover translation
  - Auto-translate comments
  - Auto-translate variable names
  - Minimum word length
  - Hover delay timing

### Commands

- `korean-translator.translateSelection` - Translate selected text
- `korean-translator.toggle` - Toggle translation feature
- `korean-translator.clearCache` - Clear translation cache (dev)
- `korean-translator.cacheStatus` - Show cache status (dev)

### Configuration

```json
{
  "korean-translator.enabled": true,
  "korean-translator.autoTranslateComments": true,
  "korean-translator.autoTranslateVariables": true,
  "korean-translator.minimumWordLength": 3,
  "korean-translator.debounceDelay": 300
}
```

### Requirements

- VS Code 1.101.0 or higher
- Node.js 20.x or higher
- Internet connection for online translation services

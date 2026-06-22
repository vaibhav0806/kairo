import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('macOS bundle permissions', () => {
  test('codesigns the app with microphone audio input entitlement', () => {
    const tauriConfig = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8'));
    expect(tauriConfig.bundle.macOS.entitlements).toBe('Entitlements.plist');

    const entitlements = readFileSync('src-tauri/Entitlements.plist', 'utf8');
    expect(entitlements).toContain('<key>com.apple.security.device.audio-input</key>');
    expect(entitlements).toContain('<true/>');
  });

  test('declares the microphone usage reason shown by macOS', () => {
    const infoPlist = readFileSync('src-tauri/Info.plist', 'utf8');
    expect(infoPlist).toContain('<key>NSMicrophoneUsageDescription</key>');
    expect(infoPlist).toContain('voice input during tutoring sessions');
  });
});

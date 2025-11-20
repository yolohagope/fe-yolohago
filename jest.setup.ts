import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills para Node
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock de import.meta.env para Vite
Object.defineProperty(globalThis, 'import.meta', {
  value: {
    env: {
      VITE_API_URL: 'http://localhost:8000',
      MODE: 'test'
    }
  }
});

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

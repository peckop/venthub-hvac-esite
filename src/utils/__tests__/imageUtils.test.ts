import { beforeEach,describe, expect, it, vi } from 'vitest';

import { compressImage } from '../imageUtils';

describe('compressImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve with a blob when compression succeeds', async () => {
    const mockFile = new File(['mock content'], 'test.png', { type: 'image/png' });
    const mockBlob = new Blob(['compressed content'], { type: 'image/webp' });

    // Mock FileReader
    class MockFileReader {
      onload: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      readAsDataURL(_file: unknown) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,mock' } });
          }
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    // Mock Image
    class MockImage {
      width = 2000;
      height = 1000;
      onload: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => {
          if (typeof this.onload === 'function') this.onload();
        }, 0);
      }
    }
    vi.stubGlobal('Image', MockImage);

    // Mock Canvas
    const mockContext = {
      drawImage: vi.fn(),
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn((callback) => {
        setTimeout(() => callback(mockBlob), 0);
      }),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return {} as unknown as HTMLElement;
    });

    const result = await compressImage(mockFile);

    expect(result).toBe(mockBlob);
    expect(mockCanvas.width).toBe(1200); // MAX_WIDTH
    expect(mockCanvas.height).toBe(600); // 1000 * (1200 / 2000)
    expect(mockContext.drawImage).toHaveBeenCalledWith(expect.any(MockImage), 0, 0, 1200, 600);
    expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.8);
  });

  it('should not scale if width is less than MAX_WIDTH', async () => {
    const mockFile = new File(['mock content'], 'test.png', { type: 'image/png' });
    const mockBlob = new Blob(['compressed content'], { type: 'image/webp' });

    class MockFileReader {
      onload: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      readAsDataURL(_file: unknown) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,mock' } });
          }
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    class MockImage {
      width = 800;
      height = 600;
      onload: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => {
          if (typeof this.onload === 'function') this.onload();
        }, 0);
      }
    }
    vi.stubGlobal('Image', MockImage);

    // Mock Canvas
    const mockContext = {
      drawImage: vi.fn(),
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn((callback) => {
        setTimeout(() => callback(mockBlob), 0);
      }),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return {} as unknown as HTMLElement;
    });

    const result = await compressImage(mockFile);

    expect(result).toBe(mockBlob);
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(600);
    expect(mockContext.drawImage).toHaveBeenCalledWith(expect.any(MockImage), 0, 0, 800, 600);
  });

  it('should reject if FileReader encounters an error', async () => {
    const mockFile = new File([''], 'test.png');
    const mockError = new Error('FileReader error');

    class MockFileReader {
      onload: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      readAsDataURL(_file: unknown) {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(mockError);
          }
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    await expect(compressImage(mockFile)).rejects.toThrow('FileReader error');
  });

  it('should reject if canvas context fails', async () => {
    const mockFile = new File([''], 'test.png');

    class MockFileReader {
      onload: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      readAsDataURL(_file: unknown) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,mock' } });
          }
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    class MockImage {
      width = 800;
      height = 600;
      onload: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => {
          if (typeof this.onload === 'function') this.onload();
        }, 0);
      }
    }
    vi.stubGlobal('Image', MockImage);

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => null), // Returning null to simulate failure
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return {} as unknown as HTMLElement;
    });

    await expect(compressImage(mockFile)).rejects.toThrow('Canvas context failed');
  });

  it('should reject if canvas toBlob returns null', async () => {
    const mockFile = new File([''], 'test.png');

    class MockFileReader {
      onload: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      readAsDataURL(_file: unknown) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,mock' } });
          }
        }, 0);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    class MockImage {
      width = 800;
      height = 600;
      onload: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => {
          if (typeof this.onload === 'function') this.onload();
        }, 0);
      }
    }
    vi.stubGlobal('Image', MockImage);

    const mockContext = { drawImage: vi.fn() };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn((callback) => {
        setTimeout(() => callback(null), 0); // Simulate toBlob failure
      }),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return {} as unknown as HTMLElement;
    });

    await expect(compressImage(mockFile)).rejects.toThrow('Compression failed');
  });
});

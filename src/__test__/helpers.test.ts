import {
  calculateDistance,
  generateRandomString,
  isValidJSON,
  deepClone,
  debounce,
  throttle,
  isEmpty,
  formatFileSize,
  generateSlug,
  maskCreditCard,
  isStrongPassword,
  toCamelCase,
  toSnakeCase,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  roundTo,
  clamp,
  isInRange,
  generateId,
  formatNumber,
  bytesToMB,
  mbToBytes,
  getCurrentTimestamp,
  isRecentTimestamp,
  parseQueryString,
  objectToQueryString
} from '../utils/helpers';

describe('Helper Utilities Tests', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between same coordinates', () => {
      expect(calculateDistance(0, 0, 0, 0)).toBe(0);
    });

    it('should calculate distance between different coordinates', () => {
      expect(calculateDistance(0, 0, 1, 1)).toBeCloseTo(157.2, 0.1);
    });

    it('should calculate distance between cities', () => {
      expect(calculateDistance(28.6139, 77.2090, 19.0760, 72.8777)).toBeCloseTo(1105.5, 0.1);
    });

    it('should handle negative coordinates', () => {
      expect(calculateDistance(-1, -1, 1, 1)).toBeCloseTo(157.2, 0.1);
    });

    it('should handle mixed coordinates', () => {
      expect(calculateDistance(-10, 20, 10, -20)).toBeCloseTo(3135.8, 0.1);
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      const str = generateRandomString(10);
      expect(str).toHaveLength(10);
      expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
    });

    it('should generate different strings on multiple calls', () => {
      const str1 = generateRandomString(10);
      const str2 = generateRandomString(10);
      expect(str1).not.toBe(str2);
    });

    it('should generate empty string for length 0', () => {
      expect(generateRandomString(0)).toBe('');
    });

    it('should generate string for large length', () => {
      const str = generateRandomString(100);
      expect(str).toHaveLength(100);
    });
  });

  describe('isValidJSON', () => {
    it('should validate valid JSON object', () => {
      expect(isValidJSON('{"key": "value"}')).toBe(true);
    });

    it('should validate valid JSON array', () => {
      expect(isValidJSON('[1, 2, 3]')).toBe(true);
    });

    it('should validate valid JSON string', () => {
      expect(isValidJSON('"hello"')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(isValidJSON('{"key": value}')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidJSON('')).toBe(false);
    });

    it('should reject malformed JSON', () => {
      expect(isValidJSON('{key: "value"}')).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it('should clone date objects', () => {
      const date = new Date('2025-01-01');
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, { nested: 'value' }];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: { nested: 'value' }, c: [1, 2, 3] };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
      expect(cloned.c).not.toBe(obj.c);
    });

    it('should handle nested structures', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep value'
          }
        },
        array: [{ item: 1 }, { item: 2 }]
      };
      const cloned = deepClone(nested);
      expect(cloned).toEqual(nested);
      expect(cloned.level1.level2.level3).toBe('deep value');
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('test1');
      debouncedFn('test2');
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test2');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should execute only the last call within wait time', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 50);
      
      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');
      
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledWith('test3');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.useRealTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('should execute function immediately then throttle', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn('test1');
      expect(mockFn).toHaveBeenCalledWith('test1');
      
      throttledFn('test2');
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      throttledFn('test3');
      expect(mockFn).toHaveBeenCalledWith('test3');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.useRealTimers();
    });
  });

  describe('isEmpty', () => {
    it('should identify null as empty', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should identify undefined as empty', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should identify empty string as empty', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should identify whitespace string as empty', () => {
      expect(isEmpty('   ')).toBe(true);
    });

    it('should identify empty array as empty', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should identify empty object as empty', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should not identify non-empty values as empty', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1.00 KB');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(1572864)).toBe('1.50 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
      expect(formatFileSize(1610612736)).toBe('1.50 GB');
    });

    it('should format terabytes', () => {
      expect(formatFileSize(1099511627776)).toBe('1.00 TB');
    });
  });

  describe('generateSlug', () => {
    it('should convert string to slug format', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Hello World Test')).toBe('hello-world-test');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello @ World!')).toBe('hello-world');
      expect(generateSlug('Hello # World $ Test')).toBe('hello-world-test');
    });

    it('should handle multiple spaces and hyphens', () => {
      expect(generateSlug('Hello   World---Test')).toBe('hello-world-test');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle camelCase', () => {
      expect(generateSlug('helloWorldTest')).toBe('helloworldtest');
      expect(generateSlug('HelloWorldTest')).toBe('helloworldtest');
    });
  });

  describe('maskCreditCard', () => {
    it('should mask credit card number', () => {
      expect(maskCreditCard('4111111111111111')).toBe('************1111');
      expect(maskCreditCard('1234567890123456')).toBe('************3456');
    });

    it('should handle short card numbers', () => {
      expect(maskCreditCard('123')).toBe('123');
      expect(maskCreditCard('1234')).toBe('1234');
    });

    it('should handle card numbers with special characters', () => {
      expect(maskCreditCard('4111-1111-1111-1111')).toBe('************1111');
      expect(maskCreditCard('4111 1111 1111 1111')).toBe('************1111');
    });

    it('should handle empty string', () => {
      expect(maskCreditCard('')).toBe('');
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong password', () => {
      expect(isStrongPassword('StrongP@ss123')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd!')).toBe(true);
      expect(isStrongPassword('Test123!@#')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('PASSWORD')).toBe(false);
      expect(isStrongPassword('Password123')).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      expect(isStrongPassword('Password123')).toBe(false);
      expect(isStrongPassword('MyPassword')).toBe(false);
    });

    it('should reject short passwords', () => {
      expect(isStrongPassword('Abc1!')).toBe(false);
      expect(isStrongPassword('Abc12!')).toBe(false);
    });
  });

  describe('toCamelCase', () => {
    it('should convert string to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
      expect(toCamelCase('hello world test')).toBe('helloWorldTest');
      expect(toCamelCase('HELLO WORLD')).toBe('helloWorld');
    });

    it('should handle multiple spaces', () => {
      expect(toCamelCase('hello   world   test')).toBe('helloWorldTest');
    });

    it('should handle single word', () => {
      expect(toCamelCase('hello')).toBe('hello');
      expect(toCamelCase('HELLO')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(toCamelCase('')).toBe('');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert string to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('helloWorldTest')).toBe('hello_world_test');
      expect(toSnakeCase('HelloWorld')).toBe('hello_world');
    });

    it('should handle camelCase', () => {
      expect(toSnakeCase('helloWorldTest')).toBe('hello_world_test');
      expect(toSnakeCase('myVariableName')).toBe('my_variable_name');
    });

    it('should handle multiple spaces', () => {
      expect(toSnakeCase('hello   world   test')).toBe('hello_world_test');
    });

    it('should handle single word', () => {
      expect(toSnakeCase('hello')).toBe('hello');
      expect(toSnakeCase('HELLO')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(toSnakeCase('')).toBe('');
    });
  });

  describe('getFileExtension', () => {
    it('should get file extension', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.jpg')).toBe('jpg');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should handle files without extension', () => {
      expect(getFileExtension('filename')).toBe('');
      expect(getFileExtension('filename.')).toBe('');
    });

    it('should handle hidden files', () => {
      expect(getFileExtension('.gitignore')).toBe('gitignore');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('config.json.backup')).toBe('backup');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('picture.png')).toBe(true);
      expect(isImageFile('graphic.gif')).toBe(true);
      expect(isImageFile('vector.svg')).toBe(true);
      expect(isImageFile('photo.webp')).toBe(true);
    });

    it('should reject non-image files', () => {
      expect(isImageFile('document.pdf')).toBe(false);
      expect(isImageFile('text.txt')).toBe(false);
      expect(isImageFile('data.json')).toBe(false);
      expect(isImageFile('script.js')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isImageFile('PHOTO.JPG')).toBe(true);
      expect(isImageFile('IMAGE.PNG')).toBe(true);
      expect(isImageFile('GRAPHIC.GIF')).toBe(true);
    });
  });

  describe('isDocumentFile', () => {
    it('should identify document files', () => {
      expect(isDocumentFile('document.pdf')).toBe(true);
      expect(isDocumentFile('letter.doc')).toBe(true);
      expect(isDocumentFile('report.docx')).toBe(true);
      expect(isDocumentFile('notes.txt')).toBe(true);
      expect(isDocumentFile('document.rtf')).toBe(true);
      expect(isDocumentFile('document.odt')).toBe(true);
    });

    it('should reject non-document files', () => {
      expect(isDocumentFile('image.jpg')).toBe(false);
      expect(isDocumentFile('script.js')).toBe(false);
      expect(isDocumentFile('data.json')).toBe(false);
      expect(isDocumentFile('archive.zip')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isDocumentFile('DOCUMENT.PDF')).toBe(true);
      expect(isDocumentFile('LETTER.DOC')).toBe(true);
      expect(isDocumentFile('REPORT.DOCX')).toBe(true);
    });
  });

  describe('roundTo', () => {
    it('should round to specified decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 3)).toBe(3.142);
      expect(roundTo(3.14159, 0)).toBe(3);
    });

    it('should handle negative numbers', () => {
      expect(roundTo(-3.14159, 2)).toBe(-3.14);
      expect(roundTo(-3.14159, 3)).toBe(-3.142);
    });

    it('should handle zero', () => {
      expect(roundTo(0, 2)).toBe(0);
      expect(roundTo(0.12345, 2)).toBe(0.12);
    });

    it('should handle very small numbers', () => {
      expect(roundTo(0.001, 3)).toBe(0.001);
      expect(roundTo(0.009, 2)).toBe(0.01);
    });
  });

  describe('clamp', () => {
    it('should clamp within range', () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(0, 1, 10)).toBe(1);
      expect(clamp(15, 1, 10)).toBe(10);
    });

    it('should handle negative numbers', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it('should handle equal bounds', () => {
      expect(clamp(1, 1, 10)).toBe(1);
      expect(clamp(10, 1, 10)).toBe(10);
    });
  });

  describe('isInRange', () => {
    it('should identify numbers within range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    it('should identify numbers outside range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
      expect(isInRange(-1, 1, 10)).toBe(false);
    });

    it('should handle negative ranges', () => {
      expect(isInRange(-5, -10, -1)).toBe(true);
      expect(isInRange(-15, -10, -1)).toBe(false);
      expect(isInRange(0, -10, -1)).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate IDs with consistent length', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1.length).toBe(id2.length);
      expect(id1.length).toBeGreaterThan(10);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });

    it('should format negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('should format zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should format decimals', () => {
      expect(formatNumber(3.14159)).toBe('3.142');
      expect(formatNumber(2.71828)).toBe('2.718');
    });
  });

  describe('bytesToMB', () => {
    it('should convert bytes to megabytes', () => {
      expect(bytesToMB(1048576)).toBe(1);
      expect(bytesToMB(2097152)).toBe(2);
      expect(bytesToMB(5242880)).toBe(5);
    });

    it('should handle fractional values', () => {
      expect(bytesToMB(524288)).toBe(0.5);
      expect(bytesToMB(1572864)).toBe(1.5);
    });

    it('should handle zero bytes', () => {
      expect(bytesToMB(0)).toBe(0);
    });
  });

  describe('mbToBytes', () => {
    it('should convert megabytes to bytes', () => {
      expect(mbToBytes(1)).toBe(1048576);
      expect(mbToBytes(2)).toBe(2097152);
      expect(mbToBytes(5)).toBe(5242880);
    });

    it('should handle fractional values', () => {
      expect(mbToBytes(0.5)).toBe(524288);
      expect(mbToBytes(1.5)).toBe(1572864);
    });

    it('should handle zero megabytes', () => {
      expect(mbToBytes(0)).toBe(0);
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return current timestamp in seconds', () => {
      const ts1 = getCurrentTimestamp();
      const ts2 = getCurrentTimestamp();
      expect(ts2).toBeGreaterThanOrEqual(ts1);
      expect(ts1).toBeGreaterThan(1700000000); // Should be after 2023
    });
  });

  describe('isRecentTimestamp', () => {
    it('should identify recent timestamps', () => {
      const now = getCurrentTimestamp();
      expect(isRecentTimestamp(now)).toBe(true);
      expect(isRecentTimestamp(now - 100)).toBe(true);
      expect(isRecentTimestamp(now - 300)).toBe(true);
    });

    it('should reject old timestamps', () => {
      const oldTimestamp = getCurrentTimestamp() - 600;
      expect(isRecentTimestamp(oldTimestamp)).toBe(false);
      expect(isRecentTimestamp(oldTimestamp, 300)).toBe(false);
    });

    it('should use custom time window', () => {
      const now = getCurrentTimestamp();
      expect(isRecentTimestamp(now - 100, 50)).toBe(false);
      expect(isRecentTimestamp(now - 100, 200)).toBe(true);
    });
  });

  describe('parseQueryString', () => {
    it('should parse simple query string', () => {
      const result = parseQueryString('name=John&age=30');
      expect(result).toEqual({ name: 'John', age: '30' });
    });

    it('should handle encoded values', () => {
      const result = parseQueryString('name=John%20Doe&city=New%20York');
      expect(result).toEqual({ name: 'John Doe', city: 'New York' });
    });

    it('should handle empty query string', () => {
      expect(parseQueryString('')).toEqual({});
    });

    it('should handle multiple values for same key', () => {
      const result = parseQueryString('tags=tag1&tags=tag2');
      expect(result).toEqual({ tags: 'tag2' });
    });
  });

  describe('objectToQueryString', () => {
    it('should convert object to query string', () => {
      const result = objectToQueryString({ name: 'John', age: '30' });
      expect(result).toBe('name=John&age=30');
    });

    it('should handle encoded values', () => {
      const result = objectToQueryString({ name: 'John Doe', city: 'New York' });
      expect(result).toBe('name=John%20Doe&city=New%20York');
    });

    it('should handle empty object', () => {
      expect(objectToQueryString({})).toBe('');
    });

    it('should handle null and undefined values', () => {
      const result = objectToQueryString({ name: 'John', age: null, active: undefined });
      expect(result).toBe('name=John');
    });

    it('should handle numbers and booleans', () => {
      const result = objectToQueryString({ count: 5, active: true });
      expect(result).toBe('count=5&active=true');
    });
  });
});

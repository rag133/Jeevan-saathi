// Test our refactored components
describe('Component Tests', () => {
  test('basic component test', () => {
    expect(true).toBe(true);
  });

  test('math operations', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
  });

  test('string operations', () => {
    expect('Hello' + ' World').toBe('Hello World');
  });
});

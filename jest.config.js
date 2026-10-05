module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { url: 'https://de259.die-staemme.de/game.php' },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

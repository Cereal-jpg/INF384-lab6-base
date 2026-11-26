module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  // Requisito 5.1: la cobertura de líneas no baja de 80 %.
  coverageThreshold: { global: { lines: 80 } },
};

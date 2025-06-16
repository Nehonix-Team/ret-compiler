import typescript from 'rollup-plugin-typescript2';

export default [
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
            target: 'ES2020',
            declaration: true,
            declarationDir: 'dist',
            outDir: 'dist'
          }
        },
        useTsconfigDeclarationDir: true
      })
    ],
    external: []
  },
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
            target: 'ES2020',
            declaration: false
          }
        }
      })
    ],
    external: []
  }
];

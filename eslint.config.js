const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            globals: {
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                console: 'readonly',
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off'
        }
    }
];
module.exports = {
    'env': {
        'browser': true,
        'node': true,
        'es2021': true,
        'jest': true,
    },
    'rules': {
        'no-constant-condition': 'off',
        'no-useless-escape': 'off'
    },
    'extends': [
        'eslint:recommended'
    ],
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },
}

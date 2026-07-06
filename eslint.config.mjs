import ljharb from '@ljharb/eslint-config/flat';

export default [
	...ljharb,
	{
		rules: {
			'func-name-matching': 'off',
			'func-style': ['error', 'declaration'],
			'id-length': 'off',
			'max-lines-per-function': 'off',
			'max-params': 'off',
			'new-cap': [
				'error', {
					capIsNewExceptions: [
						'Call',
						'CreateDataPropertyOrThrow',
						'CreateKeyedPromiseCombinatorResultObject',
						'Get',
						'GetPromiseResolve',
						'Invoke',
						'NewPromiseCapability',
						'OrdinaryObjectCreate',
						'PerformPromiseAllKeyed',
					],
				},
			],
			'no-extra-parens': 'off',
			'no-magic-numbers': 'off',
			'no-param-reassign': ['error', { props: false }],
			'sort-keys': 'off',
		},
	},
	{
		files: ['test/**'],
		rules: {
			'func-style': 'off',
			'max-lines-per-function': 'off',
			'no-invalid-this': 'warn',
			'prefer-promise-reject-errors': 'off',
		},
	},
];

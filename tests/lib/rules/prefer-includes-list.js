'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../src/rules/prefer-includes-list')
const ruleTesterUtil = require('../testUtil/ruleTesterUtil')

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = ruleTesterUtil.getRuleTester()
const {fromMessage, withDefaultPragma} = require('../testUtil/optionsUtil')
const toError = fromMessage('Prefer _.includes over repeated equality comparisons.')

ruleTester.run('prefer-includes-list', rule, {
    valid: [
        '_.includes(["a", "b"], x)',
        '!_.includes([1, 2], x)',

        'x === 1 || y === 2',
        'x === a || x === b',
        'x === 1 && x === 2',
        'x == 1 || x == 2',
        'x === 1',
        'x !== 1 || x !== 2'
    ].map(withDefaultPragma),

    invalid: [
        toError({
            code: 'x === "a" || x === "b"',
            output: '_.includes(["a", "b"], x)'
        }),
        toError({
            code: 'x === 1 || x === 2 || x === 3',
            output: '_.includes([1, 2, 3], x)'
        }),
        toError({
            code: 'x !== "a" && x !== "b"',
            output: '!_.includes(["a", "b"], x)'
        }),
        toError({
            code: 'x !== 1 && x !== 2 && x !== 3',
            output: '!_.includes([1, 2, 3], x)'
        }),
        toError({
            code: 'status === "A" || status === "B" || status === 3',
            output: '_.includes(["A", "B", 3], status)'
        }),
        toError({
            code: 'obj.status === "A" || obj.status === "B"',
            output: '_.includes(["A", "B"], obj.status)'
        }),
        toError({
            code: '(x === "a") || (x === "b")',
            output: '_.includes(["a", "b"], x)'
        }),
        toError({
            code: 'import includes from "lodash/includes"; if (x === 1 || x === 2) {}',
            output: 'import includes from "lodash/includes"; if (_.includes([1, 2], x)) {}',
            parserOptions: {
                sourceType: 'module'
            }
        })
    ].map(withDefaultPragma)
})
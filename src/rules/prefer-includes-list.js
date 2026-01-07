/**
 * @fileoverview Rule to prefer _.includes over repeated equality comparisons.
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const getDocsUrl = require('../util/getDocsUrl')

module.exports = {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        schema: [],
        docs: {
            url: getDocsUrl('prefer-includes-list')
        }
    },

    create(context) {
        const {isEquivalentMemberExp} = require('../util/astUtil')
        const {getLodashContext} = require('../util/lodashUtil')
        const lodashContext = getLodashContext(context)
        const sourceCode = context.getSourceCode()

        function isEquality(node) {
            return node &&
                node.type === 'BinaryExpression' &&
                (node.operator === '===' || node.operator === '!==')
        }

        function isLiteral(node) {
            return node &&
                (node.type === 'Literal' ||
                    (node.type === 'TemplateLiteral' && node.expressions.length === 0))
        }

        function extractComparison(node) {
            if (!isEquality(node)) {
                return null
            }

            if (isLiteral(node.right)) {
                return {
                    operator: node.operator,
                    value: sourceCode.getText(node.right),
                    variable: node.left
                }
            }

            if (isLiteral(node.left)) {
                return {
                    operator: node.operator,
                    value: sourceCode.getText(node.left),
                    variable: node.right
                }
            }

            return null
        }

        function flattenLogical(node, operator, acc = []) {
            if (node.type === 'LogicalExpression' && node.operator === operator) {
                flattenLogical(node.left, operator, acc)
                flattenLogical(node.right, operator, acc)
            } else {
                acc.push(node)
            }
            return acc
        }

        function allSameVariable(parts) {
            const base = parts[0].variable
            return parts.every(p => isEquivalentMemberExp(base, p.variable))
        }

        function allSameOperator(parts) {
            return parts.every(p => p.operator === parts[0].operator)
        }

        function buildFix(parts, negate) {
            const values = parts.map(p => p.value).join(', ')
            const variable = sourceCode.getText(parts[0].variable)
            const expr = `_.includes([${values}], ${variable})`
            return negate ? `!${expr}` : expr
        }

        const visitors = lodashContext.getImportVisitors()

        visitors.LogicalExpression = function (node) {
            // 🚫 Prevent duplicate reports on nested chains
            if (
                node.parent &&
                node.parent.type === 'LogicalExpression' &&
                node.parent.operator === node.operator
            ) {
                return
            }

            if (node.operator !== '||' && node.operator !== '&&') {
                return
            }

            const parts = flattenLogical(node, node.operator)
                .map(extractComparison)
                .filter(Boolean)

            if (parts.length < 2) {
                return
            }

            if (!allSameVariable(parts) || !allSameOperator(parts)) {
                return
            }

            const comparisonOperator = parts[0].operator

            const isPositive =
                node.operator === '||' && comparisonOperator === '==='

            const isNegative =
                node.operator === '&&' && comparisonOperator === '!=='

            if (!isPositive && !isNegative) {
                return
            }

            context.report({
                node,
                message: 'Prefer _.includes over repeated equality comparisons.',
                fix(fixer) {
                    return fixer.replaceText(
                        node,
                        buildFix(parts, isNegative)
                    )
                }
            })
        }

        return visitors
    }
}
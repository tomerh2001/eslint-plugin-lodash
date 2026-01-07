# prefer-includes-list

Enforces the use of `_.includes` instead of repeated equality comparisons joined by logical operators.

This rule improves readability, reduces duplication, and makes intent explicit when checking whether a value belongs to a known set.

---

## ❓ Why this rule exists

Code like this is common:

```js
status === 'Approved' || status === 'Rejected'
```

As the number of comparisons grows, this pattern becomes:

- Harder to read
- Error-prone to extend
- Verbose and repetitive

Lodash already provides a clearer abstraction for this exact use case.

---

## ✅ What this rule enforces

### OR (`||`) with strict equality (`===`)

```js
// ❌ discouraged
x === 1 || x === 2 || x === 3

// ✅ preferred
_.includes([1, 2, 3], x)
```

---

### AND (`&&`) with strict inequality (`!==`)

```js
// ❌ discouraged
x !== 'a' && x !== 'b'

// ✅ preferred
!_.includes(['a', 'b'], x)
```

---

### Member expressions

```js
// ❌ discouraged
obj.status === 'A' || obj.status === 'B'

// ✅ preferred
_.includes(['A', 'B'], obj.status)
```

---

### Mixed literal types

```js
// ❌ discouraged
status === 'A' || status === 'B' || status === 3

// ✅ preferred
_.includes(['A', 'B', 3], status)
```

---

## 🔧 Autofix

This rule is **fixable**.

When safe, ESLint will automatically replace the comparison chain with an equivalent `_.includes` expression.

Examples:

```js
x === 'a' || x === 'b'
```

⬇️

```js
_.includes(['a', 'b'], x)
```

```js
x !== 1 && x !== 2
```

⬇️

```js
!_.includes([1, 2], x)
```

---

## 🚫 What the rule does NOT report

The rule is intentionally conservative and will NOT trigger in the following cases:

```js
// different variables
x === 1 || y === 2

// non-literal comparisons
x === a || x === b

// loose equality
x == 1 || x == 2

// mixed logical operators
x === 1 && x === 2

// single comparison
x === 1
```

---

## 🧠 Implementation notes

- Only strict equality (`===`) and strict inequality (`!==`) are supported
- All comparisons must reference the **same variable or member expression**
- Only literal values are collected
- The rule reports **once per logical chain** (outermost expression only)
- Fully compatible with Lodash import detection

---

## 📌 Rule name

```
prefer-includes-list
```

---

## 📎 Category

**Suggestion**

---

## 📦 Autofixable

✔ Yes

---

## 🔗 See also

- Lodash `_.includes`
- `prefer-is-nil`
- `prefer-find`

---

This rule is designed to be safe, explicit, and aligned with existing `eslint-plugin-lodash` conventions.
# npm-defect

A tool to track down defective packages.

Which package is considered defective? It is considered defective if it meets two or more criteria:

- Less than 50 thousand downloads
- Last updated 1 year ago
- Not GitHub links
- Has no dependents
- Has over 20 dependencies

Usage:

```
npx npm-defect "react"
```

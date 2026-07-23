# Markdown Link Protocol

## Purpose

Repo içi markdown dosyalarında source file linkleri workspace içinde düzgün açılmalıdır.

## Use This Format

```md
[Label line N](/src/path/to/file.tsx#LN)
```

Example:

```md
[ClientCheckoutPage.tsx line 15](/src/client-state/checkout/ClientCheckoutPage.tsx#L15)
```

## Do Not Use

```md
[label](./src/path/to/file.tsx#L15)
[label](/src/path/to/file.tsx:15)
[label](../src/path/to/file.tsx:15)
[label](/app/files/...)
```

## Note

Bu workspace'te önemli detay:

- doğru kök `/src`
- `./src` kullanma
- line jump için `#L15` formatını kullan

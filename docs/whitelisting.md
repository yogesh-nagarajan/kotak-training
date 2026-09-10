# Whitelisting Reference — Edge Delivery Services

Consolidated whitelist request for the client. There are **two independent layers**,
each configured in a different place. Both must be approved for the site to work.

| Layer | Source | Where configured | Controls |
|-------|--------|------------------|----------|
| **1. Code / CDN** | repo `kotak-training` | CDN / WAF rules | Which public URL paths the CDN serves |
| **2. Content source** | AEM site `kotakbankuae` | EDS config service (`tools.aem.live`) | Which AEM author paths may publish to EDS |

> ⚠️ **Verify site name before submitting.** This doc uses `kotakbankuae` per the latest
> request; an earlier reference used `kotakbankedsue`. Confirm the exact AEM site name and
> locale root with the client, then adjust Section 2 paths accordingly.

---

## 1. Code / CDN whitelist — repo `kotak-training`

All code is consolidated under `/release/*` (via `codeBasePath`), but Edge Delivery also
serves several required files and all content from the **root**, which cannot be namespaced.

### 1a. Allow — code (single prefix)
```
/release/*
```
Covers all code: `scripts/*` (aem.js, scripts.js, delayed.js), `styles/*` (styles.css,
lazy-styles.css, fonts.css), `blocks/*/*.{js,css}`, `icons/*.svg`, `fonts/*`.

### 1b. Allow — EDS required root files (cannot move to /release)
```
/head.html        # injected into every page; bootstraps loading of /release/*. Site is blank without it.
/favicon.ico
/404.html
/robots.txt
/sitemap.xml
```

### 1c. Allow — generated data (root-served JSON)
```
/query-index.json
/metadata.json
/*.json                    # any other authored sheets
```

### 1d. Allow — nav / footer / fragment content (fetched by blocks, root-served)
```
/nav.plain.html
/nav-variation.plain.html
/footer.plain.html
/content/*.plain.html      # header/footer/nav also try the /content/ prefix
/**/*.plain.html           # fragment block can load any content path as a fragment
```

### 1e. Allow — DAM assets (published from AEM)
```
/content/dam/kotak-training/*
```

### 1f. Allow — content pages (all at root)
```
/                          # homepage
/*                         # every authored page + its .plain.html
```

### 1g. Deny (defense-in-depth; EDS `.hlxignore` already blocks most at origin)
```
/*.md            /.*                /package*.json      /*.js.map
/tools/*         /models/*          /drafts/*           /REVERT_MARKER.txt
/fstab.yaml      /helix-*.yaml      /xwalk.json         /component-*.json
```

**Bottom line (code/CDN):** a `/release/*`-only allowlist is NOT sufficient — content pages,
`head.html`, nav/footer fragments, JSON sheets, and DAM assets are all served from root. The
`/release/*` prefix successfully consolidates **code**; content + the root files above must
also be allowed.

---

## 2. Content-source whitelist — AEM site `kotakbankuae`

On the content side, the "whitelist" is the `paths.includes` list in the EDS config service.
Anything not covered by `includes` will not publish to Edge Delivery. Path mapping is
**per-site** — this applies only to `kotakbankuae`.

> Replace `<locale>` with the actual locale root (e.g. `hi-in`, `en`) if the site uses one.
> If the site publishes from its root without a locale, use `/content/kotakbankuae/`.

```json
{
  "paths": {
    "mappings": [
      "/content/kotakbankuae/<locale>/:/",
      "/content/dam/kotakbankuae/:/assets/"
    ],
    "includes": [
      "/content/kotakbankuae/<locale>/",
      "/content/dam/kotakbankuae/"
    ],
    "excludes": [
      "/content/kotakbankuae/**/drafts/**"
    ]
  }
}
```

### `includes` — the content-source allowlist
- **`/content/kotakbankuae/<locale>/`** — the whole content tree. Covers every authored page
  **plus** `nav`, `nav-variation`, `footer`, and any `metadata` sheet, since they live inside
  this root. Do not list those individually.
- **`/content/dam/kotakbankuae/`** — the DAM folder. Required so images and videos publish.

### `mappings` — AEM path → public URL
- `/content/kotakbankuae/<locale>/:/` — content root served at `/`.
- `/content/dam/kotakbankuae/:/assets/` — DAM assets served under `/assets/`.

### Prerequisites for assets to actually deliver (Approach A)
1. EDS **technical account** (`<hash>@techacct.adobe.com`, created on first UE publish) has
   **read access** to `/content/dam/kotakbankuae/`.
2. Assets within EDS size/format limits, or have an `edge-delivery-services-<subtype>`
   rendition (e.g. `edge-delivery-services-mp4` for video) via an AEM processing profile.

### Where to apply
- **UI:** https://tools.aem.live/tools/site-admin/index.html — select org/site, edit path mapping.
- **API:** `POST https://admin.hlx.page/config/<org>/sites/kotakbankuae/content/paths.json`
  with the `paths` JSON above (requires an authorized admin identity).

---

## Quick checklist for the client approval request

- [ ] **CDN:** allow `/release/*`
- [ ] **CDN:** allow root files — `/head.html`, `/favicon.ico`, `/404.html`, `/robots.txt`, `/sitemap.xml`
- [ ] **CDN:** allow `/*.json`, `/**/*.plain.html`, `/content/dam/kotak-training/*`, and content pages `/*`
- [ ] **CDN:** deny source/config files (Section 1g)
- [ ] **Content source:** `paths.includes` for `/content/kotakbankuae/<locale>/` + `/content/dam/kotakbankuae/`
- [ ] **Content source:** tech-account read access to the DAM folder
- [ ] **Verify** the exact site name (`kotakbankuae` vs `kotakbankedsue`) and locale root

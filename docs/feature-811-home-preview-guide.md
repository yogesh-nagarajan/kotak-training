# How to Preview the `feature-811-home` Page in AEM

**Who this is for:** the project owner (`yogesh-nagarajan`) or anyone with author
access to the `kotak-training` project.

## Background

- The **code** (the `hero`, `cards`, and `img-container` blocks + styles) is already
  on the branch preview — AEM Code Sync deployed it when the `feature-811-home`
  branch was pushed. The blocks will render correctly.
- What is missing is the **page content**, which is authored into AEM (the content
  source is the AEM Author / Cloud Service, not git). It must be created in the
  author and previewed manually.

## Steps

### 1. Open the AEM Author / Universal Editor
Open your AEM as a Cloud Service author instance for `kotak-training` and confirm
you can see the project.

### 2. Create the page
Create a new page named **`feature-811-home`** at the site root (so it publishes to
`/feature-811-home`) and open it in the Universal Editor.

### 3. Build the four sections (top to bottom)

**Section 1 — Hero block**
- Image: hero banner (your real asset)
- Eyebrow: `ZERO BALANCE. DIGITAL FIRST. FOR EVERYONE.`
- Heading (H1): `Welcome to Kotak811`
- Body: `Open a zero balance savings account and manage everything from your phone.`
- Button: `Open account` -> `https://www.kotak811.com/`

**Section 2 — Cards block (4 cards)** — each card is image + heading + text:
1. **Zero balance savings account** — Enjoy everyday banking with no minimum balance and zero maintenance charges.
2. **Instant digital onboarding** — Open your account online in minutes with a fully paperless video KYC process.
3. **Rewards on every spend** — Earn points on daily purchases and redeem them the way you want.
4. **Free & unlimited transfers** — Send money instantly with free NEFT, RTGS, IMPS, and UPI transfers.

**Section 3 — Img-container block**
- Heading (H2): `Grow your savings with ActivMoney`
- Text: `Put idle funds to work with ActivMoney and earn better returns without losing instant access to your money.`
- Image: ActivMoney visual (your real asset)

**Section 4 — Hero block (secondary)**
- Image: app-benefits banner (your real asset)
- Eyebrow: `ONE APP. EVERYTHING YOU NEED.`
- Heading (H1): `Bank, pay & save in one place`
- Body: `A single digital account that keeps your money moving, wherever you are.`
- (No button)

### 4. Add your images
Upload/select your real assets in the author for each image slot above.

### 5. Preview
Click **Preview** (or the sidekick Preview button). The page will be available at:

`https://feature-811-home--kotak-training--yogesh-nagarajan.aem.page/feature-811-home`

### 6. (Optional) Publish
Click **Publish** to promote it to `.aem.live`.

## Alternative: let the assistant push it

Two ways to unblock the admin-API path:
- Grant `kushagra@xerago.com` access to the project's config in AEM, **or**
- Provide a scoped IMS token from an authorized account in
  Settings -> Agent permissions -> Custom IMS Token (never paste tokens in chat).

Then ask the assistant to retry the preview push.

## Reference

The local blueprint used to build this page lives at
`drafts/feature-811-home.plain.html`, and the generated structure is served locally
at `/content/feature-811-home`.

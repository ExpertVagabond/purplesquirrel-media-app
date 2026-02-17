# Solana dApp Store Submission Guide

## Prerequisites

- [ ] Signed release APK built via EAS (`eas build --platform android --profile production`)
- [ ] Solana wallet browser extension (Phantom/Solflare) with ~0.2 SOL
- [ ] Publishing assets in `publishing/media/`:
  - [x] App icon (512x512) — `icon.png`
  - [x] Banner graphic (1200x600) — `banner.png`
  - [x] 4 screenshots (1080p minimum) — `screenshot-1-connect.png` through `screenshot-4-upload.png`
- [ ] Review publisher policy at https://docs.solanamobile.com/dapp-publishing/policy

## Submission Steps (Web Portal)

### Step 1: Create Publisher Account
1. Go to https://publish.solanamobile.com
2. Sign up and complete publisher profile
3. Submit KYC/KYB verification (Purple Squirrel Media LLC)

### Step 2: Connect Publisher Wallet
1. Connect Solana wallet via browser extension
2. This wallet becomes permanent publisher wallet for this app
3. Ensure ~0.2 SOL loaded for fees

### Step 3: Configure ArDrive Storage
1. Select ArDrive as storage provider
2. Use cost calculator for APK size estimate
3. Fund storage via "Top Up Balance"

### Step 4: Enter App Details
1. Bottom-left menu: **Add a dApp > New dApp**
2. Fill in:
   - Name: **Purple Squirrel Media**
   - Package: `com.purplesquirrelmedia.app`
   - Category: **Social / Video**
   - Short description: "Upload, watch, and tip creators with SOL on the decentralized video platform."
   - Long description: (from `config.yaml`)
   - Upload: icon, banner, screenshots

### Step 5: Upload APK
1. Navigate to app Home > **"New Version"**
2. Upload the release-signed APK
3. Approve all wallet signing requests:
   - Publisher NFT mint (first time only)
   - App NFT mint (first time only)
   - Release NFT mint
   - ArDrive asset uploads

### Step 6: Review
- Auto-enters review queue
- Typically 2-5 business days
- Email notification on approval or changes needed

## Submission Steps (CLI Alternative)

```bash
# Install
npx dapp-store

# Mint publisher NFT (once)
npx dapp-store create publisher -k <keypair_path>

# Mint app NFT (once)
npx dapp-store create app -k <keypair_path>

# Mint release NFT (each version)
npx dapp-store create release \
  -k <keypair_path> \
  -b <android_sdk_build_tools_path> \
  -u https://api.mainnet-beta.solana.com

# Submit
npx dapp-store publish submit \
  -k <keypair_path> \
  -u https://api.mainnet-beta.solana.com \
  --requestor-is-authorized \
  --complies-with-solana-dapp-store-policies
```

Then post in Solana Mobile Discord `#dapp-store` channel for review.

## Fees

| Item | Cost |
|------|------|
| Publisher NFT mint | ~0.02-0.04 SOL |
| App NFT mint | ~0.02-0.04 SOL |
| Release NFT mint | ~0.02-0.04 SOL |
| ArDrive storage | Variable (by APK size) |
| Tx fees | ~$0.00025 each |
| **Total budget** | **~0.2 SOL** |

No annual developer fee. No listing fee.

## Important Notes

- **Signing key must be unique** — Do NOT reuse Google Play signing key
- **Keep signing key safe** — Loss means no updates possible
- **Publisher wallet is permanent** — Tied to all future submissions
- **No debug builds** — Only release builds accepted
- **Icon must match** — CLI validates submitted icon matches APK icon

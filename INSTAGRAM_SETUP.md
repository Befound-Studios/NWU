# Over de Voor — automatic Instagram gallery setup

The NWU page now includes a four-column Instagram gallery and a scheduled GitHub Actions sync.

## What is already installed

- The site shows four photographs in a responsive grid (four columns on desktop; two columns on mobile).
- The [Update Over de Voor Instagram feed](.github/workflows/update-instagram.yml) workflow checks for new posts at **02:17, 08:17, 14:17 and 20:17 UTC** every day.
- `scripts/sync_instagram.py` retrieves media from the authenticated **@overdevoor** professional Instagram account, checks the account username, and caches up to four latest images in `media/instagram/`.
- It updates `instagram-feed.json` so the public website can display the latest authorised posts without exposing credentials.
- The photos link to their actual Instagram posts. Video/Reels are represented with their thumbnail when available.
- If authentication fails, the script does **not** publish invented posts or erase the last successful data.

## Required activation — account owner action

1. Confirm that **@overdevoor is an Instagram Professional (Business or Creator) account**.
2. Use the official [Meta Instagram API](https://developers.facebook.com/docs/instagram-platform/) with **Instagram Login** to authorise the account. Your Meta app must have the necessary `instagram_business_basic` permission.
3. Obtain the authorised **Instagram User access token**. Do **not** paste it into GitHub source files, public issues, or ChatGPT.
4. Open repository **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `IG_ACCESS_TOKEN`
   - Secret: the authorised account's access token.
5. Open **Actions → Update Over de Voor Instagram feed → Run workflow** once.
6. Confirm that the run finishes successfully, `instagram-feed.json` now contains post data, and `media/instagram/` contains four images. The website will display them after GitHub Pages rebuilds.

**This workflow uses Instagram Login and `graph.instagram.com`**. A Facebook Login token for `graph.facebook.com` is a different API flow and cannot be used unchanged.

## Important limitations

- Until the token is authorised, the page honestly displays the four existing residence gallery pictures. It does **not** claim they are new Instagram posts.
- Scheduled GitHub Actions runs can be delayed and are not guaranteed to execute at their exact scheduled minute.
- Instagram long-lived tokens can expire or be revoked. Token renewal or re-authorisation is necessary when this happens. Check GitHub Actions run history regularly.
- Posts missing suitable media URLs cannot appear as a square gallery image; the script skips them.
- The account username is checked so a token for another account cannot silently populate the Over de Voor site.
- If you prefer a managed Instagram feed provider, it can replace this API integration after obtaining appropriate consent, but do not include a client-side Instagram access token.

## Typography

The sitewide body text scale, headings, secondary copy, captions and responsive type sizes are managed in `styles.css`. Avoid creating additional small font declarations lower in the cascade without reviewing the unified scale.

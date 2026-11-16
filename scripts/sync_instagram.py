#!/usr/bin/env python3
"""Synchronise the latest four authorised Over de Voor Instagram posts.

Requires a token for the @overdevoor Instagram professional account.
Uses the Instagram Graph API on the GitHub Actions runner, never in the browser.
"""
import datetime as dt
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "instagram-feed.json"
MEDIA_DIR = ROOT / "media" / "instagram"
GRAPH = os.getenv("IG_GRAPH_HOST", "graph.instagram.com")
API_VERSION = os.getenv("IG_API_VERSION", "v27.0")
USERNAME = "overdevoor"
MAX_IMAGE_BYTES = 7 * 1024 * 1024


def request_json(url):
    req = Request(url, headers={"Accept": "application/json", "User-Agent": "OverDeVoorWebsiteFeed/1.0"})
    with urlopen(req, timeout=30) as response:
        return json.load(response)


def download_image(url):
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise ValueError("Only secure image URLs are accepted")
    req = Request(url, headers={"User-Agent": "OverDeVoorWebsiteFeed/1.0"})
    with urlopen(req, timeout=35) as response:
        content_type = response.headers.get("Content-Type", "").split(";")[0].lower()
        extension = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}.get(content_type)
        if not extension:
            raise ValueError("Unsupported image type: " + content_type)
        image = response.read(MAX_IMAGE_BYTES + 1)
        if len(image) > MAX_IMAGE_BYTES:
            raise ValueError("Image exceeds configured limit")
        if len(image) < 200:
            raise ValueError("Image response was unexpectedly small")
        return image, extension


def main():
    token = os.environ.get("IG_ACCESS_TOKEN", "").strip()
    if not token:
        raise SystemExit("IG_ACCESS_TOKEN secret is required to enable automatic Instagram updates.")
    args = urlencode({
        "fields": "id,username,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
        "limit": 20,
        "access_token": token,
    })
    url = f"https://{GRAPH}/{API_VERSION}/me/media?{args}"
    payload = request_json(url)
    items = payload.get("data", [])
    if not isinstance(items, list):
        raise ValueError("Instagram media API returned no data list")

    # Media arrives newest-first, but explicitly sort by timestamp.
    items.sort(key=lambda item: item.get("timestamp", ""), reverse=True)
    posts = []
    staged = []
    for item in items:
        if len(posts) == 4:
            break
        if item.get("username", "").lower().lstrip("@") != USERNAME:
            # Prevent accidentally publishing media from the wrong connected account.
            raise ValueError("Connected Instagram account is not @overdevoor")
        permalink = item.get("permalink", "")
        if urlparse(permalink).hostname not in ("www.instagram.com", "instagram.com"):
            continue
        image_url = item.get("thumbnail_url") or item.get("media_url")
        if not image_url:
            continue  # Some videos or copyrighted media do not expose an image.
        try:
            data, ext = download_image(image_url)
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            print(f"Skipping media {item.get('id', '<unknown>')}: {type(exc).__name__}")
            continue
        index = len(posts) + 1
        name = f"post-{index}{ext}"
        staged.append((name, data))
        posts.append({
            "image": f"./media/instagram/{name}",
            "permalink": permalink,
            "caption": str(item.get("caption") or "")[:280],
            "timestamp": item.get("timestamp") or "",
        })
    if not posts:
        raise ValueError("No valid Instagram feed images returned; retaining existing published feed")

    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    for path in MEDIA_DIR.glob("post-*"):
        if path.is_file():
            path.unlink()
    for filename, data in staged:
        (MEDIA_DIR / filename).write_bytes(data)

    now = dt.datetime.now(dt.timezone.utc).isoformat()
    result = {
        "source": "@overdevoor",
        "updated_at": now,
        "posts": posts,
        "note": "Automatically refreshed by authorised Instagram Graph API through GitHub Actions.",
    }
    OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Published {len(posts)} authorised Instagram posts for @{USERNAME}.")


if __name__ == "__main__":
    main()

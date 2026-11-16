# Manual Instagram gallery — NWU one-page website

No automation is enabled. The four existing residence photographs remain visible until verified Instagram media is supplied.

To populate up to **40 actual latest posts** from @overdevoor, obtain an authorised one-time export or approved set of Instagram post images, post permalinks, captions and timestamps.

1. Copy the post cover images into `media/instagram/`, using unique file names.
2. Add each verified post to `instagram-gallery.json`, latest first. The page sorts by `timestamp` and displays at most 40.
3. Each item must use a real Instagram permalink and a same-origin relative image path: `./media/instagram/post-01.jpg`.
4. Commit the files to the NWU repository. The page is static and won't fetch new Instagram posts automatically.

Example:
```json
{
  "source": "@overdevoor",
  "snapshot_date": "2026-11-16T09:00:00Z",
  "posts": [
    {
      "image": "./media/instagram/post-01.jpg",
      "permalink": "https://www.instagram.com/p/ACTUAL_POST_ID/",
      "timestamp": "2026-11-16T08:30:00Z",
      "caption": "Actual post caption"
    }
  ]
}
```
The example is illustrative and MUST NOT be published as a real post. Never fabricate posts or claim the four original residence photos are the latest Instagram content. The official Instagram profile is linked above the gallery.

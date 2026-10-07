# public/video

Films of ALFA GLASS (the drone film of the 13.000 m² site, films of the CNC machine, interior loops), encoded by us from the material that is being shot.
Nothing here is invented: until a film exists its slot shows a still (see `src/lib/media-slots.ts`), and `kit/test-720.mp4` is a 4 s silent test clip
for the QA-only kit page (`KIT=1 npm run qa -- --pages /kit`), made from the warehouse photograph. **Delete `kit/` when the first real film lands.**

## Encoding (docs/redesign/DIRECTION.md §2.8.7)

Silent loops of 6–12 s with a seamless join, no audio track, so they need no captions. If a film ever has a voice it gets a Greek
`<track kind="captions">` and native controls instead of autoplay.

```bash
# H.264 MP4, 1920×1080 (<= 4 MB) and 1280×720 (<= 2 MB)
ffmpeg -i in.mov -vf scale=1920:1080 -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -an -movflags +faststart name-1080.mp4
ffmpeg -i in.mov -vf scale=1280:720  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -an -movflags +faststart name-720.mp4

# optional AV1 WebM, listed first in `sources`
ffmpeg -i in.mov -vf scale=1920:1080 -c:v libsvtav1 -crf 38 -an name-1080.webm

# the poster: a chosen frame as JPEG q85 at 1920px into public/media/, then register it
ffmpeg -i name-1080.mp4 -ss 00:00:02 -frames:v 1 -vf scale=1920:-1 -q:v 3 ../media/name-poster.jpg   # q:v 3 is about q85
node scripts/media-sizes.mjs
```

Then change one line of data: `slots.<name>.loop = { label, poster, sources }` in `src/lib/media-slots.ts` (or `coverLoop` / `film` of a work in
`src/content/works.ts`). The sources, in order: the AV1 WebM (if any), the 1080p MP4 with `media: "(min-width: 1440px)"`, the 720p MP4.

## Framing

- Drone film (4K, 25 or 30 fps, no audio): a slow top-down pass over the roof, an orbit of the building with the trucks, a truck leaving towards exit 4 of
  Attiki Odos. Each shot 10–15 s, framed so that both a 21:9 and a 4:5 crop work (`DroneBand`).
- Machine films: the gantry travelling the full 6 m, the spindle cutting acrylic in close-up, an automatic tool change, the vacuum holding a whole sheet,
  a V-groove and the panel folded by hand, finished letters lifted off the bed. Frame for a 2.88:1 crop (the bed) and for 16:9.

A video is never the LCP element: the poster paints first. Loops autoplay only on a large screen with a mouse, on a good connection, with motion allowed,
after the page has loaded and the browser is idle; everywhere else the poster stays and a button plays it.

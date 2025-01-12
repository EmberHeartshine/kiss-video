# kiss-video
*keep it simple, stupid*

Dead-simple video streaming website with support for multiple resolutions and captions.

[See a sample site deployed straight from this repository.](https://emberheartshine.github.io/kiss-video/public) (The videos and subtitles haven't been encoded and uploaded to the host yet, so it doesn't work completely yet. Try again tomorrow.)

## Installation
Download or clone the repo, configure, and point a Web server at the `public/` directory. That's it!

## Configuration
kiss-video is entirely static, so most of the configuration you need is in `db.json`. There are a few things to configure directly in `index.html` related to embedding. I highly recommend looking at the example included in this repo to get a better idea of what to expect.
### db.json
- `page.pageTitle`: Text that will display *after* the title or episode information in the browser's title bar.
- `series.titleFull`: The full name of the series, without any abbreviations. This isn't really used.
- `series.titleAbbrev`: The series abbreviation. This is put into the browser's title bar before the above.
- `series.vidPath`: The location of the video files. This can be relative or absolute, and can even be on other domains (assuming the target Web server is set up properly).
- `series.vttPath`: The location of the subtitle files in VTT format. This can be relative or absolute, and can even be on other domains (assuming the target Web server is set up properly). If this object is omitted, no subtitles are available.
- `series.vidRes`: The resolutions available, such as `480`, `720`, `1080`, etc.
- `series.vidRatio`: The aspect ratio of the videos represented decimally. 16:9 is `1.77777`, 4:3 is `1.33333`, etc.
- `seasons[n].seasNum`: The number of the season. This is used for display purposes only and does not affect ordering. Note that each item under `seasons` is its own object. It can be useful, even if you use `seasons[n].seasName` (below) for human readability.
- `seasons[n].seasName`: The title of the season, if you don't want season numbers to display. If this object is included, the season number will be omitted entirely.
- `seasons[n].episodes[m].epNum`: The number of the episode within the season. As with `seasons[n].seasNum`, this is used for display purposes only and does not affect ordering.  Note that each item under `episodes` is its own object. It can be useful, even if you use `seasons[n].episodes[m].epTitle` (below) for human readability.
- `seasons[n].episodes[m].epTitle`: The title of the episode, if you don't want episode numbers to display. If this object is included, the episode number will be omitted entirely.
- `seasons[n].episodes[m].epSubs[o].lang`: The language code of the subtitle. It's recommended to use [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) for human readability, and *must* match the code used on the VTT filename. Omitting the `seasons[n].episodes[m].epSubs[o]` object entirely will cause subtitle options to not appear.
- `seasons[n].episodes[m].epSubs[o].label`: The text that will appear in the subtitle selection menu. This can be anything, but it's recommended to match the language (eg. "Deutsch" for German, "Espa&ntilde;ol" for Spanish, etc) for end users.
- `seasons[n].episodes[m].epSubs[o].vidRatio`: If this particular video has a different ratio than the rest of the series, including this object will override the ratio for this one episode. Omitting this object causes the width calculation to match `series.vidRatio`.
- `seasons[n].episodes[m].epSubs[o].vidHeight`: This is used to override the height values and help them align with the more well-known resolutions. For example, a 16:10 "1080p" video is usually only 800px tall, rather than 1080px.
### index.html
These are all `meta` attributes in the `head` element, and affect how the site embeds when linked (eg. in Discord, Bluesky, etc). See the [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) for more information. Note that these are *not* dynamic and will *not* change no matter what URI you use.
- `theme-color`: The color of the preview box or stripe
- `title`, `og:title`: Title of the site
- `description`, `og:description`: Short description for proespective visitors
- `og:image`: Embedded preview image

## Video and subtitle file naming conventions
The video files *must* be named in the following manner:
```
sXXeYY-NNNp.mp4
```
where `XX` is a season number, `YY` is an episode number, and `NNN` is the resolution. Note that the "seasons" don't necessarily have to be seasons in the TV series sense; it's just how the video files are organized. However, they are always numeric in sequential order, so conventions such as `s00e01` for specials won't work. Similarly, there's no technical reason the resolutions need to actually be accurate, but it wouldn't make sense to *not* encode a video labeled `-720p` into 720p.

On the other hand, the subtitle files *must* be named in the following manner:
```
sXXeYY-LC.vtt
```
`XX` and `YY` are the same as before, and `LC` is the language code for the appropriate language. For example, English is `en` (`en-US`/`en-GB` can be configured if you want), Spanish is `es`, Spanish in Latin America is `es-419`, and so on. While there's nothing technical *forcing* you to make sure those language codes are correct (so long as they match the contents of `db.json`), I recommend making sure they're correct for your own sanity.

### A note about video codecs
kiss-video is intended to serve MP4 files using a standard video codec. You could `s/.mp4/.webm` in `viewEp.js` to serve WEBM instead, but not every browser (*cough cough Apple*) can handle all media types as embedded video.

import {
    hexToRGB,
    hslToRGB,
    rgbToHSL,
    nearestNeighbor,
    quantizePixels,
    selectDarkVibrantPixel,
} from "./color"
import { existsSync } from './fs'
import Gdk from 'types/@girs/gdk-3.0/gdk-3.0'
import GdkPixbuf from 'types/@girs/gdkpixbuf-2.0/gdkpixbuf-2.0'

const mpris = await Service.import('mpris')

const MusicColor = Variable({ color: '#1e1e2e', variant: 'dark', imageUrl: '' })

// Takes a URL, stores the file in a temporary dir, loads it into cairo and fades the left side with a solid color
export function SongArt(player: MprisPlayer) {
    let url = player.track_cover_url
    let image = `/tmp/ags/song-art/${url.split('/').pop()}.jpg`

    const albumArt = Widget.DrawingArea({
        widthRequest: 32,
        heightRequest: 32,
        /** Draws a faded image from left to right */
        drawFn: (_, cr, width, height) => {
            if (!existsSync(image)) return

            const pixBuf = GdkPixbuf.Pixbuf.new_from_file(image)
            const imageSurface = Gdk.cairo_surface_create_from_pixbuf(pixBuf, 1, null)

            if (MusicColor.value.imageUrl !== url) {
                const pixels = pixBuf.get_pixels().reduce < [number, number, number][] > ((acc, val, i, pixels) => {
                    if (i % 3 === 0) acc.push([val, pixels[i + 1], pixels[i + 2]])
                    return acc
                }, [])
                const width = pixBuf.get_width()
                const height = pixBuf.get_height()

                const scaleDownFactor = Math.max(1, Math.floor(Math.max(width, height) / 200))
                const scaledDownPixels = nearestNeighbor(pixels, width, height, scaleDownFactor)
                const vibrantSwatches = quantizePixels(scaledDownPixels, 64)
                const { pixel, luminance } = selectDarkVibrantPixel(vibrantSwatches)
                const rgbToHex = (rgb: [number, number, number]) =>
                    `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`
                MusicColor.setValue({
                    color: rgbToHex(pixel),
                    variant: luminance > 150 ? 'light' : 'dark',
                    imageUrl: url,
                })
            }

            // Calculate the scale factor to fill the image
            const imgWidth = imageSurface.getWidth()
            const imgHeight = imageSurface.getHeight()
            const scaleFactor = Math.min(width / imgWidth, height / imgHeight)
            cr.scale(scaleFactor, scaleFactor)

            const borderRadius = config.theme.borderRadius
            for (let x = 0; x < width; x++) {
                // Calculate the y offset for the current x position to comply with the border radius
                // on the right side only
                const borderRadiusAmount = Math.max(0, x - width + borderRadius + 1) / borderRadius
                // x^2 + (y - 1)^2 = 1 => y = sqrt(1 - x^2) - 1
                // Circle transposed down to be x=0,y=0 and x=1,y=-1
                const y = Math.sqrt(1 - borderRadiusAmount ** 2) - 1
                const yOffset = (-y * borderRadius) / scaleFactor

                // clip to the current column
                cr.rectangle(x / scaleFactor, yOffset, 1 / scaleFactor, imgHeight - yOffset * 2)
                cr.save()
                cr.clip()

                // paint the image
                cr.setSourceSurface(imageSurface, 0, 0)
                cr.paintWithAlpha(Math.min((x / width) * 2, 1))

                // revert the clip
                cr.restore()
            }
        },
    }).hook(player, async (albumArt) => {
        url = player.track_cover_url
        image = `/tmp/ags/song-art/${url.split('/').pop()}.jpg`
        // TODO: move logic out and deduplicate calls
        if (!existsSync(image)) {
            await Utils.execAsync(`mkdir -p /tmp/ags/song-art`).catch(console.error)
            await Utils.execAsync(`curl -o ${image} ${url}`).catch(console.error)
        }
        albumArt.queue_draw()
    })

    return albumArt
}

const audio = await Service.import('audio')
const changeSpotifyVolume = (raise: boolean) => {
    // @ts-expect-error - findLast actually does exist
    const spotifyStream = audio.apps.findLast((app: Stream) => app.stream?.name === 'spotify')
    if (!spotifyStream) return

    const newVolume = raise
        ? Math.min(1, spotifyStream.volume + 0.05) // if raise
        : Math.max(0, spotifyStream.volume - 0.05) // if lower

    spotifyStream.volume = newVolume
}

const copySpotifyURL = (url?: string) => {
    Utils.execAsync(`wl-copy ${url}`)
}

const Player = (player: MprisPlayer) => {
    const artist = Widget.Label({ css: `opacity: 0.8;`, halign: Align.START }).hook(player, (label) => {
        label.label = player.track_artists.join(', ')
    })
    const title = Widget.Label({ halign: Align.START }).hook(player, (label) => {
        label.label = player.track_title
    })

    const titleAndArtist = Widget.Box({
        valign: Align.CENTER,
        orientation: Orientation.VERTICAL,
        children: [title, artist],
    })
    const playPauseIcon = Icon(
        player
            .bind('play_back_status')
            .as((playbackStatus) => (playbackStatus === 'Playing' ? 'player-pause' : 'player-play')),
    )

    const songArt = SongArt(player)

    const seekbar = Widget.DrawingArea({
        clickThrough: true,
        drawFn: (_, cr, width, height) => {
            const { color, variant } = MusicColor.value
            // Lighten the color
            const hsl = rgbToHSL(hexToRGB(color))
            hsl[2] = Math.min(255, hsl[2] + (variant === 'dark' ? 30 : -20))
            const rgb = hslToRGB(hsl).map((c) => c / 255)

            // Mask with a rounded rectangle based on a border radius
            const borderRadius = config.theme.borderRadius
            cr.arc(borderRadius, borderRadius, borderRadius, Math.PI, (3 * Math.PI) / 2)
            cr.arc(width - borderRadius, borderRadius, borderRadius, (3 * Math.PI) / 2, 0)
            cr.arc(width - borderRadius, height - borderRadius, borderRadius, 0, Math.PI / 2)
            cr.arc(borderRadius, height - borderRadius, borderRadius, Math.PI / 2, Math.PI)
            cr.closePath()
            cr.clip()

            // Draw the line
            cr.setSourceRGBA(...rgb, 1)
            cr.rectangle(0, height - 2, width * (player.position / player.length), height)
            cr.fill()
        },
    })
        .poll(2000, (seekbar) => player.play_back_status === 'Playing' && seekbar.queue_draw())
        .hook(player, (seekbar) => seekbar.queue_draw())

    return Widget.Overlay({
        passThrough: true,
        child: TransparentButton({
            css: MusicColor.bind('value').as(
                ({ color, variant }) => `
          background: ${color};
          color: ${variant === 'dark' ? 'white' : 'black'};
          font-size: 10px;
          padding: 0px; 
          padding-left: 12px;
        `,
            ),
            onClicked: () => player.playPause(),
            onMiddleClick: () => copySpotifyURL(player.metadata['xesam:url']),
            onSecondaryClick: () => player.shuffle(),
            onScrollUp: () => changeSpotifyVolume(true),
            onScrollDown: () => changeSpotifyVolume(false),
            child: Row([playPauseIcon, titleAndArtist, songArt], { spacing: 12 }),
        }),
        overlays: [seekbar],
    })
}

export default function Music() {
    return Section(
        [
            Widget.Box({
                children: mpris
                    .bind('players')
                    .as((p) => p.filter((player) => player.name === 'spotify').map(Player)),
            }),
        ],
        { margin: 0 },
    )
}

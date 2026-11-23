# Orbit

An interactive 3D Earth and Sun model for classroom demonstrations of seasons, axial tilt, and day and night.

## Run

Requires Node.js 22.18+ (or 24+) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` for a production build and `npm run preview` to preview it. Run astronomy regressions with `npm test`.

## Publish On Surge

Public website: https://earth-in-motion-gr.surge.sh/

Publish only with the Surge account `koupani.a@googlemail.com`. The former address belongs to another account and must not be used for future updates.

```sh
npm run build
npx --yes surge ./dist earth-in-motion-gr.surge.sh
```

If another account is signed in, run `npx --yes surge logout` first. Then run the deployment command and sign in directly in the terminal with the account above. Never put passwords or tokens in project files.

Students only need the public link, with no account or login. Surge offers a free plan with usage limits. No backend, database, or environment secrets are required in the site. The old deployment remains controlled by its original owner; that owner must remove it if it should no longer be public.

## Classroom Views

- **Year & seasons:** change the date, jump to an equinox or solstice, or play the orbit.
- **Day & night:** inspect the illuminated and dark halves of Earth as it spins.
- **Solar System:** explore all eight planets, adjust an illustrative orbit model, reorder the planets by distance from the Sun and by diameter (smallest to largest, excluding rings), and find Earth between Venus and Mars.
- Selecting a planet in the model or planet row displays Greek facts, including the supplied textbook information. Jupiter's 95 moons and Olympus Mons's 26 km height are explicitly attributed to the textbook rather than presented as updated measurements. The Solar System view also notes its approximate age of 4.6 billion years.
- Compare Northern and Southern Hemisphere seasons and daylight in several cities.
- Switch axial tilt off to compare daylight with a hypothetical untilted Earth.
- Drag the scene to orbit the camera, scroll to zoom, and use the reset camera button to restore the view.
- Learning notes include explanations and a classroom experiment. Present enters browser fullscreen.
- The quiz matches the active Earth & Sun or Solar System lesson, with separate progress for each.

## Scientific Conventions

Solar ecliptic longitude comes from Astronomy Engine for calendar year 2026. Daily dates are sampled at 23:59 UTC so transition dates display the season beginning that day. The axis remains fixed in world space; rotation and revolution are counterclockwise when viewed from the north. Declination and geometric daylight are calculated from solar longitude and the selected tilt. Daylight excludes refraction, the Sun's apparent radius, and local terrain, so it differs slightly from published sunrise tables.

The circular orbit, planet sizes, distances, and independent animation rates are deliberately illustrative, not to scale. The four season names describe astronomical seasons in temperate regions, not all local climates.

Built with TypeScript, Vite, Three.js, Astronomy Engine, and Lucide. Earth surface texture is the NASA-derived Earth imagery distributed in the Three.js planet texture examples: https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg. Fonts are DM Sans and Manrope from Google Fonts; sans-serif fallbacks work offline. The Earth image is stored locally.
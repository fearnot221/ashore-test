# Ashore simplified v33

This replacement set removes the old dive/depth transition and non-essential interactions.

Replace these four files in the repository root:
- index.html
- styles.css
- script.js
- sw.js

Then commit and push:

```bash
cp /path/to/these/files/{index.html,styles.css,script.js,sw.js} /path/to/ashore-test/
cd /path/to/ashore-test
git add index.html styles.css script.js sw.js
git commit -m "Simplify homepage and remove dive transition"
git push origin main
```

Major removals:
- Intro/loading overlay
- Dive/sticky depth hero
- Canvas bubbles and cursor wake
- Cursor fish/depth meters/runtime meters
- Draggable/inertia lineup
- Tilt/audio/chaos controls
- Decorative specimen/collision/rift sections
- Continuous pointermove/requestAnimationFrame effects

Kept:
- 2026 visual identity
- Lineup
- Day and stage filters
- Artist-to-timetable jump
- Favorites
- Event/Instagram links

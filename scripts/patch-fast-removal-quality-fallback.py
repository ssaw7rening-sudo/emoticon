from pathlib import Path

path = Path('src/components/BackgroundRemover.jsx')
s = path.read_text(encoding='utf-8')

old = r'''    try {
      let method = 'fast';
      let blob = await tryFastUniformBackgroundRemoval(file);

      let quality = { status: 'pass', score: 0 };
      if (!blob) {
        method = 'ai';
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
        });
        quality = await assessRemovalQuality(blob);

        // ORMBG is broad-purpose. If its mask looks unreliable, automatically
        // try MODNet, a smaller portrait-matting model, and keep whichever
        // result scores better. This costs nothing on clean ORMBG results.
        if (quality.status !== 'pass') {
          try {
            setStage('preparing');
            setProgress(null);
            const portraitBlob = await removeWithModnet(file, (info) => {
              if (typeof info?.progress === 'number') {
                setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
              }
            });
            const portraitQuality = await assessRemovalQuality(portraitBlob);
            if (qualityRank(portraitQuality) < qualityRank(quality)) {
              blob = portraitBlob;
              quality = portraitQuality;
              method = 'modnet';
            }
          } catch (portraitError) {
            console.warn('MODNet portrait retry failed:', portraitError);
          }
        }
      }
'''

new = r'''    try {
      let method = 'fast';
      let blob = await tryFastUniformBackgroundRemoval(file);
      let quality = { status: 'pass', score: 0 };

      // The edge-color shortcut can occasionally mistake a complex indoor scene
      // for a uniform backdrop. Validate the fast result before accepting it.
      // Any warning/failure is discarded and routed through the AI models.
      if (blob) {
        try {
          const fastQuality = await assessRemovalQuality(blob);
          if (fastQuality.status === 'pass') {
            quality = fastQuality;
          } else {
            console.warn('Fast background removal rejected by quality gate:', fastQuality);
            blob = null;
            quality = { status: 'idle', score: 0 };
          }
        } catch (fastQualityError) {
          console.warn('Fast background validation failed; falling back to AI:', fastQualityError);
          blob = null;
          quality = { status: 'idle', score: 0 };
        }
      }

      if (!blob) {
        method = 'ai';
        setStage('preparing');
        blob = await removeWithAi(file, (info) => {
          if (typeof info?.progress === 'number') {
            setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
          }
        });
        quality = await assessRemovalQuality(blob);

        // ORMBG is broad-purpose. If its mask looks unreliable, automatically
        // try MODNet, a smaller portrait-matting model, and keep whichever
        // result scores better. This costs nothing on clean ORMBG results.
        if (quality.status !== 'pass') {
          try {
            setStage('preparing');
            setProgress(null);
            const portraitBlob = await removeWithModnet(file, (info) => {
              if (typeof info?.progress === 'number') {
                setProgress(Math.max(0, Math.min(100, Math.round(info.progress))));
              }
            });
            const portraitQuality = await assessRemovalQuality(portraitBlob);
            if (qualityRank(portraitQuality) < qualityRank(quality)) {
              blob = portraitBlob;
              quality = portraitQuality;
              method = 'modnet';
            }
          } catch (portraitError) {
            console.warn('MODNet portrait retry failed:', portraitError);
          }
        }
      }
'''

if old not in s:
    raise SystemExit('removeBackground anchor not found')

s = s.replace(old, new, 1)
path.write_text(s, encoding='utf-8')
print('Patched fast removal quality fallback')

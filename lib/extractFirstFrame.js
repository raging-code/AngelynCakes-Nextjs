/* ─── Robust first-frame extractor (ported unchanged from index.html) ──
   Strategy:
     a) preload="metadata" — browser only fetches the header
     b) on loadedmetadata  — seek to 0.01 s (forces a real frame)
     c) on seeked          — draw and resolve
     d) on loadeddata      — fallback draw if seeked never fires
     e) 15 s hard timeout  — give slow mobile connections time
──────────────────────────────────────────────────────────────────── */
export default function extractFirstFrame(videoSrc, canvasWidth, canvasHeight) {
  return new Promise(function (resolve) {
    var vid = document.createElement('video');
    vid.muted = true;
    vid.playsinline = true;
    vid.preload = 'metadata';

    var done = false;
    var fallbackTimeout;

    function finish(result) {
      if (done) return;
      done = true;
      clearTimeout(fallbackTimeout);
      try { vid.pause(); } catch (e) {}
      try { vid.removeAttribute('src'); vid.load(); } catch (e) {}
      resolve(result);
    }

    fallbackTimeout = setTimeout(function () { finish(null); }, 15000);

    function drawFrame() {
      try {
        var w = canvasWidth || vid.videoWidth || 252;
        var h = canvasHeight || vid.videoHeight || 480;
        if (w === 0 || h === 0) { finish(null); return; }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(vid, 0, 0, w, h);
        finish(canvas);
      } catch (e) {
        finish(null);
      }
    }

    vid.addEventListener('loadedmetadata', function () {
      try { vid.currentTime = 0.01; } catch (e) { finish(null); }
    });
    vid.addEventListener('seeked', function () { drawFrame(); });
    vid.addEventListener('loadeddata', function () {
      if (!done && vid.readyState >= 2) { drawFrame(); }
    });
    vid.addEventListener('error', function () { finish(null); });

    vid.src = videoSrc;
    vid.load();
  });
}

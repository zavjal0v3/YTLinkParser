function hasHiddenParent(element) {
  return element.closest('[hidden]') !== null;
}

function getSelectorByPageType() {
  const selectors = [
    "[id^='video-title'][href].ytd-playlist-video-renderer",
    "[id^='video-title'][href].ytd-grid-video-renderer",
    "[id^='video-title'][href].ytd-rich-grid-media"
  ];

  for (const sel of selectors) {
    const elements = Array.from(document.querySelectorAll(sel));
    const visibleElement = elements.find(el => !hasHiddenParent(el));
    if (visibleElement) {
      return sel;
    }
  }

  return null;
}

function extractVideoId(href) {
  const match = href.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

function extractShortsId(href) {
  const match = href.match(/\/shorts\/([^/?&]+)/);
  return match ? match[1] : null;
}

const selector = getSelectorByPageType();

const seenVideoIds = new Set();
const uniqueHrefs = [];

let foundVideos = false;
let foundShorts = false;

if (selector) {
  const elements = Array.from(document.querySelectorAll(selector));
  elements.forEach(e => {
    if (hasHiddenParent(e)) return;

    const href = e.getAttribute('href');
    const videoId = extractVideoId(href);
    if (videoId && !seenVideoIds.has(videoId)) {
      seenVideoIds.add(videoId);
      uniqueHrefs.push("https://www.youtube.com" + href);
      foundVideos = true;
    }
  });
}

const shortsElements = Array.from(document.querySelectorAll('.shortsLockupViewModelHostEndpoint.shortsLockupViewModelHostOutsideMetadataEndpoint[href^="/shorts"]'));
shortsElements.forEach(el => {
  if (hasHiddenParent(el)) return;

  const href = el.getAttribute('href');
  if (!href) return;

  const shortsId = extractShortsId(href);
  if (shortsId && !seenVideoIds.has(shortsId)) {
    seenVideoIds.add(shortsId);
    uniqueHrefs.push("https://www.youtube.com" + href);
    foundShorts = true;
  }
});

let typeMessage = '';
if (foundVideos && foundShorts) {
  typeMessage = 'videos and shorts';
} else if (foundVideos) {
  typeMessage = 'videos';
} else if (foundShorts) {
  typeMessage = 'shorts';
} else {
  typeMessage = 'videos';
}

if (uniqueHrefs.length !== 0) {
  console.log(`[YT Link Parser] Got ${uniqueHrefs.length} ${typeMessage}`);
  console.log(uniqueHrefs.join('\n'));
}
else console.log(`[YT Link Parser] No videos/shorts found`)


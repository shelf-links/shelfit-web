// Short badge text for each saved link, e.g. BBC, ETSY, AMZN.
// Matched on the website's host name, so "netflix.com" is never mistaken for "x.com".

const KNOWN_LABELS: Record<string, string> = {
  'instagram.com': 'INSTA',
  'tiktok.com': 'TKTOK',
  'youtube.com': 'YT',
  'youtu.be': 'YT',
  'spotify.com': 'SPTFY',
  'twitter.com': 'X',
  'x.com': 'X',
  'bbc.co.uk': 'BBC',
  'bbc.com': 'BBC',
  'bbcgoodfood.com': 'BBCGF',
  'bbcgoodfood.co.uk': 'BBCGF',
  'pinterest.com': 'PINTR',
  'amazon.co.uk': 'AMZN',
  'amazon.com': 'AMZN',
  'netflix.com': 'NETFLX',
  'asos.com': 'ASOS',
  'theguardian.com': 'GRDN',
  'ikea.com': 'IKEA',
  'hm.com': 'H&M',
  'cos.com': 'COS',
  'marksandspencer.com': 'M&S',
  'strava.com': 'STRVA',
  'theverge.com': 'VERGE',
  'wayfair.com': 'WAYFR',
  'wayfair.co.uk': 'WAYFR',
  'revolve.com': 'REVLV',
  'nandos.com': 'NNDOS',
  'nandos.co.uk': 'NNDOS',
  'etsy.com': 'ETSY',
  'techcrunch.com': 'TCRNCH',
  'nytimes.com': 'NYT',
  'wsj.com': 'WSJ',
  'reddit.com': 'REDDIT',
  'zara.com': 'ZARA',
  'next.co.uk': 'NEXT',
  'johnlewis.com': 'J.LEWIS',
  'boots.com': 'BOOTS',
  'ebay.co.uk': 'EBAY',
  'ebay.com': 'EBAY',
  'depop.com': 'DEPOP',
  'vinted.co.uk': 'VINTED',
  'goodreads.com': 'GDRDS',
  'medium.com': 'MEDIUM',
  'linkedin.com': 'LNKDIN',
  'airbnb.co.uk': 'AIRBNB',
  'airbnb.com': 'AIRBNB',
  'booking.com': 'BKNG',
  'skyscanner.net': 'SKYSCN',
  'trainline.com': 'TRNLNE',
  'deliveroo.co.uk': 'DLVRO',
  'ubereats.com': 'UBEATS',
  'justeat.co.uk': 'JEAT',
  'dominos.co.uk': 'DMINOS',
  'greggs.co.uk': 'GREGGS',
  'waitrose.com': 'WTROSE',
  'tesco.com': 'TESCO',
  'sainsburys.co.uk': 'SBRYS',
  'ocado.com': 'OCADO',
};

const TLDS = new Set(['com', 'co', 'uk', 'net', 'org', 'io', 'app', 'is', 'la', 'us', 'me']);

export function getPlatformLabel(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '?';
  }

  for (const [domain, label] of Object.entries(KNOWN_LABELS)) {
    if (host === domain || host.endsWith('.' + domain)) return label;
  }
  if (host.startsWith('shein.') || host.includes('.shein.')) return 'SHEIN';

  const parts = host.split('.');
  const meaningful = parts.filter((part) => !TLDS.has(part));
  const name = meaningful[meaningful.length - 1] || parts[0];

  if (name.length <= 7) return name.toUpperCase();
  const consonants = name.replace(/[aeiou]/gi, '');
  if (consonants.length >= 4 && consonants.length <= 7) return consonants.toUpperCase();
  return name.toUpperCase().slice(0, 6);
}

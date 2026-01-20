export function collectVisitorContext() {
  const ctx = {};

  try {
    ctx.referrer = document.referrer || 'direct';
  } catch (e) {
    ctx.referrer = 'direct';
  }

  try {
    const params = new URLSearchParams(window.location.search);
    ctx.utm_source = params.get('utm_source') || '';
    ctx.utm_medium = params.get('utm_medium') || '';
    ctx.utm_campaign = params.get('utm_campaign') || '';
    ctx.utm_content = params.get('utm_content') || '';
    ctx.utm_term = params.get('utm_term') || '';
  } catch (e) {}

  try {
    const ua = navigator.userAgent;
    const uaLower = ua.toLowerCase();
    
    if (/mobile|android|iphone|ipad|ipod/.test(uaLower)) {
      ctx.device = /ipad|tablet/.test(uaLower) ? 'tablet' : 'mobile';
    } else {
      ctx.device = 'desktop';
    }
    
    if (/iphone/.test(uaLower)) ctx.os = 'iOS';
    else if (/ipad/.test(uaLower)) ctx.os = 'iPadOS';
    else if (/mac/.test(uaLower)) ctx.os = 'macOS';
    else if (/android/.test(uaLower)) ctx.os = 'Android';
    else if (/windows/.test(uaLower)) ctx.os = 'Windows';
    else if (/linux/.test(uaLower)) ctx.os = 'Linux';
    else ctx.os = 'Unknown';
    
    if (/chrome/.test(uaLower) && !/edg/.test(uaLower)) ctx.browser = 'Chrome';
    else if (/safari/.test(uaLower) && !/chrome/.test(uaLower)) ctx.browser = 'Safari';
    else if (/firefox/.test(uaLower)) ctx.browser = 'Firefox';
    else if (/edg/.test(uaLower)) ctx.browser = 'Edge';
    else ctx.browser = 'Other';
  } catch (e) {
    ctx.device = 'unknown';
  }

  try {
    ctx.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    ctx.local_time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    ctx.day_of_week = now.toLocaleDateString('en-US', { weekday: 'long' });
  } catch (e) {}

  try {
    ctx.current_page = window.location.pathname;
    ctx.page_title = document.title;
  } catch (e) {}

  try {
    const viewedKey = 'mtd_pages_viewed';
    const viewed = parseInt(sessionStorage.getItem(viewedKey) || '0') + 1;
    sessionStorage.setItem(viewedKey, viewed.toString());
    ctx.pages_viewed = viewed;
  } catch (e) {
    ctx.pages_viewed = 1;
  }

  try {
    const visitKey = 'mtd_visited';
    ctx.returning_visitor = !!localStorage.getItem(visitKey);
    localStorage.setItem(visitKey, 'true');
  } catch (e) {
    ctx.returning_visitor = false;
  }

  try {
    ctx.screen_width = window.screen.width;
    ctx.screen_height = window.screen.height;
    ctx.language = navigator.language || navigator.userLanguage;
  } catch (e) {}

  return ctx;
}

export async function fetchGeoData() {
  try {
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(2000) 
    });
    if (!response.ok) return {};
    const data = await response.json();
    return {
      country: data.country_name || '',
      city: data.city || '',
      region: data.region || '',
      ip: data.ip || ''
    };
  } catch (e) {
    return {};
  }
}

export async function getFullVisitorContext() {
  const baseContext = collectVisitorContext();
  const geoData = await fetchGeoData();
  return { ...baseContext, ...geoData };
}


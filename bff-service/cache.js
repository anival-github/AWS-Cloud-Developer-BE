let cache = null;

const getFromCache = () => {
  return cache;
}

const setToCache = (newCache) => {
  cache = newCache;
  setTimeout(() => {
    cache = null;
  }, 120000)
}

const checkIsCacheUsed = (UrlPath, method) => {
  return UrlPath === '/products' && method === 'GET';
}

module.exports = {
  getFromCache,
  setToCache,
  checkIsCacheUsed,
}
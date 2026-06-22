using backend.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.Implementations
{
    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _cache;

        public CacheService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public Task<T?> GetAsync<T>(string key)
        {
            _cache.TryGetValue(key, out T? value);
            return Task.FromResult(value);
        }

        public void Set<T>(string key, T value, TimeSpan duration)
        {
            _cache.Set(key, value, duration);
        }

        public void Remove(string key)
        {
            _cache.Remove(key);
        }

        public int GetVersion(string key)
        {
            return _cache.GetOrCreate(key, entry =>
            {
                entry.Priority = CacheItemPriority.NeverRemove;
                return 1;
            });
        }

        public void IncrementVersion(string key)
        {
            var currentVersion = GetVersion(key);
            _cache.Set(key, currentVersion + 1);
        }
    }
}
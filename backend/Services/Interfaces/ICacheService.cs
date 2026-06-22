namespace backend.Services.Interfaces
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key);
        void Set<T>(string key, T value, TimeSpan duration);
        void Remove(string key);
        int GetVersion(string key);
        void IncrementVersion(string key);
    }
}

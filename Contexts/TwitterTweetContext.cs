using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Models.Twitter;

namespace OverBeliefApi.Contexts
{
    public class TwitterTweetContext : DbContext
    {
        public TwitterTweetContext(DbContextOptions<TwitterTweetContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TwitterTweetEntity>()
                .HasKey(c => new { c.Id });
        }

        public DbSet<TwitterTweetEntity> TwitterTweetEntities { get; set; } = null!;
    }
}

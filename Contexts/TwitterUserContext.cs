using Microsoft.EntityFrameworkCore;
using OverBeliefApi.Models.Twitter;

namespace OverBeliefApi.Contexts
{
    public class TwitterUserContext : DbContext
    {
        public TwitterUserContext(DbContextOptions<TwitterUserContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TwitterUserEntity>()
                .HasKey(c => new { c.Id });
        }

        public DbSet<TwitterUserEntity> TwitterUserEntities { get; set; } = null!;
    }
}

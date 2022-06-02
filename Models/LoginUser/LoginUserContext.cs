using Microsoft.EntityFrameworkCore;

namespace OverBeliefApi.Models.LoginUser
{
    public class LoginUserContext : DbContext
    {
        public LoginUserContext(DbContextOptions<LoginUserContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LoginUserEntity>()
                .HasKey(c => new { c.Id });
        }

        public DbSet<LoginUserEntity> LoginUserEntities { get; set; } = null!;
    }
}

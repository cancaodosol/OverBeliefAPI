using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OverBeliefApi.Entites
{
    [Table("TwitterUser")]
    public class TwitterUserEntity
    {
        [Key]
        public long Id { get; set; }
        public long OwnedUserId { get; set; }
        public string? Div { get; set; }
        public string? Tag { get; set; }
        public string? Name { get; set; }
        public string? ScreenName { get; set; }
        public int FriendsCount { get; set; }
        public int FollowersCount { get; set; }
        public string? ProfileBannerUrl { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }
    }
}

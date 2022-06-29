namespace OverBeliefApi.Models.Twitter
{
    public class TwitterUserApiDto
    {
        public long? Id { get; set; }
        public string? Name { get; set; }
        public string? ScreenName { get; set; }
        public int FriendsCount { get; set; }
        public int FollowersCount { get; set; }
        public string? ProfileBannerUrl { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }

        public TwitterUserApiDto(CoreTweet.User user)
        {
            this.Id = user.Id;
            this.Name = user.Name ?? string.Empty;
            this.ScreenName = user.ScreenName ?? string.Empty;
            this.FriendsCount = user.FriendsCount;
            this.FollowersCount = user.FollowersCount;
            this.ProfileBannerUrl = user.ProfileBannerUrl?? string.Empty;
            this.ProfileImageUrl = user.ProfileImageUrlHttps?? string.Empty;
            this.Description = user.Description?? string.Empty;
        }
    }
}

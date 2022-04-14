namespace OverBeliefApi.Models.Twitter
{
    public class TwitterUserApiDto
    {
        public string? Name { get; set; }
        public string? ScreenName { get; set; }
        public int FriendsCount { get; set; }
        public int FollowersCount { get; set; }
        public string? ProfileBannerUrl { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Description { get; set; }

        public TwitterUserApiDto(CoreTweet.User user)  
        {
            this.Name = user.Name;
            this.ScreenName = user.ScreenName;
            this.FriendsCount = user.FriendsCount;
            this.FollowersCount = user.FollowersCount;
            this.ProfileBannerUrl = user.ProfileBannerUrl;
            this.ProfileImageUrl = user.ProfileImageUrlHttps;
            this.Description = user.Description;
        }
    }
}

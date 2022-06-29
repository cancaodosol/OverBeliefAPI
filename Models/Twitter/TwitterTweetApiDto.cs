namespace OverBeliefApi.Models.Twitter
{
    public class TwitterTweetApiDto
    {
        public long Id { get; set; }
        public string? Text { get; set; }
        public string? FullText { get; set; }
        public int? RetweetCount { get; set; }
        public int? FavoriteCount { get; set; }
        public string? Source { get; set; }
        public string? CreatedAt { get; set; }
        public TwitterUserApiDto User { get; set; }

        public TwitterTweetApiDto(CoreTweet.Status status) 
        {
            this.Id = status.Id;
            this.Text = status.Text;
            this.FullText = status.FullText;
            this.RetweetCount = status.RetweetCount;
            this.FavoriteCount = status.FavoriteCount;
            this.CreatedAt = status.CreatedAt.ToString("yyyy/MM/dd HH:mm");
            this.Source = status.Source;
            this.User = new TwitterUserApiDto(status.User);
        }
    }
}

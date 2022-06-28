using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OverBeliefApi.Models.Twitter
{
    [Table("TwitterTweet")]
    public class TwitterTweetEntity
    {
        [Key]
        public long Id { get; set; }
        public string Div { get; set; }
        public string Tag { get; set; }
        public long TweetId { get; set; }
        public string Text { get; set; }
        public string FullText { get; set; }
        public int RetweetCount { get; set; }
        public int FavoriteCount { get; set; }
        public string Source { get; set; }
        public string CreatedAt { get; set; }
        public string User { get; set; }
    }
}

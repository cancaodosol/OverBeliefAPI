using CoreTweet;
using OverBeliefApi.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

namespace OverBeliefApi.Models.Twitter
{
    public class TwitterService
    {
        // private readonly string APIKey = "03cMf7MH6SuRuYSbpfHkZ29x8";
        // private readonly string APISecret = "rQqylWxgIV5oRYrry5nQrQrPyE5hymU9gWlHlgjCqj7nqUstVM";
        // private readonly string APIToken = "1265324744468951040-rdoy1GK16JvQar2GMt0xjuvNgNfvod";
        // private readonly string APITokenSecret = "cNL77Tpb7GXkeYWAkLgyEtRlxU7cT5ZY2laTQ59VBek2C";
        private readonly string APIKey = "jXxiikEh8LjaqJmNE68EK1r5q";
        private readonly string APISecret = "1BVFvnU7505bgqfbZgcBjq2Cbw3bK26uz7JZ8cU6dIG5KYqOed";
        private readonly string APIToken = "1434089206909833220-UQpBfjumOCOtEybm3rKRsp0upvoIxR";
        private readonly string APITokenSecret = "ecbWnUWtLw532PdjRx6Tgu2Gd9f55kpN896TINPuTTfUa";

        private Tokens Tokens;
        private OAuth.OAuthSession Session;
        private Config config = Config.Instance;
        /// <summary>
        /// Twitterサービスクラスのコンストラクタ
        /// </summary>
        public TwitterService()
        {
            this.Session = OAuth.Authorize(config.token.ConsumerKey, config.token.ConsumerSecret);
            this.Tokens = CoreTweet.Tokens.Create(config.token.ConsumerKey, config.token.ConsumerSecret, APIToken, APITokenSecret);
            this.Tokens.Statuses.HomeTimeline(tweet_mode => "extended");
        }

        public TwitterService(string pincode)
        {
            this.Session = OAuth.Authorize(APIKey, APISecret);
            this.Tokens = OAuth.GetTokens(this.Session, pincode);
            this.Tokens.Statuses.HomeTimeline(tweet_mode => "extended");
        }

        /// <summary>
        /// Twitterアカウントのアプリへのアクセス許可認証画面へのURLを返します。
        /// </summary>
        /// <returns></returns>
        public string GetUserAuthorizeUri()
        {
            return this.Session.AuthorizeUri.AbsoluteUri;
        }

        /// <summary>
        /// Twitterアカウントのアプリへのアクセス許可認証で作成されたPINコードを基に、新しいトークンをセットします。
        /// </summary>
        /// <param name="pincode"></param>
        /// <remarks>この時のSessionは、this.Session.AuthorizeUri.AbsoluteUriをした時と同様のものである必要がある。</remarks>
        public void SetTokensByPincode(string pincode)
        {
            this.Tokens = OAuth.GetTokens(this.Session, pincode);
        }

        /// <summary>
        /// ツイートをする。
        /// </summary>
        /// <param name="text">ツイート内容</param>
        public void Tweet(string text)
        {
            this.Tokens.Statuses.Update(status: text);
        }

        /// <summary>
        /// リプライツイートをする。
        /// </summary>
        /// <param name="text">リプライ内容</param>
        /// <param name="targetStateId">リプライ対象のツイートID</param>
        public void Reply(string text, long targetStateId)
        {
            this.Tokens.Statuses.Update(
                status: text,
                in_reply_to_status_id: targetStateId
            );
        }

        /// <summary>
        /// リツイートする。
        /// </summary>
        /// <param name="targetStateId">リツイート対象ツイートID</param>
        public void Retweet(long targetStateId)
        {
            var tweet = this.Tokens.Statuses.Show(id: targetStateId);
            if (!(bool)tweet.IsRetweeted)
            {
                this.Tokens.Statuses.Retweet(id: targetStateId);
            }
        }

        /// <summary>
        /// いいねする。
        /// </summary>
        /// <param name="targetStateId">いいね対象ツイートID</param>
        public void DoFavorite(long targetStateId)
        {
            var tweet = this.Tokens.Statuses.Show(id: targetStateId);
            if (!(bool)tweet.IsFavorited)
            {
                this.Tokens.Favorites.Create(id: targetStateId);
            }
        }

        public List<User> GetMyFriends()
        {
            return this.Tokens.Friends.List().ToList();
        }

        /// <summary>
        /// 過去数日分のツイートの取得を行う。
        /// ただし、指定期間内に100ツイート以上ある場合は正しく機能しない。
        /// </summary>
        /// <param name="period">過去取得対象期間(日)</param>
        /// <returns></returns>
        public List<CoreTweet.Status> GetStatusesLast(int period)
        {
            var statuses = this.GetTweetsOfFrinds(100);
            var lastStatuses = statuses.Where(_ => _.CreatedAt.UtcDateTime >= DateTime.Now.AddDays(-1 * period) && _.CreatedAt.UtcDateTime != DateTime.Now).ToList();

            return lastStatuses;
        }

        /// <summary>
        /// 特定のユーザーのツイート内容の取得を行う。
        /// </summary>
        /// <param name="userScreenName">対象ユーザー表示名</param>
        /// <param name="count">取得するツイート数</param>
        /// <returns>結果ツイート</returns>
        public List<Status> GetTweetsOfTargetUser(string userScreenName, int count)
        {
            return this.Tokens.Statuses.UserTimeline(count: count, screen_name: userScreenName).ToList();
        }

        /// <summary>
        /// メイントークンのフォローメンバーを対象にツイート内容の取得を行う。
        /// </summary>
        /// <param name="count">各メンバーから取得するツイート数</param>
        /// <returns>結果ツイート</returns>
        public List<Status> GetTweetsOfFrinds(int count)
        {
            var result = new List<Status>();

            var memberNames = this.Tokens.Friends.List().Select(x => x.ScreenName).ToArray();
            result = GetTweetsByUserScreenNames(count, memberNames);

            return result;
        }

        /// <summary>
        /// メイントークンのフォローメンバーを対象にツイート内容の取得を行う。
        /// </summary>
        /// <param name="count">各メンバーから取得するツイート数</param>
        /// <returns>結果ツイート</returns>
        public List<Status> GetTweetsByUserScreenNames(int count, string[] memberNames)
        {
            var result = new List<Status>();

            foreach (var name in memberNames)
            {
                var tweets = this.Tokens.Statuses.UserTimeline(count: count, screen_name: name);
                foreach (var tweet in tweets)
                {
                    result.Add(tweet);
                }
            }

            return result;
        }

        /// <summary>
        /// テキスト検索の結果ツイートを取得する。
        /// </summary>
        /// <param name="searchText">検索キーワード</param>
        /// <param name="count">検索結果の最大ツイート数</param>
        /// <returns>結果ツイート</returns>
        public List<Status> GetSearchTweets(string searchText, int count)
        {
            return this.Tokens.Search.Tweets(count: count, q: searchText).ToList();
        }
    }
}

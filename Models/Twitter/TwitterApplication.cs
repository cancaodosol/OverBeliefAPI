using CoreTweet;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;

namespace OverBeliefApi.Models.Twitter
{
    public class TwitterApplication
    {
        private readonly TwitterService _twitterService;
        private readonly int _lowerLimitFavoriteCount = 3;
        public TwitterApplication()
        {
            _twitterService = new TwitterService();
        }

        public List<Status> GetMostFavoritedTweets(string targetUserName, int saerchMaxCount)
        {
            var targetUsers = new string[] {
                targetUserName
            };
            var tweets = _twitterService.GetTweetsByUserScreenNames(saerchMaxCount, targetUsers);

            // 誰かへの返信リツイートは除去
            // tweets = tweets.Where(x => string.IsNullOrEmpty(x.InReplyToScreenName)).ToList();

            tweets = tweets.OrderByDescending(x => x.FavoriteCount).ToList();

            return tweets;
        }
        public List<Status> GetTimelines(string[] targetUserNames, int saerchMaxCount=50)
        {
            var tweets = _twitterService.GetTweetsByUserScreenNames(saerchMaxCount, targetUserNames);
            tweets = tweets.OrderByDescending(x => x.CreatedAt).ToList();
            return tweets;
        }

        /// <summary>
        /// 特定のツイートにいいねしたユーザーのプロフィールバナーを取得します。
        /// </summary>
        /// <param name="targetTweetID"></param>
        /// <param name="searchResultMax"></param>
        public void GetProfileBannersByTweetID(string targetTweetID, int searchResultMax)
        {
            Console.WriteLine("準備中です。");
        }

        /// <summary>
        /// 特定のユーザーのフォロワーのプロフィールバナーを取得します。
        /// </summary>
        /// <param name="targetTweetID"></param>
        /// <param name="searchResultMax"></param>
        public void GetProfileBannersByUserID(string targetUserID, int searchResultMax)
        {
            Console.WriteLine("準備中です。");
        }

        /// <summary>
        /// プロフィールバナーを検索キーワードから取得します。
        /// </summary>
        /// <param name="searchKeyWord"></param>
        /// <param name="searchResultMax"></param>
        public List<User> GetProfileBannersBySearchKeyWord(string searchKeyWord, int searchResultMax)
        {
            var states = _twitterService.GetSearchTweets(searchKeyWord, searchResultMax);
            var users = states.Select(x => x.User).ToList();
            for (var i = 0; i < users.Count; i++)
            {
                for (var j = users.Count-1; j > i; j--)
                {
                    if (users[i].Id == users[j].Id) users.RemoveAt(j);
                }
            }
            return users;
        }
    }
}

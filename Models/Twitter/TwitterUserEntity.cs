﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OverBeliefApi.Models.Twitter
{
    [Table("TwitterUser")]
    public class TwitterUserEntity
    {
        [Key]
        public long Id { get; set; }
        public string Div { get; set; }
        public string Tag { get; set; }
        public string Name { get; set; }
        public string ScreenName { get; set; }
        public int FriendsCount { get; set; }
        public int FollowersCount { get; set; }
        public string ProfileBannerUrl { get; set; }
        public string ProfileImageUrl { get; set; }
        public string Description { get; set; }
    }
}
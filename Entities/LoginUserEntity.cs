using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OverBeliefApi.Entites
{
    [Table("LoginUser")]
    public class LoginUserEntity
    {
        [Key]
        public long Id { get; set; }
        public string EmailAddress { get; set; }
        public string LoginPassword { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PassCode { get; set; }
        public string? ScreenName { get; set; }
        public string? TwitterApiAccessToken { get; set; }
        public string? TwitterApiAccessTokenSecret { get; set; }
        public string? TwitterName { get; set; }
        public DateTime CreateOn { get; set; }
        public DateTime ModefiedOn { get; set; }
    }
}

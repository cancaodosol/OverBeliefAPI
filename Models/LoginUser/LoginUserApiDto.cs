namespace OverBeliefApi.Models.LoginUser
{
    public class LoginUserApiDto
    {
        public long Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ScreenName { get; set; }
        public string? TwitterApiPincode { get; set; }
        public string? EmailAddress { get; set; }
        public string? TwitterName { get; set; }
    }
}

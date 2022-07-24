using System.Text;

namespace OverBeliefApi.Dtos
{
    public class ErrorMsgDto
    {
        public bool? IsError { get; set; } = false;
        public string? Id { get; private set; }
        public string? Message { get; private set; }
        public string? Tip { get; private set; }
        public string? Code { get; private set; }
        public ErrorMsgDto(string message, string tip="", string id = "", string code = "500") 
        {
            IsError = true;
            Message = message;
            Tip = tip;
            Id = id;
            Code = code;
        }
    }
}

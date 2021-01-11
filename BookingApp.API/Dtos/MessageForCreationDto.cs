using System;

namespace BookingApp.API.Dtos
{
    public class MessageForCreationDto
    {
        public int SenderId { get; set; }
        public string SenderFullName { get; set; }
        public int RecipientId { get; set; }
        public string RecipientFullName { get; set; }
        public DateTime MessageSent { get; set; }
        public string Content { get; set; }
        public MessageForCreationDto()
        {   
            MessageSent = DateTime.Now;
        }
        
    }
}
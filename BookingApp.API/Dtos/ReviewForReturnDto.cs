using System;

namespace BookingApp.API.Dtos
{
    public class ReviewForReturnDto
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public string PublicId { get; set; }
        public bool IsApproved { get; set; }
        public int Rating { get; set; }
        public int BookingId { get; set; }

    }
}
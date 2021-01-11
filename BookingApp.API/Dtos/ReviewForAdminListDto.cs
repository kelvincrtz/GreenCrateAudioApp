using System;

namespace BookingApp.API.Dtos
{
    public class ReviewForAdminListDto
    {   
        public int Id { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public int Rating { get; set; }
        public bool isApproved { get; set; }
        public int BookingId { get; set; }
        public UserForReviewListDto User { get; set; }
        public BookingForReviewListDto Booking { get; set; }
    }
}
using System;

namespace BookingApp.API.Dtos
{
    public class ReviewForListDto
    {
        public string Url { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public int Rating { get; set; }
        public UserForReviewListDto User { get; set; }
    }
}
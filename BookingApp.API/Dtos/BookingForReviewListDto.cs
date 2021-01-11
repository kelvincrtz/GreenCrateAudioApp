using System;

namespace BookingApp.API.Dtos
{
    public class BookingForReviewListDto
    {
        public DateTime When { get; set; }
        public DateTime FromTime { get; set; }
        public DateTime ToTime { get; set; }
        public string Location { get; set; }
    }
}
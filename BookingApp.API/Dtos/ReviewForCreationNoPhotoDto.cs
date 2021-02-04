using System;

namespace BookingApp.API.Dtos
{
    public class ReviewForCreationNoPhotoDto
    {
        public string Description { get; set; }

        public DateTime DateAdded { get; set; }

        public bool IsApproved { get; set; }

        public int Rating { get; set; }

        public ReviewForCreationNoPhotoDto()
        {
            DateAdded = DateTime.Now;
        }
    }
}
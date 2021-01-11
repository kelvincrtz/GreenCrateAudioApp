using System;
using System.ComponentModel.DataAnnotations;

namespace BookingApp.API.Dtos
{
    public class BookingForUpdateDto
    {
        [Required]
        public DateTime When { get; set; } 

        [Required]
        public DateTime FromTime { get; set; } 

        [Required]
        public DateTime ToTime { get; set; }

        public DateTime DateAdded { get; set; }

        [Required]
        public string Location { get; set; }

        public bool IsEdited { get; set; }

        public BookingForUpdateDto()
        {
            DateAdded = DateTime.Now;
            IsEdited = true;
        }
    }
}
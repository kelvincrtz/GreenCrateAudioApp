using System;
using System.ComponentModel.DataAnnotations;

namespace BookingApp.API.Dtos
{
    public class BookingForCreationDto
    {   
        [Required]     
        public int UserId { get; set; }

        public string Status { get; set; }

        [Required]
        public DateTime When { get; set; } 

        [Required]
        public DateTime FromTime { get; set; } 

        [Required]
        public DateTime ToTime { get; set; }

        public DateTime DateAdded { get; set; }

        [Required]
        public string Location { get; set; }

        public BookingForCreationDto()
        {
            DateAdded = DateTime.Now;
        }
    }
}
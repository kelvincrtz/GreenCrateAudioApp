using System;
using System.ComponentModel.DataAnnotations;

namespace BookingApp.API.Dtos
{
    public class BookingForUpdateAdminDto
    {
        [Required]
        public DateTime FromTime { get; set; } 

        [Required]
        public DateTime ToTime { get; set; }

        public DateTime DateAdded { get; set; }

        public bool IsEdited { get; set; }

        public BookingForUpdateAdminDto()
        {
            DateAdded = DateTime.Now;
            IsEdited = true;
        }
    }
}
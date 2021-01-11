using System;
using System.ComponentModel.DataAnnotations;

namespace BookingApp.API.Dtos
{
    public class UserForRegisterDto
    {
        [Required]
        [MinLength(5)] // Validation required
        public string Username { get; set; }

        [Required] // Validation required
        [StringLength(20, MinimumLength = 8)] // Extra validation
        public string Password { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        public string Gender { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public DateTime Created { get; set; }

        [Required]
        public DateTime LastActive { get; set; }

        public UserForRegisterDto()
        {
            Created = DateTime.Now;
            LastActive = DateTime.Now;
        }
    }
}
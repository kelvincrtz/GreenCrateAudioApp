using System.ComponentModel.DataAnnotations;

namespace BookingApp.API.Dtos
{
    public class ReviewForUpdateDto
    {
        [Required]
        public bool IsApproved { get; set; }
    }
}
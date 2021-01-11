using System;
using System.ComponentModel.DataAnnotations;

namespace BookingApp.API.Dtos
{
    public class BookingForUpdateStatusDto
    {   
        [Required]
        public string Status { get; set; }

        public DateTime ApproveOrDeclineDate { get; set; }

        public bool IsSeenNotification { get; set; }

        public BookingForUpdateStatusDto()
        {
            this.ApproveOrDeclineDate = DateTime.Now;
        }

    }
}
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace BookingApp.API.Models
{
    public class User : IdentityUser<int>
    {
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string FullName { get; set; }
        public string ContactNumber { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public virtual ICollection<Booking> Bookings { get; set; }
        public virtual ICollection<Message> MessagesSent { get; set; }
        public virtual ICollection<Message> MessagesReceived { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
        public virtual ICollection<UserRole> UserRoles { get; set; }
    }
}
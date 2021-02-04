using System;
using System.ComponentModel.DataAnnotations;
using BookingApp.API.Models;
using Microsoft.AspNetCore.Http;

namespace BookingApp.API.Dtos
{
    public class ReviewForCreationDto
    {
        public string Url { get; set; }

        public IFormFile File { get; set; }
        
        public string Description { get; set; }

        public DateTime DateAdded { get; set; }

        public string PublicId { get; set; }

        public bool IsApproved { get; set; }

        public int Rating { get; set; }

        public ReviewForCreationDto()
        {
            DateAdded = DateTime.Now;   
        }
            
    }
}
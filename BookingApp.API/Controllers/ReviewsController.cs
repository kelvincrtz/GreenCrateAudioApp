using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using BookingApp.API.Data;
using BookingApp.API.Dtos;
using BookingApp.API.Helpers;
using BookingApp.API.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace BookingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IBookingRepository _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private Cloudinary _cloudinary;

        public ReviewsController(IBookingRepository repo, IMapper mapper,
            IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _cloudinaryConfig = cloudinaryConfig;
            _mapper = mapper;
            _repo = repo;

            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
        }

        [Authorize]
        [HttpGet("{id}", Name = "GetReview")]
        public async Task<IActionResult> GetReview(int id)
        {
            var reviewFromRepo =  await _repo.GetReview(id);

            if (reviewFromRepo == null)
                return BadRequest();

            var review = _mapper.Map<ReviewForReturnDto>(reviewFromRepo);

            return Ok(review);
        }

        [Authorize]
        [HttpGet("{id}", Name = "GetReviewNoPhoto")]
        public async Task<IActionResult> GetReviewNoPhoto(int id)
        {
            var reviewFromRepo =  await _repo.GetReview(id);

            if (reviewFromRepo == null)
                return BadRequest();

            var review = _mapper.Map<ReviewForReturnNoPhotoDto>(reviewFromRepo);

            return Ok(review);
        }
        
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetReviewsForHomePage()
        {
            var reviews = await _repo.GetReviewsForHomePage();

            if (reviews == null)
                return BadRequest();

            var reviewsToReturn = _mapper.Map<IEnumerable<ReviewForListDto>>(reviews);

            return Ok(reviewsToReturn);
        }


        [AllowAnonymous]
        [HttpGet("list")]
        public async Task<IActionResult> GetMoreReviews([FromQuery]ReviewParams reviewParams)
        {
            var reviews = await _repo.GetMoreReviews(reviewParams);

            if (reviews == null)
                return BadRequest();

            var reviewsToReturn = _mapper.Map<IEnumerable<ReviewForListDto>>(reviews);

            Response.AddPagination(reviews.CurrentPage, reviews.PageSize, reviews.TotalCount, reviews.TotalPages);

            return Ok(reviewsToReturn);
        }
        
        [Authorize]
        [HttpGet("list/admin/{userId}")]
        public async Task<IActionResult> GetReviewsForAdmin(int userId, [FromQuery]ReviewParams reviewParams)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var reviews = await _repo.GetReviewsForAdmin(reviewParams);

            if (reviews == null)
                return BadRequest();

            var reviewsToReturn = _mapper.Map<IEnumerable<ReviewForAdminListDto>>(reviews);

            Response.AddPagination(reviews.CurrentPage, reviews.PageSize, reviews.TotalCount, reviews.TotalPages);

            return Ok(reviewsToReturn);
        }     

        [Authorize]
        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateReviewStatus(int id, [FromQuery]ReviewForUpdateDto reviewForUpdateDto)
        {
            var reviewFromRepo =  await _repo.GetReview(id);

            if (reviewFromRepo == null)
                return BadRequest("No file has been found.");

            reviewForUpdateDto.IsApproved = true;
            
            _mapper.Map(reviewForUpdateDto, reviewFromRepo); 
            /*  IMPORTANT
            Be careful here. Make sure no await, no task. 
            Just classes or else mapping exception eventhough 
            you have already did automapper mapping 
            */

            if(await _repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating review status {id} failed on save");
        }

        [Authorize]
        [HttpPost("users/{userId}")]
        public async Task<IActionResult> AddReviewForUser(int userId, [FromForm]ReviewForCreationDto reviewForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

             var userFromRepo = await _repo.GetUser(userId);

             var bookingFromRepo = await _repo.GetBooking(reviewForCreationDto.BookingId);
             
             var file = reviewForCreationDto.File;

             var uploadResult = new ImageUploadResult();
            
            
             if (file.Length > 0) 
             {
                 using (var stream = file.OpenReadStream())
                 {
                     var uploadParams = new ImageUploadParams()
                     {
                         File = new FileDescription(file.Name, stream),
                         Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                     };

                    uploadResult = _cloudinary.Upload(uploadParams);
                 }

                reviewForCreationDto.Url = uploadResult.Url.ToString();
                reviewForCreationDto.PublicId = uploadResult.PublicId;
             }

             var review = _mapper.Map<Review>(reviewForCreationDto);

             userFromRepo.Reviews.Add(review);

             if (await _repo.SaveAll())
             {
                 
                 var reviewToReturn = _mapper.Map<ReviewForReturnDto>(review);

                 return CreatedAtRoute("GetReview", new {userId = userId, id = review.Id }, reviewToReturn);
                 
             }

             return BadRequest("Could not add the photo review");
        }

        [Authorize]
        [HttpPost("users/{userId}/nophoto")]
        public async Task<IActionResult> AddReviewForUserNoPhoto(int userId, ReviewForCreationNoPhotoDto reviewForCreationNoPhotoDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

             var userFromRepo = await _repo.GetUser(userId);

             var review = _mapper.Map<Review>(reviewForCreationNoPhotoDto);

             userFromRepo.Reviews.Add(review);

             if (await _repo.SaveAll())
             {
                 
                 var reviewNoPhotoToReturn = _mapper.Map<ReviewForReturnNoPhotoDto>(review);

                 return CreatedAtRoute("GetReviewNoPhoto", new {userId = userId, id = review.Id }, reviewNoPhotoToReturn);
                 
             }

             return BadRequest("Could not add the review without photo");
        }    
    }
}
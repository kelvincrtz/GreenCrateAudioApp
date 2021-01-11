using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using BookingApp.API.Data;
using BookingApp.API.Dtos;
using BookingApp.API.Helpers;
using BookingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingRepository _repo;
        private readonly IMapper _mapper;
        public BookingsController(IBookingRepository repo, IMapper mapper)
        {
            _mapper = mapper;
            _repo = repo;
        }

        [HttpGet("{id}", Name = "GetBooking")]
        public async Task<IActionResult> GetBooking(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
                /*  IMPORTANT
                    This line of code simply means 
                    it gets the storage.user.NameIdentifier from Storage
                    it has no relationship whatsover in the booking
                    It simply says, if the userId matches who is currently logged in
                */ 

            var booking = await _repo.GetBooking(id);

            if (booking == null)
                return NotFound();

            var bookingToReturn = _mapper.Map<BookingForDetailedDto>(booking);

            return Ok(bookingToReturn);
        }

        [HttpGet("{id}/review")]
        public async Task<IActionResult> GetBookingForReview(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
                /*  IMPORTANT
                    This line of code simply means 
                    it gets the storage.user.NameIdentifier from Storage
                    it has no relationship whatsover in the booking
                    It simply says, if the userId matches who is currently logged in
                */ 

            var booking = await _repo.GetBooking(id);

            if (booking == null)
                return BadRequest("You are unauthorized.");

            if (booking.UserId != userId) {
                return Unauthorized();
            }

            if (booking == null)
                return NotFound();

            var bookingToReturn = _mapper.Map<BookingForDetailedDto>(booking);

            return Ok(bookingToReturn);
        }

        [HttpGet]
        public async Task<IActionResult> GetBookings([FromQuery]BookingParams bookingParams)
        {
            var bookings = await _repo.GetBookings(bookingParams);

            var bookingsToReturn = _mapper.Map<IEnumerable<BookingForListDto>>(bookings);

            Response.AddPagination(bookings.CurrentPage, bookings.PageSize, bookings.TotalCount, bookings.TotalPages);

            return Ok(bookingsToReturn);
        }

        [HttpGet("calendar/{year}/{month}")]
        public async Task<IActionResult> GetCalendarBookings(int userId, int year, int month)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var bookings = await _repo.GetCalendarBookings(year, month);

            if (bookings == null)
                return BadRequest();

            var bookingsToReturn = _mapper.Map<IEnumerable<BookingForDetailedDto>>(bookings);

            return Ok(bookingsToReturn);

        }

        [HttpGet("thread")]
        public async Task<IActionResult> GetBookingsForUser(int userId, [FromQuery]BookingParams bookingParams)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookings = await _repo.GetBookingsForUser(userId, bookingParams);

            if (bookings == null)
                return BadRequest();

            var bookingsToReturn = _mapper.Map<IEnumerable<BookingForDetailedDto>>(bookings);

            Response.AddPagination(bookings.CurrentPage, bookings.PageSize, bookings.TotalCount, bookings.TotalPages);

            return Ok(bookingsToReturn);
        }

        [HttpGet("notify")]
        public async Task<IActionResult> GetNotificationBookingsForUser(int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookings = await _repo.GetNotificationBookingsForUser(userId);

            if (bookings == null)
                return BadRequest("No notifications");

            var bookingsToReturn = _mapper.Map<IEnumerable<BookingForDetailedDto>>(bookings);

            return Ok(bookingsToReturn);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking(int userId, BookingForCreationDto bookingForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var userFromRepo = await _repo.GetUser(userId);

            bookingForCreationDto.UserId = userId;

            bookingForCreationDto.Status = "Pending";

            var booking = _mapper.Map<Booking>(bookingForCreationDto);

            userFromRepo.Bookings.Add(booking);

            if (await _repo.SaveAll()) {
                var bookingForReturn = _mapper.Map<BookingForDetailedDto>(booking);
                return CreatedAtRoute("GetBooking", new {userId, id = booking.Id}, bookingForReturn);
            }
            
            throw new Exception("Creating the booking failed on save");
        }

        [HttpPost("seenbyadmin/{id}")]
        public async Task<IActionResult> MarkSeenByAdmin(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookingFromRepo = await _repo.GetBooking(id);

            if (bookingFromRepo == null)
                return BadRequest();

            if (bookingFromRepo.IsSeenByAdmin == true)
                return NoContent();

            bookingFromRepo.IsSeenByAdmin = true;

            if(await _repo.SaveAll())
                return NoContent();

            throw new Exception($"Marking as seen by admin for booking {id} failed on save");  
        }

        [HttpPost("seennotify/{id}")]
        public async Task<IActionResult> MarkAsSeenNotify(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookingFromRepo = await _repo.GetBooking(id);

            if(bookingFromRepo.UserId != userId)
                return Unauthorized();

            bookingFromRepo.IsSeenNotification = true;

            await _repo.SaveAll();

            return NoContent();    
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(int userId, int id, BookingForUpdateDto bookingForUpdateDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookingFromRepo = await _repo.GetBooking(id);

            var whenValue = bookingFromRepo.When;

            if (bookingFromRepo == null)
                return BadRequest();

            if (bookingFromRepo.UserId != userId)
                return Unauthorized();

            _mapper.Map(bookingForUpdateDto, bookingFromRepo); 
            // *IMPORTANT* Be careful here. Make sure no await, no task. 
            // Just classes or else mapping exception eventhough 
            // you have already did automapper mapping

            if(await _repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating booking {id} failed on save");
        }

        [HttpPut("adminupdate/{id}")]
        public async Task<IActionResult> UpdateBookingViaAdmin(int userId, int id, BookingForUpdateAdminDto bookingForUpdateAdminDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookingFromRepo = await _repo.GetBooking(id);

            if (bookingFromRepo == null)
                return BadRequest();

            // Add Authorization only for Admin or Moderator 
            
            
            //


            _mapper.Map(bookingForUpdateAdminDto, bookingFromRepo); 
            // *IMPORTANT* Be careful here. Make sure no await, no task. 
            // Just classes or else mapping exception eventhough 
            // you have already did automapper mapping

            if(await _repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating booking using Admin user {id} failed on save");
        }

        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateBookingStatus(int userId, int id, BookingForUpdateStatusDto bookingForUpdateStatusDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookingFromRepo = await _repo.GetBooking(id);

            if (bookingFromRepo == null)
                return BadRequest();

            bookingForUpdateStatusDto.IsSeenNotification = false;
            
            _mapper.Map(bookingForUpdateStatusDto, bookingFromRepo); 
            // Be careful here. Make sure no await, no task. Just classes or else mapping exception eventhough you have already did automapper mapping

            if(await _repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating booking status {id} failed on save");
        }

        [HttpPut("isreviewed/{id}")]
        public async Task<IActionResult> UpdateBookingIsReviewed(int userId, int id, BookingForUpdateIsReviewedDto bookingForUpdateIsReviewedDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookingFromRepo = await _repo.GetBooking(id);

            if (bookingFromRepo == null)
                return BadRequest();

            bookingForUpdateIsReviewedDto.IsReviewed = true;
            
            _mapper.Map(bookingForUpdateIsReviewedDto, bookingFromRepo); 
            // Be careful here. Make sure no await, no task. Just classes or else mapping exception eventhough you have already did automapper mapping

            if(await _repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating booking isReviewed {id} failed on save");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var bookingFromRepo = await _repo.GetBooking(id);

            if (bookingFromRepo == null)
                return BadRequest();

            if (bookingFromRepo.UserId.Equals(userId)) {
                _repo.Delete(bookingFromRepo);
            } else {
                return Unauthorized();
            }

            if (await _repo.SaveAll())
                return NoContent();

            throw new Exception("Error deleting the request");
        }
    }
}
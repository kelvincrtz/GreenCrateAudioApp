using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BookingApp.API.Helpers;
using BookingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BookingApp.API.Data
{
    public class BookingRepository : IBookingRepository
    {
        private readonly DataContext _context;

        public BookingRepository(DataContext context)
        {
            _context = context;
        }

        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity); // No need to make Async. At this point it is only saved in memory
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<Booking> GetBooking(int id)
        {
            return await _context.Bookings.Include(u => u.User).FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetCalendarBookings(int year, int month)
        {
            var prevMonth = month-1;
            var nxtMonth = month+1;

            var bookings = _context.Bookings
                .Include(u => u.User)
                .Where(b => b.When.Year == year)
                .Where(b => b.When.Month >= prevMonth && b.When.Month <= nxtMonth) 
                .AsQueryable().ToListAsync();

            return await bookings;
        }

        public async Task<PagedList<Booking>> GetBookings(BookingParams bookingParams)
        {
            var bookings = _context.Bookings.Include(u => u.User)
                .OrderByDescending(b => b.DateAdded).AsQueryable();

            //Get the current Month, Year and Day 
            var month = DateTime.Now.Month;
            var year = DateTime.Now.Year;
            var day = DateTime.Now.Day;
            var dayPlusOne = DateTime.Now.AddDays(1);

            if (bookingParams.EventsThisMonth) {
                bookings = bookings.Where(b => b.When.Year == year && b.When.Month == month);
            }

            if (bookingParams.EventsToday) {
                bookings = bookings.Where(b => b.When.Year == year && b.When.Month == month && b.When.Day == day);
            }

            if (bookingParams.EventsTomorrow) {
                bookings = bookings.Where(b => b.When.Year == year && b.When.Month == month && b.When.Day == dayPlusOne.Day);
            }

            if (bookingParams.Status!=null) {
                bookings = bookings.Where(b => b.Status == bookingParams.Status);
            }

            if (!string.IsNullOrEmpty(bookingParams.OrderBy))
            {
                switch (bookingParams.OrderBy)
                {
                    case "dateadded":
                        bookings = bookings.OrderByDescending(b => b.DateAdded);
                        break;
                    default:
                        bookings = bookings.OrderByDescending(b => b.When);
                        break;
                }
            }

            return await PagedList<Booking>.CreateAsync(bookings, bookingParams.PageNumber, bookingParams.PageSize);
        }

        public async Task<IEnumerable<Booking>> GetNotificationBookingsForUser(int id)
        {
            var bookings = _context.Bookings
                .Where(u => u.IsSeenByAdmin && u.Status == "Approved" || u.Status == "Declined")
                .Where(u => !u.IsSeenNotification)
                .Where(b => b.UserId == id)
                .AsQueryable().ToListAsync();

            return await bookings;
        }

        public async Task<PagedList<Booking>> GetBookingsForUser(int id, BookingParams bookingParams)
        {
            // Return Unauthorized for ID that isnt the user

            var bookings = _context.Bookings.Where(u => u.UserId == id).OrderByDescending(b => b.DateAdded).AsQueryable();

            //Get the current Month, Year and Day 
            var month = DateTime.Now.Month;
            var year = DateTime.Now.Year;
            var day = DateTime.Now.Day;
            var dayPlusOne = DateTime.Now.AddDays(1);

            if (bookingParams.EventsThisMonth) {
                bookings = bookings.Where(b => b.When.Year == year && b.When.Month == month);
            }

            if (bookingParams.EventsToday) {
                bookings = bookings.Where(b => b.When.Year == year && b.When.Month == month && b.When.Day == day);
            }

            if (bookingParams.EventsTomorrow) {
                bookings = bookings.Where(b => b.When.Year == year && b.When.Month == month && b.When.Day == dayPlusOne.Day); 
            }

            if (!string.IsNullOrEmpty(bookingParams.OrderBy))
            {
                switch (bookingParams.OrderBy)
                {
                    case "dateadded":
                        bookings = bookings.OrderByDescending(b => b.DateAdded);
                        break;
                    default:
                        bookings = bookings.OrderByDescending(b => b.When);
                        break;
                }
            }

            return await PagedList<Booking>.CreateAsync(bookings, bookingParams.PageNumber, bookingParams.PageSize);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }
        
        public async Task<IEnumerable<Message>> GetNotificationMessagesForUser(int userId)
        {
            var messages = _context.Messages
                .Include(u => u.Sender)
                .Include(u => u.Recipient)
                .Where(u => u.RecipientId == userId && u.IsRead == false && u.DateRead == null)
                .Where(u => u.IsSeenNotification == false)
                .AsQueryable().ToListAsync();

            return await messages;
        }

        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            // Includes the other navigation property here. Might be a tool for fixing un-identified
            var messages = _context.Messages.Include(u => u.Sender).Include(u => u.Recipient).AsQueryable();

            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId && u.RecipientDeleted == false);
                    break;
                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messageParams.UserId && u.SenderDeleted == false);
                    break;
                default:
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId 
                        && u.IsRead == false && u.RecipientDeleted == false);
                    break;
            }

            messages = messages.OrderByDescending(d => d.MessageSent);

            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId)
        {
            var messages = await _context.Messages.Include(u => u.Sender).Include(u => u.Recipient)
                .Where(m => m.RecipientId == userId && m.RecipientDeleted == false && m.SenderId == recipientId 
                         || m.RecipientId == recipientId && m.SenderId == userId && m.SenderDeleted == false)
                .OrderBy(m => m.MessageSent).ToListAsync();
            
            return messages;
        }

        public async Task<User> GetUser(int id)
        {
            var user = await _context.Users.Include(b => b.Bookings).Include(m => m.MessagesReceived)
                .Include(r => r.Reviews).FirstOrDefaultAsync(u => u.Id == id);

            return user;
        }
        
        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = _context.Users.Include(b => b.Bookings).OrderByDescending(u => u.LastActive).AsQueryable();

            if(!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                        default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }

            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Review> GetReview(int id)
        {
            var review =  await _context.Reviews.Include(u => u.User).FirstOrDefaultAsync(r => r.Id == id);

            return review;
        }

        public async Task<IEnumerable<Review>> GetReviewsForHomePage()
        {
            var reviews = await _context.Reviews.Include(u => u.User).Where(r => r.IsApproved == true)
                .OrderByDescending(d => d.DateAdded).Take(6).ToListAsync();

            return reviews;
        }

        public async Task<PagedList<Review>> GetMoreReviews(ReviewParams reviewParams)
        {
            var reviews = _context.Reviews.Include(u => u.User).Where(r => r.IsApproved == true)
                .OrderByDescending(d => d.DateAdded);

            return await PagedList<Review>.CreateAsync(reviews, reviewParams.PageNumber, reviewParams.PageSize);
        }

        public async Task<PagedList<Review>> GetReviewsForUser(int userId, ReviewParams reviewParams)
        {
            var reviews = _context.Reviews.Include(u => u.User).Where(u => u.UserId == userId)
                .OrderByDescending(d => d.DateAdded);

            return await PagedList<Review>.CreateAsync(reviews, reviewParams.PageNumber, reviewParams.PageSize);
        }

        public async Task<PagedList<Review>> GetReviewsForAdmin(ReviewParams reviewParams)
        {
            var reviews = _context.Reviews.Include(u => u.User).OrderByDescending(d => d.DateAdded);

            return await PagedList<Review>.CreateAsync(reviews, reviewParams.PageNumber, reviewParams.PageSize);
        }
    }
}
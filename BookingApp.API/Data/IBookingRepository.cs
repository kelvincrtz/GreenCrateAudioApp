using System.Collections.Generic;
using System.Threading.Tasks;
using BookingApp.API.Helpers;
using BookingApp.API.Models;

namespace BookingApp.API.Data
{
    public interface IBookingRepository
    {
         void Add<T>(T entity) where T: class; // T for Generic classes
         void Delete<T>(T entity) where T: class;
         Task<bool> SaveAll();
         Task<PagedList<User>> GetUsers(UserParams userParams);
         Task<User> GetUser(int id);
         Task<IEnumerable<Booking>> GetCalendarBookings(int year, int month);
         Task<PagedList<Booking>> GetBookings(BookingParams bookingParams);
         Task<Booking> GetBooking(int id);
         Task<PagedList<Booking>> GetBookingsForUser(int id, BookingParams bookingParams);
         Task<IEnumerable<Booking>> GetNotificationBookingsForUser(int userId);
         Task<Message> GetMessage(int id);
         Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
         Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId);
         Task<IEnumerable<Message>> GetNotificationMessagesForUser(int userId);
         Task<Review> GetReview(int id);
         Task<IEnumerable<Review>> GetReviewsForHomePage();
         Task<PagedList<Review>> GetMoreReviews(ReviewParams reviewParams);
         Task<PagedList<Review>> GetReviewsForAdmin(ReviewParams reviewParams);
         Task<PagedList<Review>> GetReviewsForUser(int userId, ReviewParams reviewParams);
    }
}
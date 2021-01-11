using AutoMapper;
using BookingApp.API.Dtos;
using BookingApp.API.Models;

namespace BookingApp.API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<User, UserForListDto>()
                .ForMember(dest => dest.Age, opt => 
                    opt.MapFrom(src => src.DateOfBirth.CalculateAge()));
            CreateMap<User, UserForDetailedDto>()
                .ForMember(dest => dest.Age, opt => 
                    opt.MapFrom(src => src.DateOfBirth.CalculateAge()));
            CreateMap<Booking, BookingForDetailedDto>().ReverseMap();
            CreateMap<Booking, BookingForListDto>();
            CreateMap<BookingForCreationDto, Booking>();
            CreateMap<Booking, BookingForReviewListDto>();
            CreateMap<UserForUpdateDto, User>();
            CreateMap<User, UserForUpdateDto>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<User, UserForReviewListDto>();
            CreateMap<BookingForUpdateDto, Booking>();
            CreateMap<BookingForUpdateAdminDto, Booking>();
            CreateMap<BookingForUpdateStatusDto, Booking>();
            CreateMap<BookingForUpdateIsReviewedDto, Booking>();
            CreateMap<BookingForSeenAdminDto, Booking>();
            CreateMap<MessageForCreationDto, Message>().ReverseMap();
            CreateMap<Message, MessageToReturnDto>();
            CreateMap<Message, MessageForDetailedDto>();
            CreateMap<Review, ReviewForReturnDto>();
            CreateMap<Review, ReviewForReturnNoPhotoDto>();
            CreateMap<ReviewForCreationDto, Review>();
            CreateMap<ReviewForCreationNoPhotoDto, Review>();
            CreateMap<Review, ReviewForListDto>();
            CreateMap<Review, ReviewForAdminListDto>();
            CreateMap<ReviewForUpdateDto, Review>();
        }
    }
}
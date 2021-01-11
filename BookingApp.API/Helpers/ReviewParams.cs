namespace BookingApp.API.Helpers
{
    public class ReviewParams
    {
        private const int MaxPageSize = 20;
        public int PageNumber { get; set; }
        private int pageSize = 12;
        public int PageSize
        {
            get { return pageSize; }
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : value ; }
        }
    }
}
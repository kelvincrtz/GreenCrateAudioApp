namespace BookingApp.API.Helpers
{
    public class UserParams
    {
        private const int MaxPageSize = 30;
        public int PageNumber { get; set; }
        private int pageSize = 12;
        public int PageSize
        {
            get { return pageSize; }
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : value ; }
        }

        public string OrderBy { get; set; }
    }
}
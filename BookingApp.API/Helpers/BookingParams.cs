namespace BookingApp.API.Helpers
{
    public class BookingParams
    {
        private const int MaxPageSize = 30;
        public int PageNumber { get; set; }
        private int pageSize = 10;
        public int PageSize
        {
            get { return pageSize; }
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : value ; }
        }
        public string Status { get; set; }
        public bool EventsThisMonth { get; set; }
        public bool EventsToday { get; set; }
        public bool EventsTomorrow { get; set; }
        public string OrderBy { get; set; }
    }
}
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using BookingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using Microsoft.Extensions.Options;
using BookingApp.API.Helpers;

namespace BookingApp.API.Data
{
    public class Seed
    {
        public static void SeedUsers(UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            string userString = Startup.StaticConfig.GetSection("AdminSettings:UName").Value;

            if (!userManager.Users.Any())
            {
                var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);

                // Create some Roles
                var roles = new List<Role>
                {
                    new Role{Name = "Member"},
                    new Role{Name = "Admin"},
                    new Role{Name = "Moderator"},
                    new Role{Name = "VIP"},
                };

                foreach(var role in roles)
                {
                    roleManager.CreateAsync(role).Wait();
                }

                foreach(var user in users)
                {
                    userManager.CreateAsync(user, Startup.StaticConfig.GetSection("SeedUsers:Poken").Value).Wait();
                    userManager.AddToRoleAsync(user, "Member");
                }
                // WARNING Delete Admin creation when in Production
                // create admin user
                var adminUser = new User
                {
                    UserName = userString
                };

                var result = userManager.CreateAsync(adminUser, Startup.StaticConfig.GetSection("AdminSettings:Poken").Value).Result;

                if (result.Succeeded)
                {
                    var admin = userManager.FindByNameAsync("Admin").Result;
                    userManager.AddToRolesAsync(admin, new[] {"Admin", "Moderator"});
                }
            }
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512()) 
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }
    }
}
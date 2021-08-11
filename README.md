# Periodic Tables: Restaurant Reservation System
Thank you for viewing this repo. This is my final project for Thinkful's Software Engineering program. The PERN stack is used in this application, including but not limited to: PostgreSQL, Express.js, React.js, Node.js, and Knex.js.


## LINK TO LIVE APPLICATION LINK TO LIVE APPLICATION

## API Documentation
### /reservations

GET: ?date=YYYY-MM-DD
Returns a list of reservations for the specific date.

GET: ?mobile_number={phone_number}
Returns a list of reservations that at least partially match the number query.

Shape of response from both requests above:

    {
        "data": [
            {
                "reservation_id": 49,
                "created_at": "2021-08-11T16:59:07.302Z",
                "updated_at": "2021-08-11T16:59:07.302Z",
                "first_name": "Rick",
                "last_name": "Sanchez",
                "mobile_number": "9258189750",
                "reservation_date": "2021-08-11T07:00:00.000Z",
                "reservation_time": "12:00:00",
                "people": 2,
                "status": "Booked"
            },
            {
                "reservation_id": 50,
                "created_at": "2021-08-11T16:59:42.263Z",
                "updated_at": "2021-08-11T16:59:42.263Z",
                "first_name": "Morty",
                "last_name": "Smith",
                "mobile_number": "9253775254",
                "reservation_date": "2021-08-11T07:00:00.000Z",
                "reservation_time": "13:00:00",
                "people": 4,
                "status": "Booked"
            }
        ]
    }

POST
Post route requires a request body which should look like this:
    request: {
        body: {
            data: {
                "first_name": "Bird",
                "last_name": "Person",
                "mobile_number": "9258189750",
                "reservation_date": "2021-08-11T07:00:00.000Z",
                "reservation_time": "12:00:00",
                "people": 2,
                "status": "Booked"
            }
        }
    }
Data validation for requests.  Descriptive error responses will display if request does not pass data validation.
- Date must be in the format YYYY-MM-DD.
- Date must occur either on the current day or in the future.
- Date cannot be a Tuesday.
- The time must be in 24H (HH:MM) format. Also, if the date property is on today's date, the time must not have passed on that day when the request is made.
- People must be an integer greater than 0.

Returns status 201 and the created reservation object.

### /reservations/:reservation_id
GET
As long as the reservation defined in the request URL exists, it will return the reservation object.
    {
        reservation_id: 7,
        first_name: "Summer",
        last_name: "Smith",
        mobile_number: "777-888-9999",
        reservation_date: "2022-03-12",
        reservation_time: "11:30",
        people: 2,
        status: "booked"
    }

PUT
A request body is required.  The body of the request should look like this:
    data: {
        first_name: "Beth",
        last_name: "Sanchez Smith",
        mobile_number: "123-123-1231",
        reservation_date: "2021-07-26",
        reservation_time: "18:00",
        people: 2,
        status: "booked"
    }
Returns status 200 and the updated reservation.

### /reservations/:reservation_id/status
PUT
The body of the request should look like this:
    data: {status: "booked"}
Returns status 200 and the updated reservation object.

### /tables
GET
Returns a list of all tables in the database.
    {
        "data": [
            {
                "table_id": 15,
                "table_name": "#1",
                "capacity": 6,
                "reservation_id": null
            },
            {
                "table_id": 16,
                "table_name": "#2",
                "capacity": 6,
                "reservation_id": null
            },
            ...
        ]
    }

POST
Post requires request body which must look like this:
    data : {
        table_name: "#7",
        capacity: 6,
        reservation_id: 12
    }
Data validation:
- table_name must be a string greater than one character.
- capacity must be an integer greater than 0.
- reservation_id is optional, but if one is passed, it must be the ID of a reservation that does exist in the database.

Returns 201 and the created table.

### /tables/:table_id
GET
If the table defined in the request URL exists, it returns the table object which looks like this:
    data: {
        table_id: 12,
        table_name: "Bar #4",
        capacity: 3,
        reservation_id: null
    }

### /tables/:table_id/seat
PUT
The table will be updated with the reservation_id passed.
Request body looks like this:
    data: { reservation_id: 12 }
Data validation:
- table_id exists
- reservation_id exists
- table is not currently occupied
- reservation is booked (not seated, finished, or cancelled)

When the table is updated with a reservation_id, the reservation matching that id's status is updated to "seated".
Returns status 200 and the updated reservation (not the table).
    data: {
        reservation_id: 5,
        first_name: "Jerry",
        last_name: "Smith,
        mobile_number: "981-123-4567",
        reservation_date: "2007-04-20",
        reservation_time: "18:00",
        people: 6,
        status: "seated"
    }

DELETE
As long as the table exists, any reservation status will be nullified.
    data: {
        reservation_id: 62,
        first_name: "Mister",
        last_name: "Nimbus",
        mobile_number: "505-737-4253",
        reservation_date: "2030-09-25",
        reservation_time: "14:00",
        people: 1,
        status: "finished"
    }
Returns status 200 and the updated reservation.

## React Application
### /dashboard
The /dashboard route displays all tables and the reservations that are schedules for the current date. If a reservation has been completed or canceled, it will not be displayed.

![screenshot dashboard](/images/dashboard.png)

### /dashboard?date=YYYY-MM-DD
Displays reservations for specified date.
Table information does not change based on date.

### /reservations/new
Route displays form to create new reservation.
After form submission, the app will display the dashboard screen for the date of the newly created reservation including all reservations on that date.

![screenshot new reservation form](/images/new-reservation-form.png)

### /tables/new
This route displays a form that allows the user to create a new table.
After submitting, the app will go to the default dashboard page and display all the tables, including the newly created table.

![screenshot new table form](/images/new-table-form.png)

### /reservations/:reservation_id/seat
If a table has no reservation currently seated at it, and a reservation's status is booked, the user can seat the reservation at the table (provided the table has enough capacity).
Once a reservation is seated at a table, the user has the ability on the dashboard to "finish" the table when the party leaves.  This clears the table's reservation and changes the reservation's status to finished.

Before Seat Button is Clicked
![screenshot before seat button is clicked](/images/dashboard.png)

After Seat Button is Clicked
![screenshot after seat button is clicked](/images/after-seat-button.png)

After Finish Button is Clicked
![screenshot after finish button is clicked](/images/after-finish-button.png)

Seat Form
![screenshot seat form](/images/seat-form.png)

### /search
The Search form will allow the user to search for reservations by customer phone number. Partial matches are acceptable, and the API will return reservations for such matches. If no results are found, the page displays "No reservations found".

![screenshot search form](/images/search-form.png)

No matching reservations found
![screenshot no matches](/images/no-results.png)

## Technology Used
The PERN stack was used to build this application. The PERN stack includes, but is not limited to: PostgreSQL, Express.js, React.js, Node.js. Twitter Bootstrap 4.5.2 is also used on the frontend.

ElephantSQL PostgreSQL instances are used to store the data. Node.js in conjuction with Knex.js are used to update and interface with the data instances. Express.js version 4 is being used to handle the routing between the requests and the responses.

Facebook React.js is used on the frontend to create a responsive, dynamic web application for the user. I am using functional, hook-based React as opposed to its object-oriented counterpart. Throughout the frontend application, many hooks are used to simplify flow and layout of the application. There is plenty of React + ES6 + Bootstrap magic happening.

## Installation
In order to effectively install and use this application locally, you will need to either clone the repo from this GitHub or download the zip. You will then need to navigate to the top level of the project in your bash terminal and:

1. run `npm i`
2. `cd front-end && npm i`
3. `cd ../back-end && npm i`

Now that you have all of the scripts installed, you will need two different PostgreSQL database instances to either run the application locally or test it.

You must make a `.env` file in both the front-end and back-end directories.

Load the back-end `.env` file with two environment variables with the values of your two database URLs like so:

    DATABASE_URL_DEVELOPMENT=development-data-base-url-goes-here
    DATABASE_URL_TEST=test-data-base-url-goes-here

In the front-end `.env` file, enter:

    REACT_APP_API_BASE_URL=http://localhost:5000

Now you will need to migrate the tables to the development database. Don't bother doing it for the test database, though. The tests are carrying that out for you each time. From the back-end folder:

1. npx knex migrate:latest
2. npx knex seed:run

Now you are ready to run the server locally. From the top level of the project, run `npm run start:dev` if you would like to run the server and application.

If you would like to test the application, you can view the package.json files and use the testing scripts provided there. Unfortunately, some of the provided testing scripts do not function. However, the ones that certainly do are:

1. all of those that are structured like `test:5:backend` or `test:3:frontend`
2. `test:frontend` and `test:backend`
// motivational quotes
// window.addEventListener('load', getFetch) //when the window loads the getFetch function is called which makes an HTTP request to the API server
// function getFetch(){
//   const url = 'https://free-quotes-api.herokuapp.com/' //quotes api url
//   fetch(url)
//       .then(res => res.json()) // parse response as JSON
//       .then(data => {
//         console.log(data)
//         document.querySelector('.quote').innerText = data.quote //displays the quote on the page
//       })
//       .catch(err => {
//           console.log(`error ${err}`)
//       });
// }

//side menu

function openSideMenu() {
  document.getElementById("side-menu").style.width = "250px";
}

function closeSideMenu() {
  document.getElementById("side-menu").style.width = "0";
}

//dropdown in sidemenu

let dropdown = document.querySelectorAll(".dropdown-btn");

for (let i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", () => {
    this.classList.toggle("active");
    let dropdownItems = this.nextElementSibling;
    if (dropdownItems.style.display === "block") {
      dropdownItems.style.display = "none";
    } else {
      dropdownItems.style.display = "block";
    }
  });
}

function subMenu() {
  let element = document.querySelector(".fa-angle-right");
  element.classList.toggle("rotate");
}

//Modal Popups
const todoModal = document.querySelector(".todoModal");
const openTodoModal = document.querySelector(".openModal"); 
const closeTodoModal = document.querySelector(".closeTodoModal"); 



const detailsModal = document.querySelector(".detailsModal"); 
const openDetailsModal = document.querySelector(".openDetailsModal");
const closeDetailsModal = document.querySelector(".closeDetailsModal"); 



const listTypeModal = document.querySelector(".list-type-modal"); 
const openListTypeModal = document.querySelector(".open-List-Type-Modal");
const closeListTypeModal = document.querySelector(".close-List-Type-Modal");


const eventsModal = document.querySelector(".events-modal"); 
const openEventsModal = document.querySelector(".open-events-modal"); 
const closeEventsModal = document.querySelector(".close-events-modal");

if(openTodoModal){
  openTodoModal.addEventListener("click", () => {
    todoModal.style.display = "block";
  }); //when you click the open button, the modal pops up
}

if(closeTodoModal){
  closeTodoModal.addEventListener("click", () => {
    todoModal.style.display = "none";
  }); //when you click the close button, the modal closes
}


if(openEventsModal){
  openEventsModal.addEventListener("click", () => {
    eventsModal.style.display = "block";
  });
}

if(closeEventsModal){
  closeEventsModal.addEventListener("click", () => {
    eventsModal.style.display = "none";
  }); //when you click the close button, the modal closes
}


// openListTypeModal.addEventListener("click", () => {
//     listTypeModal.style.display = "block"

// });

// closeListTypeModal.addEventListener("click", () => {
//     listTypeModal.style.display = "none"
// }); //when you click the close button, the modal closes



// Calendar
const date = new Date();

const renderCalendar = () => {
  date.setDate(1); //Sets the numeric value of the day of the month to 1

  const monthDays = document.querySelector(".days");

  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate(); //Gets last day of current month

  const prevlastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    0
  ).getDate(); //Gets the last day of the previous month

  const firstDayOfMonthIndex = date.getDay(); //returns the index number of the first day of the month

  const lastDayOfMonthIndex = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDay(); //returns the index number of the last weekday of the current month

  const nextDays = 7 - lastDayOfMonthIndex - 1; //To display 6 days FROM the first day of the next month

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  document.querySelector(".date h1").innerHTML = months[date.getMonth()]; //Uses month array and getMonth method to display current Month

  // document.querySelector(".date p").innerHTML = new Date().toDateString(); //Displays current date in a readable format

  // document.querySelector('.days').addEventListener('click', () => {

  // })

  let days = "";

  for (let x = firstDayOfMonthIndex; x > 0; x--) {
    days += `<div class="prev-date">${prevlastDayOfMonth - x + 1}</div>`;
  } //Displays the previous month dates in the calendar

  for (let i = 1; i <= lastDayOfMonth; i++) {
    //Display all the days in the calender, i.e., days 1-31
    if (
      i === new Date().getDate() &&
      date.getMonth() === new Date().getMonth()
    ) {
      days += `<div class="today">${i}</div>`; //'days' equals the current day it is, i.e, the highlighted day in the calendar
    } else {
      days += `<div>${i}</div>`;
    }
  }

  for (let n = 1; n <= nextDays; n++) {
    days += `<div class="next-date">${n}</div>`; //content for the next days
  }
  monthDays.innerHTML = days; //displays days for the next month
};

document.querySelector(".prev").addEventListener("click", () => {
  //click event listener to render the PREVIOUS month
  date.setMonth(date.getMonth() - 1); //set the month as the current month minus one -> previous month
  renderCalendar(); //call the global render calendar function
});

document.querySelector(".next").addEventListener("click", () => {
  //click event listener to render the NEXT month
  date.setMonth(date.getMonth() + 1); //set the month as the current month plus one -> next month
  renderCalendar(); //call the global render calendar function
});

renderCalendar(); //function to render the calendar

// const listTypeBtn = document.querySelector(".listTypeBtn")

// listTypeBtn.addEventListener("click", () => {
  
// })
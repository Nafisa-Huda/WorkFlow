//side menu
function openSideMenu() {
  document.getElementById("side-menu").style.width = "250px";
}

function closeSideMenu() {
  document.getElementById("side-menu").style.width = "0";
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

if(openDetailsModal){
  openDetailsModal.addEventListener("click", () => {
    detailsModal.style.display = "block";
    //getting all form inputs
    todoItem = document.querySelector(".todo"),
    todoDescription = document.querySelector(".todo-description")
    dueDate = document.querySelector(".due-date")
    priority = document.querySelector(".priority")
    listType = document.querySelector(".list-type")
    updateBtn = document.querySelector(".update")

    //updating all form inputs
    todoItem.setAttribute("placeholder", this.dataset.todo)
    todoDescription.setAttribute("placeholder", this.dataset.todoDescription)
    dueDate.setAttribute("value", this.dataset.dueDate)
    priority.setAttribute("value", this.dataset.priority)
    listType.setAttribute("value", this.dataset.listType)
    updateBtn.setAttribute("data-id", this.dataset.id)
    updateBtn.addEventListener('click', update)
  });
}

if(closeDetailsModal){
  closeDetailsModal.addEventListener("click", () => {
    detailsModal.style.display = "none";
  }); //when you click the close button, the modal closes
}

async function edit(){
  const todoId = this.dataset.id,
  todo = document.querySelector(".todo"),
  todoDescription = document.querySelector(".todo-description").value,
  dueDate = document.querySelector(".due-date").value,
  priority = document.querySelector(".priority").value,
  listType = document.querySelector(".list-type").value

  let todoItem = todo.value || todo.getAttribute('placeholder');
  console.log(todo,todoId)
  try{
      const response = await fetch('todos/edit', {
          method: 'put',
          headers: {'Content-type': 'application/json'},
          body: JSON.stringify({
              'todoIdFromJSFile': todoId,
              'todoFromJS' : todo,
              'todoDescriptionFromJS' : todoDescription,
              'dueDateFromJS' : dueDate,
              'priorityFromJS' : priority,
              'listTypeFromJS' : listType

          })
      })
      const data = await response.json()
      console.log(data)
      location.reload()
  }catch(err){
      console.log(err)
  }
}

// pomodoro clock

let countdown;
const timerDisplay = document.querySelector('.display-time-left')
const endTime = document.querySelector('.display-end-time')
const buttons = document.querySelectorAll('[data-time]')
const display = document.querySelector('.display')

const timer = (seconds) => {
  //clear existing timers
  clearInterval(countdown)
  const now =  Date.now()
  const then = now + seconds * 1000
  displayRemainingTime(seconds)
  displayEndTime(then)

  countdown = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000)
    //stops interval from running
    if(secondsLeft < 0){
      clearInterval(countdown)
      return
    }
    //display it
    displayRemainingTime(secondsLeft)
  }, 1000)
}

const displayRemainingTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60
  const display = `${minutes}:${remainderSeconds < 10 ? '0' :  ''}${remainderSeconds}`
  document.title = display;
  timerDisplay.textContent = display;
}

const displayEndTime = (timestamp) => {
  const end = new Date(timestamp)
  const hour = end.getHours()
  const adjustedHour = hour > 12 ? hour - 12 : hour
  const minutes = end.getMinutes()
  endTime.textContent = `Will Stop At, ${adjustedHour}:${minutes < 10 ? '0' : ''}${minutes}`
}

// const buttonSound = new Audio('/btn.mp3');


function startTimer() {
  const seconds = parseInt(this.dataset.time)
  // buttonSound.play();
  timer(seconds)
  display.style.display = 'block'
}

buttons.forEach(button => button.addEventListener('click', startTimer))



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

const prevMonth = document.querySelector(".prev")
const nextMonth = document.querySelector(".next")
if(prevMonth){
  prevMonth.addEventListener("click", () => {
    //click event listener to render the PREVIOUS month
    date.setMonth(date.getMonth() - 1); //set the month as the current month minus one -> previous month
    renderCalendar(); //call the global render calendar function
  });
}

if(nextMonth){
  nextMonth.addEventListener("click", () => {
    //click event listener to render the NEXT month
    date.setMonth(date.getMonth() + 1); //set the month as the current month plus one -> next month
    renderCalendar(); //call the global render calendar function
  });
}


renderCalendar(); //function to render the calendar
// const list = document.querySelectorAll(".list");
// list.forEach((clickedList)=>{
//     clickedList.addEventListener('click',()=>{
//         list.forEach((list=>{
//             list.classList.remove("active");
//         }))
//         clickedList.classList.add("active");
//         const clickedTabBGColor=getComputedStyle
//         (clickedList).getPropertyValue(
//             "color"
//         );
//         // document.body.style.background=clickedTabBGColor;
//     });
// });



//motivational quotes
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

//hamburger nav
const btn = document.getElementById('menu-btn')
const nav = document.getElementById('menu')

btn.addEventListener('click', () => {
  btn.classList.toggle('open')
  nav.classList.toggle('flex')
  nav.classList.toggle('hidden')
})


//Modal Popup
const modal = document.getElementById("modal"); //getting the modal
const openModal = document.getElementById("open-button"); //getting the button to open the modal
const closeModal = document.getElementById("close-button"); //getting the button to close the modal

openModal.addEventListener("click", () => {
  modal.style.display = "block"

}); //when you click the open button, the modal pops up

closeModal.addEventListener("click", () => {
  modal.style.display = "none"
}); //when you click the close button, the modal closes

//todo list
const deleteBtn = document.querySelectorAll('.del')
const todoItem = document.querySelectorAll('span.not')
// const todoComplete = document.querySelectorAll('span.completed')

Array.from(deleteBtn).forEach((el)=>{
    el.addEventListener('click', deleteTodo)
})

// Array.from(todoItem).forEach((el)=>{
//     el.addEventListener('click', markComplete)
// })

// Array.from(todoComplete).forEach((el)=>{
//     el.addEventListener('click', markIncomplete)
// })

async function deleteTodo(){
    const todoId = this.parentNode.dataset.id
    try{
        const response = await fetch('todos/deleteTodo', {
            method: 'delete',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                'todoIdFromJSFile': todoId
            })
        })
        const data = await response.json()
        console.log(data)
        location.reload()
    }catch(err){
        console.log(err)
    }
}

// async function markComplete(){
//     const todoId = this.parentNode.dataset.id
//     try{
//         const response = await fetch('todos/markComplete', {
//             method: 'put',
//             headers: {'Content-type': 'application/json'},
//             body: JSON.stringify({
//                 'todoIdFromJSFile': todoId
//             })
//         })
//         const data = await response.json()
//         console.log(data)
//         location.reload()
//     }catch(err){
//         console.log(err)
//     }
// }

// async function markIncomplete(){
//     const todoId = this.parentNode.dataset.id
//     try{
//         const response = await fetch('todos/markIncomplete', {
//             method: 'put',
//             headers: {'Content-type': 'application/json'},
//             body: JSON.stringify({
//                 'todoIdFromJSFile': todoId
//             })
//         })
//         const data = await response.json()
//         console.log(data)
//         location.reload()
//     }catch(err){
//         console.log(err)
//     }
// }


//Calendar
// const date = new Date();

// const renderCalendar = () => {
//   date.setDate(1); //Sets the numeric value of the day of the month to 1

//   const monthDays = document.querySelector(".days");

//   const lastDayOfMonth = new Date(
//     date.getFullYear(),
//     date.getMonth() + 1,
//     0
//   ).getDate(); //Gets last day of current month

//   const prevlastDayOfMonth = new Date(
//     date.getFullYear(),
//     date.getMonth(),
//     0
//   ).getDate(); //Gets the last day of the previous month 

//   const firstDayOfMonthIndex = date.getDay(); //returns the index number of the first day of the month

//   const lastDayOfMonthIndex = new Date(
//     date.getFullYear(),
//     date.getMonth() + 1,
//     0
//   ).getDay(); //returns the index number of the last weekday of the current month

//   const nextDays = 7 - lastDayOfMonthIndex - 1; //To display 6 days FROM the first day of the next month 

//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   document.querySelector(".date h1").innerHTML = months[date.getMonth()]; //Uses month array and getMonth method to display current Month

//   document.querySelector(".date p").innerHTML = new Date().toDateString(); //Displays current date in a readable format

//   let days = "";

//   for (let x = firstDayOfMonthIndex; x > 0; x--) {
//     days += `<div class="prev-date">${prevlastDayOfMonth - x + 1}</div>`;
//   } //Displays the previous month dates in the calendar 

//   for (let i = 1; i <= lastDayOfMonth; i++) { //Display all the days in the calender, i.e., days 1-31
//     if (i === new Date().getDate() && date.getMonth() === new Date().getMonth()) {
//      days += `<div class="today">${i}</div>`; //'days' equals the cuurent day it is, i.e, the highlighted day in the calendar 
//     } else {
//       days += `<div>${i}</div>`;
//     }
//   }

//   for (let n = 1; n <= nextDays; n++) {
//     days += `<div class="next-date">${n}</div>`; //content for the next days
//   }
//   monthDays.innerHTML = days; //displays days for the next month
// };

// document.querySelector(".prev").addEventListener("click", () => { //click event listener to render the PREVIOUS month 
//   date.setMonth(date.getMonth() - 1); //set the month as the current month minus one -> previous month
//   renderCalendar(); //call the global render calendar function
// });

// document.querySelector(".next").addEventListener("click", () => { //click event listener to render the NEXT month 
//   date.setMonth(date.getMonth() + 1); //set the month as the current month plus one -> next month
//   renderCalendar(); //call the global render calendar function
// });

// renderCalendar(); //function to render the calendar
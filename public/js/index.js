function openSideMenu() {
  document.getElementById("side-menu").style.width = "250px";
}

function closeSideMenu() {
  document.getElementById("side-menu").style.width = "0";
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

const buttonSound = new Audio('/btn.mp3');


function startTimer() {
  const seconds = parseInt(this.dataset.time)
  buttonSound.play();
  timer(seconds)
  display.style.display = 'block'
}

buttons.forEach(button => button.addEventListener('click', startTimer))



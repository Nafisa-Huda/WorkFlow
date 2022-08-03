const list = document.querySelectorAll(".list");
list.forEach((clickedList)=>{
    clickedList.addEventListener('click',()=>{
        list.forEach((list=>{
            list.classList.remove("active");
        }))
        clickedList.classList.add("active");
        const clickedTabBGColor=getComputedStyle
        (clickedList).getPropertyValue(
            "color"
        );
        // document.body.style.background=clickedTabBGColor;
    });
});


//motivational quotes
window.addEventListener('load', getFetch)
function getFetch(){
  //const choice = document.querySelector('input').value
  const url = 'https://free-quotes-api.herokuapp.com/' 
  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        document.querySelector('.quote').innerText = data.quote
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

const calendar = document.querySelector('.calendar')
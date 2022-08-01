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
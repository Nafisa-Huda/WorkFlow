//scroll to top button
const scrollBtn = document.querySelector(".scroll");
document.addEventListener("scroll", () => {
  if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
});
if (scrollBtn) {
  scrollBtn.addEventListener("click", topOfPage);
  function topOfPage() {
    document.body.scrollIntoView({
      behavior: "smooth",
    });
  }
}

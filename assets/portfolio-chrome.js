(() => {
 const header=document.querySelector('.portfolio-header');if(!header)return;
 let scheduled=false;
 const update=()=>{scheduled=false;header.classList.toggle('is-scrolled',window.scrollY>12)};
 window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});update();
})();

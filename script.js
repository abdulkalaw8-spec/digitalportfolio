
const root=document.documentElement;

/* Cursor atmosphere */
document.addEventListener("pointermove",e=>{
  root.style.setProperty("--mx",e.clientX+"px");
  root.style.setProperty("--my",e.clientY+"px");
});

/* Mobile navigation */
const menu=document.querySelector(".menu");
const links=document.querySelector(".links");
if(menu && links){
  menu.addEventListener("click",()=>links.classList.toggle("open"));
}

/* Add the page transition curtain and atmospheric streaks */
document.body.insertAdjacentHTML("afterbegin",`
  <div class="page-enter"></div>
  <span class="atmo a1"></span>
  <span class="atmo a2"></span>
  <span class="atmo a3"></span>
`);

/* Reveal content as it enters the viewport */
const revealTargets=document.querySelectorAll(
  ".card,.stat,.item,.contact,.head,.timeline"
);
revealTargets.forEach(el=>el.classList.add("reveal-on-scroll"));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12,rootMargin:"0px 0px -35px 0px"});

revealTargets.forEach(el=>observer.observe(el));

/* Smooth page-to-page transition */
document.querySelectorAll('a[href$=".html"]').forEach(a=>{
  a.addEventListener("click",e=>{
    if(a.origin!==location.origin)return;
    e.preventDefault();
    document.body.classList.add("leaving");
    const curtain=document.createElement("div");
    curtain.className="page-enter";
    curtain.style.animation="none";
    curtain.style.transform="scaleY(0)";
    document.body.appendChild(curtain);
    requestAnimationFrame(()=>{
      curtain.style.transition="transform .55s cubic-bezier(.76,0,.24,1)";
      curtain.style.transform="scaleY(1)";
    });
    setTimeout(()=>location.href=a.href,560);
  });
});

/* Tiny tilt response for the hero artwork */
const visual=document.querySelector(".visual");
if(visual && window.matchMedia("(pointer:fine)").matches){
  visual.addEventListener("pointermove",e=>{
    const r=visual.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    visual.style.transform=`perspective(900px) rotateY(${x*5}deg) rotateX(${y*-4}deg)`;
  });
  visual.addEventListener("pointerleave",()=>{
    visual.style.transform="";
  });
}

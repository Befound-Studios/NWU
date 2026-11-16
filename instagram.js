'use strict';
(() => {
  const grid=document.querySelector('[data-instagram-grid]');
  const status=document.querySelector('[data-ig-status]');
  if(!grid)return;
  const instagram="https://www.instagram.com/overdevoor/";
  let loadedCount=0;
  let lastSync="";
  function refreshLabel(lang){
    if(!status || !loadedCount)return;
    const display=lastSync?new Date(lastSync).toLocaleDateString(lang==='en'?'en-ZA':'af-ZA',{year:'numeric',month:'short',day:'numeric'}):"";
    status.textContent=lang==='en'
      ? 'Latest '+loadedCount+' posts from @overdevoor'+(display?' · Updated '+display:'')+'. Follow our account for more.'
      : 'Jongste '+loadedCount+' plasings van @overdevoor'+(display?' · Bygewerk '+display:'')+'. Volg ons vir meer.';
  }
  document.addEventListener('site-language-change',e=>refreshLabel(e.detail.language));
  async function loadFeed(){
    try{
      const resp=await fetch('./instagram-feed.json',{cache:'no-store'});
      if(!resp.ok)throw Error('Instagram feed data unavailable');
      const data=await resp.json();
      const posts=Array.isArray(data.posts)?data.posts.filter(post=>{
        try{
          const url=new URL(post.permalink);
          const img=new URL(post.image, location.href);
          return /(^|\.)instagram\.com$/.test(url.hostname) && url.protocol==='https:' && img.protocol==='https:' && img.origin===location.origin;
        }catch{return false;}
      }).sort((a,b)=>Date.parse(b.timestamp||0)-Date.parse(a.timestamp||0)).slice(0,4):[];
      if(!posts.length)return; // Honest static-gallery fallback until API is authorised.
      const cards=posts.map(post=>{
        const a=document.createElement('a');
        a.href=post.permalink;a.target='_blank';a.rel='noopener noreferrer';
        const img=document.createElement('img');
        img.src=new URL(post.image, location.href).href;img.alt=post.caption?post.caption.slice(0,140):'Over de Voor Instagram photo';
        img.loading='lazy';img.referrerPolicy='no-referrer';
        const label=document.createElement('span');
        label.textContent=post.caption?post.caption.slice(0,55):'@overdevoor';
        a.append(img,label);return a;
      });
      grid.replaceChildren(...cards);
      loadedCount=cards.length;
      lastSync=data.updated_at||"";
      refreshLabel(document.documentElement.lang);
    }catch(err){/* Keep visible photo-gallery fallback, never invent recent posts. */}
  }
  loadFeed();
})();

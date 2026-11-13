/* Apply a 13px minimum to actual HTML text, including legacy inline labels. SVG artwork is zoomed as a whole. */
document.body.classList.add('readable-ui');
let readingPending=false;
function improveReadability(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const elements=new Set();let node;
 while(node=walker.nextNode()){if(!/[\p{L}\p{N}]/u.test(node.textContent))continue;const el=node.parentElement;if(!el||el.namespaceURI!=='http://www.w3.org/1999/xhtml'||el.closest('script,style,noscript,pre,code,kbd,.sr-only,.sr,[hidden],.icon,.access-icon'))continue;elements.add(el)}
 for(const el of elements){if(el.closest('.nav-label,.brand small'))continue;const css=getComputedStyle(el);if(css.display==='none')continue;const size=parseFloat(css.fontSize);const floor=el.closest('.spectrum-chart-date,.spectrum-data-bar>b')&&innerWidth<=720?12:13;if(size<floor){el.style.setProperty('font-size',floor+'px','important');if(parseFloat(css.lineHeight)<floor*1.3)el.style.setProperty('line-height','1.5','important')}}
 document.querySelectorAll('.svg-review>img').forEach(img=>{const box=document.createElement('div');box.className='ai-canvas';box.tabIndex=0;box.setAttribute('role','region');box.setAttribute('aria-label','Bản AI phóng lớn để đọc chữ. Cuộn ngang để xem các cột, hoặc mở bản toàn kích thước.');img.before(box);box.append(img);const note=document.querySelector('.svg-review>.status-note');if(note)note.textContent='Bản AI được phóng lớn để dễ đọc và giữ nguyên bố cục. Cuộn ngang để xem các cột hoặc mở bản toàn kích thước. Đây vẫn là bản thiết kế tĩnh, chưa phải giao diện AI responsive.'});
 document.querySelectorAll('.ai-canvas img').forEach(img=>{if(img.naturalWidth){const width=Math.ceil(img.naturalWidth)+'px';if(img.style.getPropertyValue('--ai-reading-width')!==width)img.style.setProperty('--ai-reading-width',width)}});
}
const readingObserver=new MutationObserver(()=>{if(readingPending)return;readingPending=true;requestAnimationFrame(()=>{readingPending=false;improveReadability()})});
readingObserver.observe(document.body,{childList:true,subtree:true});document.addEventListener('load',e=>{if(e.target.tagName==='IMG')improveReadability()},true);addEventListener('resize',improveReadability);improveReadability();window.readabilityReady=true;

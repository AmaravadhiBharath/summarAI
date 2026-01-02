const s=async()=>{try{if((await chrome.storage.local.get(["pendingSummaryPaste"])).pendingSummaryPaste){await chrome.storage.local.remove(["pendingSummaryPaste"]);const e=document.createElement("div");e.style.position="fixed",e.style.top="20px",e.style.left="50%",e.style.transform="translateX(-50%)",e.style.backgroundColor="#1a1a1a",e.style.color="white",e.style.padding="12px 24px",e.style.borderRadius="50px",e.style.boxShadow="0 10px 25px rgba(0,0,0,0.2)",e.style.zIndex="99999",e.style.display="flex",e.style.alignItems="center",e.style.gap="12px",e.style.fontFamily="Google Sans, Roboto, Arial, sans-serif",e.style.fontSize="14px",e.style.fontWeight="500",e.style.cursor="pointer",e.style.transition="all 0.2s ease",e.style.opacity="0",e.style.animation="tigerFadeIn 0.5s forwards";const t=document.createElement("style");t.textContent=`
                @keyframes tigerFadeIn {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `,document.head.appendChild(t),e.innerHTML=`
                <span style="font-size: 18px;">🐯</span>
                <span>Summary Ready! Press <b>Cmd+V</b> to paste</span>
                <button style="background: rgba(255,255,255,0.2); border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 8px;">✕</button>
            `;const o=()=>{e.style.opacity="0",setTimeout(()=>e.remove(),300)};e.querySelector("button")?.addEventListener("click",r=>{r.stopPropagation(),o()}),setTimeout(o,1e4),document.body.appendChild(e);const a=document.querySelector(".kix-appview-editor");a&&a.focus()}}catch{}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s):s();
